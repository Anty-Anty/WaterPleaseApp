import React, { useState, useEffect } from "react";

import PlantsList from "../components/PlantsList";
import Map from "../components/Map";
import Modal from "../components/UIElements/Modal";
import AddPlant from "../components/AddPlant";
import EditMap from "../components/EditMap";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import ErrorModal from "../components/UIElements/ErrorModal";
import { useHttpClient } from "../components/hooks/http-hook";

import type { Plant } from "../types/plant";
import type { MapType } from "../types/map";

import "./MainPage.css";

const MainPage = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  /* =========================
     UI STATE
  ========================= */
  const [showAddItem, setShowAddItem] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditMap, setShowEditMap] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [deletingPlantId, setDeletingPlantId] = useState<string | null>(null);

  /* =========================
     DATA STATE
  ========================= */
  const [plants, setPlants] = useState<Plant[]>([]);

  // console.log(plants);

  const [map, setMap] = useState<MapType>({
    columnsNumber: 0,
    selectedSquares: [],
  });

  // selected squares state
  const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
  // temp state while editing map
  const [tempSelectedSquares, setTempSelectedSquares] = useState<number[]>([]);

  /* =========================
     FETCH MAP
  ========================= */
  useEffect(() => {
    const fetchMap = async () => {
      try {
        const responseData = (await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/maps`,
          "GET"
        )) as { map: MapType };

        setMap(responseData.map);
      } catch (err) {}
    };

    fetchMap();
  }, [sendRequest]);

  /* =========================
     SYNC MAP → STATE
  ========================= */
  useEffect(() => {
    if (Array.isArray(map.selectedSquares)) {
      setSelectedSquares(map.selectedSquares);
      setTempSelectedSquares(map.selectedSquares);
    }
  }, [map]);

  /* =========================
     FETCH PLANTS
  ========================= */
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const responseData = (await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/api/plants`,
          "GET"
        )) as { plantsList: Plant[] };
        setPlants(responseData.plantsList);
      } catch (err) {}
    };

    fetchPlants();
  }, [sendRequest]);

  /* =========================
     PLANTS CRUD (LOCAL UI)
  ========================= */
  const upsertPlantHandler = (plantData: Plant) => {
    setPlants((prev) => {
      const exists = prev.some((p) => p.id === plantData.id);
      return exists
        ? prev.map((p) => (p.id === plantData.id ? { ...p, ...plantData } : p))
        : [...prev, plantData];
    });
  };

  /* =========================
     PLANT CREATE API
  ========================= */
  const createPlantHandler = async (plantData: Plant) => {
    try {
      const responseData = (await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/plants/createplant`,
        "POST",
        JSON.stringify({
          img: plantData.img,
          wLevel: plantData.wLevel,
          title: plantData.title,
          lastWateredDate: plantData.lastWateredDate,
          daysToNextWatering: plantData.daysToNextWatering,
        }),
        {
          "Content-Type": "application/json",
        }
      )) as { plant: Plant };

      upsertPlantHandler(responseData.plant);
      setShowAddItem(false);
    } catch (err) {}
  };

  /* =========================
     PLANT UPDATE API
  ========================= */
  const updatePlantHandler = async (plantData: Plant) => {
    try {
      const responseData = (await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/plants/${plantData.id}`,
        "PATCH",
        JSON.stringify({
          title: plantData.title,
          img: plantData.img,
          wLevel: plantData.wLevel,
          lastWateredDate: plantData.lastWateredDate,
          daysToNextWatering: plantData.daysToNextWatering,
          mapPosition: plantData.mapPosition,
          mapId: plantData.mapId,
        }),
        {
          "Content-Type": "application/json",
        }
      )) as { plant: Plant };

      upsertPlantHandler(responseData.plant);
    } catch (err) {}
  };

  /* =========================
     PLANT DELETE API
  ========================= */

  const deletePlantHandler = async () => {
    if (!deletingPlantId) return;

    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/plants/${deletingPlantId}`,
        "DELETE"
      );

      // remove plant from local state
      setPlants((prev) => prev.filter((plant) => plant.id !== deletingPlantId));

      setShowDeleteModal(false);
      setDeletingPlantId(null);
    } catch (err) {}
  };

  /* =========================
     MAP PATCH API
  ========================= */
  const updateMapHandler = async (updatedSquares: number[]) => {
    try {
      const responseData = (await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/maps/editmap`,
        "PATCH",
        JSON.stringify({
          selectedSquares: updatedSquares,
        }),
        {
          "Content-Type": "application/json",
        }
      )) as { map: MapType };

      setMap(responseData.map);
      setSelectedSquares(responseData.map.selectedSquares);
    } catch (err) {}
  };

  /* =========================
     MAP EDITING
  ========================= */
  const showEditMapHandler = () => {
    setTempSelectedSquares(selectedSquares);
    setShowEditMap(true);
  };

  const squareClickHandler = (squareId: number) => {
    setTempSelectedSquares((prev) =>
      prev.includes(squareId)
        ? prev.filter((id) => id !== squareId)
        : [...prev, squareId]
    );
  };

  const submitMapHandler = async () => {
    await updateMapHandler(tempSelectedSquares);
    setShowEditMap(false);
  };

  const mapCancelHandler = () => {
    setTempSelectedSquares(selectedSquares);
    setShowEditMap(false);
  };

  const mapResetHandler = () => {
    setTempSelectedSquares([]);
  };

  /* =========================
   DRAG & DROP (PERSISTED)
========================= */
  const plantDropHandler = async (squareIndex: number, plantId: string) => {
    //  Ensure the plant exists in state
    const plant = plants.find((p) => p.id === plantId);

    if (!plant) {
      console.error("Plant not found in state:", plantId);
      return;
    }

    try {
      //  PATCH to backend using the correct _id
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/plants/${
          plant._id ?? plant.id
        }`,
        "PATCH",
        JSON.stringify({
          mapPosition: squareIndex,
          mapId: map.id,
        }),
        {
          "Content-Type": "application/json",
        }
      ) as { plant: Plant };

      //  Update frontend state
      upsertPlantHandler(responseData.plant);
    } catch (err) {
      console.error("Error updating plant position:", err);
    }
  };

  /* =========================
   REMOVE PLANT FROM MAP
========================= */
  const removePlantFromSquare = async (squareIndex: number) => {
    const plant = plants.find((p) => p.mapPosition === squareIndex);
    if (!plant) return;

    try {
      const responseData = (await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/api/plants/${
          plant._id ?? plant.id
        }`,
        "PATCH",
        JSON.stringify({
          mapPosition: null,
          mapId: map.id,
        }),
        {
          "Content-Type": "application/json",
        }
      )) as { plant: Plant };

      upsertPlantHandler(responseData.plant);
    } catch (err) {}
  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  /* =========================
     JSX
  ========================= */
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />

      {/* {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )} */}

      <div className="main-container">
        {/* PLANTS LIST */}
        <div className="plants-list">
          <div className="plants-list-container">
            <div className="plants-list-item">
              <div></div>
              <div></div>
              <div></div>
              <div>last</div>
              <div>next</div>
              <div></div>
            </div>

            <PlantsList
              plants={plants}
              editingPlantId={editingPlantId}
              setEditingPlantId={setEditingPlantId}
              showDeleteModalHandler={(id: string) => {
                setDeletingPlantId(id);
                setShowDeleteModal(true);
              }}
              onUpdatePlant={updatePlantHandler}
            />

            {!showAddItem && (
              <div className="plants-list-item">
                <button
                  className="add-plant-btn"
                  onClick={() => setShowAddItem(true)}
                >
                  add plant
                </button>
              </div>
            )}

            {showAddItem && (
              <AddPlant
                onSavePlant={createPlantHandler}
                closeAddModalHandler={() => setShowAddItem(false)}
              />
            )}

            <Modal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              footer={
                <>
                  <button type="button" onClick={deletePlantHandler}>
                    delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    cancel
                  </button>
                </>
              }
            >
              <p>Please confirm deletion.</p>
            </Modal>
          </div>
        </div>

        {/* MAP */}
        <div className="map">
          {showEditMap ? (
            <EditMap
              plants={plants}
              DUMMY_MAP={map}
              selectedSquares={tempSelectedSquares}
              squareClickHandler={squareClickHandler}
              submitMapHandler={submitMapHandler}
              mapCancelHandler={mapCancelHandler}
              mapResetHandler={mapResetHandler}
              onPlantDrop={plantDropHandler}
              onRemovePlant={removePlantFromSquare}
            />
          ) : (
            <Map
              plants={plants}
              selectedSquares={selectedSquares}
              showEditMapHandler={showEditMapHandler}
              DUMMY_MAP={map}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MainPage;
