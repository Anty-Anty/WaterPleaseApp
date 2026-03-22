import React from "react";

import { formatDisplayDate, addDays } from "./util/days";
import { Plant as PlantType } from "../types/plant";
import "./Plant.css";

interface PlantProps
  extends Pick<
    PlantType,
    | "id"
    | "img"
    | "wLevel"
    | "title"
    | "lastWateredDate"
    | "daysToNextWatering"
    | "mapPosition"
  > {
  setEditingPlantId: (id: string | null) => void;
  showDeleteModalHandler: (id: string) => void;
}

const Plant: React.FC<PlantProps> = (props) => {
  return (
    <>
      <li className="plants-list-item">
        <div className="container-plant-logo">
          <img
            src={`images/plant_${props.img}.svg`}
            alt={`plant_${props.img}`}
            className="plant-logo"
          />
        </div>
        <div className="container-plant-logo">
          <img
            src={`images/water_${props.wLevel}.svg`}
            alt={`plant_${props.wLevel}`}
            className="wLevel-logo"
          />
        </div>
        <div>{props.title}</div>
        <div>{formatDisplayDate(props.lastWateredDate)}</div>
        <div>{addDays(props.lastWateredDate, props.daysToNextWatering)}</div>

        {/* <div className="button-stack">
                            <button onClick={props.showEditModalHandler}>edit</button>
                            <button onClick={props.showDeleteModalHandler}>delete</button>
                        </div> */}

        <div className="plant-button-stack">
          <button onClick={() => props.setEditingPlantId(props.id)}>✎</button>
          <button onClick={() => props.showDeleteModalHandler(props.id)}>
            🗑
          </button>
        </div>
      </li>
    </>
  );
};

export default Plant;
