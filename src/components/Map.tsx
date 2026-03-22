import React from "react";

import "./Map.css";
import { daysUntilNextWatering } from "./util/days";
import { Plant as PlantType } from "../types/plant";
import { MapType } from "../types/map";

interface MapProps {
  DUMMY_MAP: MapType;
  selectedSquares: number[];
  plants: PlantType[];
  showEditMapHandler: () => void;
}

const Map: React.FC<MapProps> = (props) => {
  const columnsNumber = props.DUMMY_MAP.columnsNumber;
  const SquaresNumber = Math.pow(columnsNumber, 2);

  return (
    <>
      <div
        className="map-container"
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
              className={`map-container-item 
              ${isLastInRow ? "last-in-row" : ""} 
              ${isLastRow ? "last-row" : ""}
              ${isSelected ? "selected" : ""}
              `}
            >
              {plant && (
                <div className="logo-option-map">
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
        <div className="map-btn">
          <button onClick={props.showEditMapHandler}>✎</button>
          {/* <button>✔</button>
          <button>✖</button>
          <button>🗘</button> */}
        </div>
      </div>
    </>
  );
};

export default Map;
