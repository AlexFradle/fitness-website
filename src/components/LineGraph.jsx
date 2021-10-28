import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import Plot from "react-plotly.js";
import Papa from "papaparse/papaparse";
import fitnessData from "../fitness.json";
import {linearRegression} from "simple-statistics"

let graphData = {};
const allExercises = [];

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

    const handleExerciseSelectChange = ({target}) => {
        setGraphData(target.value);
        const exerciseMap = {
            "Bench Press (Barbell)": "Bench Press",
            "Incline Bench Press (Barbell)": "Incline Bench Press",
            "Deadlift (Barbell)": "Deadlift",
            "Sumo Deadlift (Barbell)": "Sumo Deadlift",
            "Squat (Barbell)": "Back Squat",
            "Pull Up": "Pull-up",
            "Chin Up": "Chin-up",
            "Overhead Press (Barbell)": "Overhead Press"
        };

        if (exerciseMap[target.value] !== undefined) {
            setAverageGraphData(exerciseMap[target.value]);
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
        const temp = {};
        for (const key in averageData) {
            temp[key] = parseInt(fitnessData[gender][weight][exerciseKey[exerciseName]][i].match(/-?\d+/), 10);
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

    return (
        <div>
            <select onChange={handleGenderSelectChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <input type="number" onChange={handleWeightChange} min="20" max="200"/>
            <input type="number" onChange={handleAgeChange} min="14" max="90"/>

            <input type="file" name="file" onChange={handleFileChange}/>
            <button onClick={setGraphData}>press</button>
            <button onClick={makeLine}>press line</button>
            <br/>
            <select onChange={handleExerciseSelectChange}>
                {allExercises.map(name => {
                    return <option value={name} key={name}>{name}</option>
                })}
            </select>
            <Plot
                data={[
                    {
                        x: xData,
                        y: yData,
                        connectgaps: true,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: { color: props.lineColor }
                    },
                    {
                        x: repXData,
                        y: repYData,
                        connectgaps: true,
                        yaxis: "y2",
                        type: "scatter",
                        mode: "lines+markers",
                        marker: { color: "#009bff" }
                    },
                ]}
                layout={{
                    width: 1000,
                    height: 500,
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
                        tickfont: {color: props.fontColor}
                    },
                    yaxis2: {
                        title: 'Total Reps',
                        titlefont: {color: "#009bff"},
                        tickfont: {color: "#009bff"},
                        overlaying: 'y',
                        side: 'right'
                    },
                    shapes: [
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
                        },
                    ],
                    annotations: [
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
                    ]
                }}
            />
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