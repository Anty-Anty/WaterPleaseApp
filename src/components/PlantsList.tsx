import React from "react";

import Plant from "./Plant";
import EditPlant from "./EditPlant";
import { Plant as PlantType } from "../types/plant";

interface PlantsListProps {
  plants: PlantType[];
  editingPlantId: string | null;
  onUpdatePlant: (plant: PlantType) => void;
  setEditingPlantId: (id: string | null) => void;
  showDeleteModalHandler: (id: string) => void;
}

const PlantsList: React.FC<PlantsListProps> = (props) => {
  //check if there are plants
  // if (props.items.length === 0) {
  //     return (
  //         <div className='items-list'>
  //              <div className='item'>
  //                 Plants list is empty.
  //             </div>
  //         </div>
  //     );
  // }

  // render list of items

  return (
    <ul>
      {props.plants.map((plant) => {
        if (props.editingPlantId === plant.id) {
          return (
            <EditPlant
              key={plant.id}
              id={plant.id}
              img={plant.img}
              wLevel={plant.wLevel}
              title={plant.title}
              logoList={props.plants}
              lastWateredDate={plant.lastWateredDate}
              daysToNextWatering={plant.daysToNextWatering}
              // plant={plant}
              onUpdatePlant={props.onUpdatePlant}
              closeEditModalHandler={() => props.setEditingPlantId(null)}
            />
          );
        }
        return (
          <Plant
            key={plant.id}
            id={plant.id}
            img={plant.img}
            wLevel={plant.wLevel}
            title={plant.title}
            lastWateredDate={plant.lastWateredDate}
            daysToNextWatering={plant.daysToNextWatering}
            mapPosition={plant.mapPosition}
            setEditingPlantId={props.setEditingPlantId}
            // showEditModalHandler={()=>props.showEditModalHandler(plant.id)} //pass the edited item Id
            // showDeleteModalHandler={()=>props.showDeleteModalHandler(plant.id)} //pass the edited item Id
            showDeleteModalHandler={props.showDeleteModalHandler} //pass the edited item Id
          />
        );
      })}
    </ul>
  );
};

export default PlantsList;
