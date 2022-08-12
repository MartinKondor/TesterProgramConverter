import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import table from './table.json';
import { KTX, KTXPrep } from './KTX';


function App() {
  const [input, setInput] = useState("A1-C1\nA32-C32\nA2-A4-C2\nA3-A5\nA65-A66");
  const [output, setOutput] = useState("");
  const [outputAda, setOutputAda] = useState("");
  const [ktxContent, setKtxContent] = useState("");
  let is64 = true;
  let zarlatokSzama = 0;

  function handleChange({ target }, data, setData) {
    setData(target.value);
  }

  function convert({ target }) {
    const lines = input.split("\n");
    const numbers = {
      // "i": legissebb zárlat szám
    };

    for (const line of lines) {
      try {
        const portNames = line.split("-");
        zarlatokSzama += portNames.length - 1;
        let currNumbers = [];
        let zarlatSzam = 256;

        for (const portName of portNames) {
          if (table.table[portName] > 128) {
            is64 = false;
          }
          if (zarlatSzam > table.table[portName]) {
            zarlatSzam = table.table[portName];
          }
          currNumbers.push(table.table[portName]);
        }

        for (let n of currNumbers) {
          numbers[n] = zarlatSzam;
        }

      }
      catch (e) {
        alert("Probléma a bemenettel:\n" + e);
      }
    }

    let outputStr = is64?"64\n":"128\n";
    outputStr += `${zarlatokSzama}\n`;

    for (let i = 0; i < (is64?64:128); i++) {
      if (Object.keys(numbers).includes(String(i))) {
        outputStr += String(numbers[i]) + "\n";
      }
      else {
        outputStr += String(i) + "\n";
      }
    }

    setOutput(outputStr);
  }

  function download({ target }) {
    if (output.trim().length > 0) {
      const element = document.createElement("a");
      const file = new Blob([output], {
        type: "text/plain"
      });
      element.href = URL.createObjectURL(file);
  
      const fileName = prompt("Mi legyen a fájl neve? (kiterjesztéssel)");
      if (fileName) {
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
      }
    }
  }

  function conovertAda({ target }) {
    let groups = [];
    const lines = input.split("\n");

    for (let line of lines) {
      const portNames = line.split("-");
      let group = [];
      for (let portName of portNames) {
        group.push(table.table[portName]);
      }
      groups.push(group);
    }
    
    const prep = KTXPrep(groups, lines);
    const content = KTX(null, prep["groups"]);
    setKtxContent(content);
    setOutputAda(content);
  }

  function downloadAda({ target }) {
    if (outputAda.trim().length > 0) {
      const element = document.createElement("a");
      const fileName = prompt("Mi legyen a fájl neve? (kiterjesztéssel)");

      if (fileName) {
        const file = new Blob([KTX(fileName, ktxContent)], {
          type: "text/plain"
        });        
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
      }
    }
  }

  return (
    <div className="App">
      <header className="pt-4 pb-4 bg-info text-white">
        <h1 className="font-weight-bold">Teszter Program Konvertáló</h1>
      </header>

      <main className="pb-5 pt-4 pl-5 pr-5">
        <div className="row">
          <div className="col-sm">
            <h4>Bemenet</h4>
            <textarea className="form-control mb-3" cols={8} rows={16} value={input} onChange={e=>handleChange(e,input,setInput)} />
          </div>
          <div className="col-sm">
            <h4>Hagyományos Teszterhez</h4>
            <textarea className="form-control mb-3" cols={8} rows={16} value={output} onChange={e=>handleChange(e,output,setOutput)} />
            <button className="btn btn-lg btn-block font-weight-bold btn-primary" onClick={convert}>Konvertálás</button>
            <button className="btn btn-lg btn-block font-weight-bold btn-success" onClick={download}>Mentés</button>
          </div>
          <div className="col-sm">
            <h4>Adaptronic Teszterhez</h4>
            <textarea className="form-control mb-3" cols={8} rows={16} value={outputAda} onChange={e=>handleChange(e,outputAda,setOutputAda)} />
            <button className="btn btn-lg btn-block font-weight-bold btn-primary" onClick={conovertAda}>Konvertálás</button>
            <button className="btn btn-lg btn-block font-weight-bold btn-success" onClick={downloadAda}>Mentés</button>
          </div>
        </div>
      </main>

      <footer className="pt-4 pb-4 bg-info text-white">
        <p className="small">Copyright &copy; 2022 <a className="font-weight-bold text-white" target="_blank" href="https://MartinKondor.github.io/">Martin Kondor</a></p>
      </footer>
    </div>
  );
}

export default App;
