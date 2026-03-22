import React, { useState } from "react";

import Input from "./FormElements/Input";
import LogoPicker from "./UIElements/LogoPicker";
import CustomDateInput from "./UIElements/CustomDateInput";
import NextWaterDateInput from "./UIElements/NextWaterDateInput";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_MAX_TODAY,
  VALIDATOR_MIN,
} from "./util/validators";
import { useForm } from "./hooks/form-hook";
import { useImagesList } from "./hooks/ImagesList-hook";
import { Plant as PlantType } from "../types/plant";

import "./AddEditPlant.css";

interface AddPlantProps {
  onSavePlant: (plant: PlantType) => void;
  closeAddModalHandler: () => void;
}

const AddPlant: React.FC<AddPlantProps> = (props) => {
  //IOS calender fix
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 1 &&
        navigator.userAgent.includes("Mac")));

  //hook creates lists of available images
  const logos = useImagesList("plant");
  const wLogos = useImagesList("water");

  //state controles visibility of logoPicker.jsx
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const openLogoPickerHandler = () => setShowLogoPicker(true);
  const closeLogoPickerHandler = () => setShowLogoPicker(false);

  //state controles visibility of logoPicker.jsx
  const [showWLogoPicker, setShowWLogoPicker] = useState(false);
  const openWLogoPickerHandler = () => setShowWLogoPicker(true);
  const closeWLogoPickerHandler = () => setShowWLogoPicker(false);

  // state stores logo picked in logoPicker.jsx and logo from PlantsList.jsx
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  const [selectedWLogo, setSelectedWLogo] = useState<string | null>(null);

  // state stores lastWateredDated initially recieved from DataBase or everytime its updated in CustomDateInput
  // const [lastWateredDate, setLastWateredDate] = useState(props.lastWateredDate || "");

  // const dateInputHandler = (id, value, isValid) => {
  //     if (id === "lastWateredDate") {
  //         setLastWateredDate(value);
  //     }
  // };

  //form hook
  const [formState, inputHandler] = useForm(
    {
      plant: {
        value: "",
        isValid: false,
      },
      lastWateredDate: {
        value: "",
        isValid: false,
      },
      daysToNextWatering: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const submitHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    //SUBMIT
    props.onSavePlant({
      id: crypto.randomUUID(),
      title: formState.inputs.plant.value as string,
      lastWateredDate: formState.inputs.lastWateredDate.value as string,
      daysToNextWatering: Number(formState.inputs.daysToNextWatering.value),
      img: selectedLogo || "1",
      wLevel: selectedWLogo ? Number(selectedWLogo) : 1,
      mapPosition: null,
    });

    props.closeAddModalHandler();
  };

  return (
    <>
      <form onSubmit={submitHandler} className="plants-list-item">
        {/* plant logo */}
        <div className="add-edit-plant-logo">
          {/* shows eaither logo picked in logoPicker.jsx or logo from PlantsList.jsx */}
          {selectedLogo ? (
            <img
              onClick={openLogoPickerHandler}
              src={`images/plant_${selectedLogo}.svg`}
              alt={`plant_${selectedLogo}`}
              className="plant-logo"
            />
          ) : (
            <img
              onClick={openLogoPickerHandler}
              src={`images/plant_bw.svg`}
              alt={`plant_bw`}
              className="plant-logo"
            />
          )}

          {showLogoPicker && (
            <LogoPicker
              show={showLogoPicker}
              onCancel={closeLogoPickerHandler}
              availableLogos={logos}
              basename={"plant"}
              selectedLogo={selectedLogo}
              onSelect={(logo: string) => {
                setSelectedLogo(logo);
                setShowLogoPicker(false);
              }}
            />
          )}
        </div>
        {/* water level logo*/}
        <div>
          <div className="add-edit-plant-logo">
            {selectedWLogo ? (
              <img
                onClick={openWLogoPickerHandler}
                src={`images/water_${selectedWLogo}.svg`}
                alt={`water_${selectedWLogo}`}
                className="wLevel-logo"
              />
            ) : (
              <img
                onClick={openWLogoPickerHandler}
                src={`images/water_bw.svg`}
                alt="water_bw"
                className="wLevel-logo"
              />
            )}

            {showWLogoPicker && (
              <LogoPicker
                show={showWLogoPicker}
                onCancel={closeWLogoPickerHandler}
                availableLogos={wLogos}
                basename={"water"}
                selectedLogo={selectedWLogo}
                onSelect={(wLogo: string) => {
                  setSelectedWLogo(wLogo);
                  setShowWLogoPicker(false);
                }}
              />
            )}
          </div>
        </div>
        {/* plant name */}
        <div>
          <Input
            id="plant"
            element="input"
            name="toDoItem"
            placeholder="enter plant name"
            className="add-input"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
            errorText="Enter a valid plant name — 1 to 50 characters required."
            onInput={inputHandler}
          />
        </div>

        {/* Last Watering Date */}
        <div>
          {isIOS ? (
            //IOS calender
            <div className="input-wrapper">
              <input
                type="date"
                name="lastWateredDate"
                value={(formState.inputs.lastWateredDate.value as string) || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  inputHandler(
                    "lastWateredDate",
                    value,
                    value.trim() !== "" // or your validate() util if you prefer
                  );
                }}
                onBlur={() =>
                  inputHandler(
                    "lastWateredDate",
                    formState.inputs.lastWateredDate.value,
                    formState.inputs.lastWateredDate.isValid
                  )
                }
                className="native-date-input"
              />
            </div>
          ) : (
            //Windows calender
            <CustomDateInput
              id="lastWateredDate"
              placeholder="Last Watering"
              //   initialValue={props.lastWateredDate}
              validators={[VALIDATOR_MAX_TODAY()]}
              errorText="Please select a valid date."
              // onInput={dateInputHandler}
              onInput={inputHandler}
            />
          )}
        </div>

        {/* Next Watering Date */}
        <div>
          <NextWaterDateInput
            id="daysToNextWatering"
            placeholder="Set interval"
            lastWateredDate={formState.inputs.lastWateredDate.value as string}
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MIN(1)]}
            errorText="Please enter at least 1 day."
            onInput={inputHandler}
          />
        </div>

        {/* <div className="button-stack">
                            <button onClick={props.showEditModalHandler}>edit</button>
                            <button onClick={props.showDeleteModalHandler}>delete</button>
                        </div> */}

        <div className="add-edit-plant-button-stack">
          <button
            type="submit"
            disabled={!formState.isValid}
            className={`btn ${!formState.isValid ? "btn-disabled" : ""}`}
          >
            ✔
          </button>
          <button type="button" onClick={props.closeAddModalHandler}>
            ✖
          </button>
        </div>
      </form>
    </>
  );
};

export default AddPlant;
