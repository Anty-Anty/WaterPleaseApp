import React from "react";

import "./EditMap.css";
import { daysUntilNextWatering } from "./util/days";
import { Plant as PlantType } from "../types/plant";
import { MapType } from "../types/map";

interface EditMapProps {
  DUMMY_MAP: MapType;
  plants: PlantType[];
  selectedSquares: number[];
  squareClickHandler: (index: number) => void;
  submitMapHandler: () => void;
  mapCancelHandler: () => void;
  mapResetHandler: () => void;
  onPlantDrop: (squareIndex: number, plantId: string) => void;
  onRemovePlant: (squareIndex: number) => void;
}

const EditMap: React.FC<EditMapProps> = (props) => {
  const columnsNumber = props.DUMMY_MAP.columnsNumber;
  const SquaresNumber = Math.pow(columnsNumber, 2);

  //drag&drop:
  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, squareIndex: number) => {
    e.preventDefault();
    const plantId = e.dataTransfer.getData("plantId");

    props.onPlantDrop(squareIndex, plantId);
  };

  return (
    <>
      <div
        className="map-container-edit"
        style={{ "--columns-number": columnsNumber } as React.CSSProperties}
      >
        {/* MAP GRID */}
        {Array.from({ length: SquaresNumber }, (_, i) => {
          // creates table of squares
          const index = i + 1;
          // adds right border
          const isLastInRow = index % columnsNumber === 0; // 7, 14, 21, ...
          // adds bottom border
          const isLastRow = index > SquaresNumber - columnsNumber; // 43–49
          // adds background to selected square
          const isSelected = props.selectedSquares.includes(index);

          //derive plant from plants[]
          const plant = props.plants.find((p) => p.mapPosition === index);

          // calculate days
          const days =
            plant?.lastWateredDate && plant?.daysToNextWatering
              ? daysUntilNextWatering(
                  plant.lastWateredDate,
                  plant.daysToNextWatering
                )
              : null;

          return (
            <div
              key={index}
              onClick={() => props.squareClickHandler(index)}
              className={`map-container-item 
                             ${isLastInRow ? "last-in-row" : ""} 
                             ${isLastRow ? "last-row" : ""}
                             ${isSelected ? "selected" : ""}
                            `}
              //drag&drop:
              onDragOver={allowDrop}
              onDrop={(e) => onDrop(e, index)}
            >
              {plant && (
                <div
                  className="logo-option-map"
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation(); // prevent square select
                    props.onRemovePlant(index);
                  }}
                >
                  <img
                    src={`images/plant_${plant.img}.svg`}
                    alt={plant.title}
                    className="plant-logo"
                  />

                  {days !== null && (
                    <div
                      className={`daysUntilNextWatering ${
                        days < 0 ? "overdue" : ""
                      }`}
                    >
                      {days}
                    </div>
                  )}
                </div>
              )}

              {/* {index} */}
            </div>
          );
        })}

        {/* BUTTONS */}
        <div className="map-btn-edit">
          <button onClick={props.submitMapHandler}>✔</button>
          <button onClick={props.mapCancelHandler}>✖</button>
          <button onClick={props.mapResetHandler}>🗘</button>
        </div>

        <div className="plant-list-edit">
          <div className="plant-list-title">
            <h3>edit map</h3>
            <p>drag and drop plant on the map</p>
          </div>
          <div className="plant-list-picker">
            {props.plants.map((plant) => (
              <div
                key={plant.id}
                className="logo-option"
                //drag&drop:
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                  e.dataTransfer.setData("plantId", plant.id);
                }}
                // onClick={() => { props.onSelect(plant.img); }}
              >
                <img
                  src={`images/plant_${plant.img}.svg`}
                  alt={`plant_${plant.img}`}
                  className="plant-logo"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMap;
