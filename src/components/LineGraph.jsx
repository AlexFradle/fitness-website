import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import Plot from "react-plotly.js";
import Papa from "papaparse/papaparse";
import fitnessData from "../fitness.json";
import coeffs from "../coefficients.json";
import colours from "../colours.json";
import {linearRegression} from "simple-statistics";
import Skeleton from "./Skeleton";
import ExerciseSelect from "./ExerciseSelect"

let graphData = {};
const allExercises = [];
const exerciseKey = {
    "Back Squat": 0,
    "Front Squat": 1,
    "Deadlift": 2,
    "Sumo Deadlift": 3,
    "Power Clean": 4,
    "Bench Press": 5,
    "Incline Bench Press": 6,
    "Dip": 7,
    "Overhead Press": 8,
    "Push Press": 9,
    "Snatch Press": 10,
    "Chin-up": 11,
    "Pull-up": 12,
    "Pendlay Row": 13
};

const LineGraph = props => {
    const highest = obj => Math.max(...obj.weight);

    const [weight, setWeight] = useState(0);
    const [age, setAge] = useState(0);
    const [gender, setGender] = useState("male");
    const [xData, setXData] = useState([]);
    const [yData, setYData] = useState([]);
    const [repXData, setRepXData] = useState([]);
    const [repYData, setRepYData] = useState([]);
    const [yMax, setYMax] = useState(0);
    const [averageData, setAverageData] = useState({
        "untrained": 0,
        "novice": 0,
        "intermediate": 0,
        "proficient": 0,
        "advanced": 0,
        "exceptional": 0,
        "elite": 0,
        "world class": 0,
    });

    const loadData = file => {
        Papa.parse(file, {
            worker: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            step: ({data}) => {
                if (!allExercises.includes(data["Exercise Name"])) allExercises.push(data["Exercise Name"]);
                if (graphData[data["Date"]] === undefined) {
                    graphData = {
                        ...graphData,
                        [data["Date"]]: {
                            [data["Exercise Name"]]: {
                                "reps": [data["Reps"]],
                                "weight": [data["Weight"]]
                            }
                        }
                    };
                } else if (graphData[data["Date"]][data["Exercise Name"]] === undefined) {
                    graphData[data["Date"]][data["Exercise Name"]] = {
                        "reps": [data["Reps"]],
                        "weight": [data["Weight"]]
                    };
                } else {
                    graphData[data["Date"]][data["Exercise Name"]]["reps"].push(data["Reps"]);
                    graphData[data["Date"]][data["Exercise Name"]]["weight"].push(data["Weight"]);
                }
            }
        });
    };

    const handleGenderSelectChange = ({target}) => {setGender(target.value); console.log(target.value)};

    const handleWeightChange = ({target}) => {setWeight(target.value); console.log(target.value)};

    const handleAgeChange = ({target}) => {setAge(target.value); console.log(target.value)};

    const handleFileChange = ({target}) => {
        const f = target.files[0];
        loadData(f);
    };

    const handleExerciseSelectChange = name => {
        setGraphData(name);
        const exerciseMap = {
            "Bench Press (Barbell)": "Bench Press",
            "Incline Bench Press (Barbell)": "Incline Bench Press",
            "Deadlift (Barbell)": "Deadlift",
            "Sumo Deadlift (Barbell)": "Sumo Deadlift",
            "Squat (Barbell)": "Back Squat",
            "Front Squat (Barbell)": "Front Squat",
            "Pull Up": "Pull-up",
            "Chin Up": "Chin-up",
            "Overhead Press (Barbell)": "Overhead Press"
        };

        if (exerciseMap[name] !== undefined) {
            setAverageGraphData(exerciseMap[name]);
        } else {
            setAverageData({
                "untrained": 0,
                "novice": 0,
                "intermediate": 0,
                "proficient": 0,
                "advanced": 0,
                "exceptional": 0,
                "elite": 0,
                "world class": 0,
            });
        }
    };

    const setGraphData = exerciseName => {
        const newXData = Object.keys(graphData).map(date => date.split(" ")[0]);
        setXData(newXData);
        setRepXData(newXData);

        const newYData = Object.values(graphData).map(
            (exercises) =>
                Object.keys(exercises).includes(exerciseName) ?
                      highest(exercises[exerciseName] !== null ? exercises[exerciseName] : null) : null
        );
        setYData(newYData);

        const newRepYData = Object.values(graphData).map(
            (exercises) =>
                Object.keys(exercises).includes(exerciseName) ?
                    exercises[exerciseName].reps.reduce((acc, cv) => acc + cv) : null
        );
        setRepYData(newRepYData);

        setYMax(Math.max(...newYData));
    };

    const setAverageGraphData = exerciseName => {
        let i = 1;
        const temp = {};
        for (const key in averageData) {
            temp[key] = parseInt(fitnessData[gender][weight][exerciseKey[exerciseName]][i].match(/-?\d+/), 10);
            if (age < 23 || age > 40) temp[key] = Math.ceil(temp[key] / coeffs[age]);
            i += 1;
        }
        setAverageData(temp);
    };

    const makeLine = () => {
        let x = [...Array(xData.length).keys()];
        const deleteArr = [];
        for (let i = 0; i < xData.length; i++) {
            if (yData[i] === null) {
                deleteArr.push(i);
            }
        }
        x = x.filter((n, ind) => !deleteArr.includes(ind));
        const y = yData.filter(n => n !== null);
        console.log(x, y);
        console.log(linearRegression([x, y]));
    };

    const getShapes = () => {
        const newLines = [
            {
                type: 'line',
                xref: "paper",
                x0: 0,
                y0: yMax,
                x1: 1,
                y1: yMax,
                line: {
                    color: "#FF0000",
                }
            }
        ];
        if (Object.values(averageData).reduce((acc, cv) => acc + cv) !== 0) {
            for (const [name, num] of Object.entries(averageData)) {
                newLines.push({
                    type: 'line',
                    xref: "paper",
                    x0: 0,
                    y0: num,
                    x1: 1,
                    y1: num,
                    line: {
                        color: colours[name],
                    },
                    opacity: 0.5
                });
            }
        }
        return newLines;
    };

    const getAnnotations = () => {
        const newAnnotations = [
            {
                xref: 'paper',
                x: 0,
                xanchor: 'right',
                y: yMax,
                yanchor: 'bottom',
                text: `${yMax}`,
                showarrow: false,
                font: {color: "#FF0000"}
            }
        ];
        if (Object.values(averageData).reduce((acc, cv) => acc + cv) !== 0) {
            for (const [name, num] of Object.entries(averageData)) {
                newAnnotations.push({
                    xref: 'paper',
                    x: 0,
                    xanchor: 'right',
                    y: num,
                    yanchor: 'bottom',
                    text: `${num}`,
                    showarrow: false,
                    font: {color: colours[name], size: 10}
                });
            }
        }
        return newAnnotations;
    };

    const getLineData = () => {
        const arr = [
            {
                x: xData,
                y: yData,
                connectgaps: true,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: props.lineColor }
            }
        ];
        if (1 === 1) {
            arr.push({
                x: repXData,
                y: repYData,
                connectgaps: true,
                yaxis: "y2",
                type: "scatter",
                mode: "lines+markers",
                opacity: 0.2,
                marker: { color: "#009bff" }
            });
        }
        return arr;
    };

    const getLayoutData = () => {
        const obj = {
            width: 1500,
            height: 700,
            plot_bgcolor: props.backgroundColor,
            paper_bgcolor: props.backgroundColor,
            titlefont: {color: props.fontColor},
            xaxis: {
                gridcolor: props.gridColor,
                linecolor: props.fontColor,
                tickfont: {color: props.fontColor}
            },
            yaxis: {
                title: "Highest Weight (kg)",
                gridcolor: props.gridColor,
                linecolor: props.fontColor,
                titlefont: {color: props.fontColor},
                tickfont: {color: props.fontColor},
            },
            shapes: getShapes(),
            annotations: getAnnotations()
        };
        if (1 === 1) {
            obj.yaxis2 = {
                title: 'Total Reps',
                titlefont: {color: "#009bff"},
                tickfont: {color: "#009bff"},
                overlaying: 'y',
                side: 'right',
                showgrid: false
            };
        }

        return obj;
    };

    return (
        <div>
            <div className="menu">
                <label htmlFor="gender-select">Gender Selection: </label>
                <select onChange={handleGenderSelectChange} id="gender-select">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <label htmlFor="weight-input">Weight (kg): </label>
                <input type="number" onChange={handleWeightChange} min="20" max="200" id="weight-input"/>
                <label htmlFor="age-input">Age: </label>
                <input type="number" onChange={handleAgeChange} min="14" max="90" id="age-input"/>

                <input type="file" name="file" onChange={handleFileChange}/>
                <button onClick={setGraphData}>Load</button>
            </div>

            <button onClick={makeLine}>press line</button>
            <Plot className="plot"
                data={getLineData()}
                layout={getLayoutData()}
            />
            <table>
                <thead>
                    <tr>
                        <td>Strength Level</td>
                        <td>Weight (kg)</td>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(averageData).map(([name, num]) => {
                        return (
                            <tr>
                                <td style={{color: colours[name]}}>{name}</td>
                                <td>{num}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <br/>
            <div className="exercise-and-skeleton-container">
                <ExerciseSelect onChange={handleExerciseSelectChange} allExercises={allExercises}/>
                <Skeleton gender={gender}/>
            </div>
        </div>
    );
}

LineGraph.propTypes = {
    lineColor: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    gridColor: PropTypes.string.isRequired,
    fontColor: PropTypes.string.isRequired
};

LineGraph.defaultProps = {

};

export default LineGraph;