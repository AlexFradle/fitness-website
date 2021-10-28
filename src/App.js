import logo from './logo.svg';
import './App.css';
import LineGraph from "./components/LineGraph";

function App() {
    return (
        <div className="App">
            <header className="App-header">

            </header>
            <main>
                <LineGraph backgroundColor="#05000A" gridColor="#21033f" lineColor="#6609C3" fontColor="#FFF"/>
            </main>
        </div>
    );
}

export default App;
