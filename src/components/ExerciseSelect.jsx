import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";

const ExerciseSelect = props => {
    const [selectedExercise, setSelectedExercise] = useState("");

    const handleClick = ({target}) => {
        setSelectedExercise(target.innerText);
        props.onChange(target.innerText);
    };

    return (
        <div className="exercise-outside">
            <div className="exercise-container">
                {props.allExercises.map(name => {
                    console.log(name);
                    return (
                        <div
                            className={"exercise-item " + (name === selectedExercise ? "selected" : "")}
                            key={name}
                            onClick={handleClick}>

                            {name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

ExerciseSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    allExercises: PropTypes.array.isRequired
};

export default ExerciseSelect;
