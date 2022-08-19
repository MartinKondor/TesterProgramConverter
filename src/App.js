import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import table from './table.json';
import { KTX, KTXPrep } from './KTX';


function App() {
  const [input, setInput] = useState("A1-C1\nA32-C32\nA2-A4-C2\nA3-A5\nA65-C70\nA43-C43\n");
  const [inputCorr, setInputCorr] = useState("");
  //const [input, setInput] = useState("A1-C1\nA32-C32\n");
  
  const [saveState, setSaveState] = useState({
    input: "",
    outputAda: "",
    fileContents: []  // outputs
  });

  const [output, setOutput] = useState("");
  const [outputAda, setOutputAda] = useState("");
  const [ktxContent, setKtxContent] = useState("");
  const [radioBoxes, setRadioBoxes] = useState(0);
  const [checkRadioBoxes, setCheckRadioBoxes] = useState([]);
  const [fileContents, setFileContents] = useState([]);
  const [outputWriteableAda, setOutputWriteableAda] = useState(false);

  let is64 = true;
  let zarlatokSzama = 0;

  function handleChange({ target }, data, setData) {
    setData(target.value);
  }

  function convert({ target }) {
    setRadioBoxes(0);
    setCheckRadioBoxes([]);
    setFileContents([]);
    setOutputAda("");
    setOutputWriteableAda(false);

    /////////////////////////////////////////////////
    let numberOfFiles = 5;
    let files = [];
    let filesNumbers = [];
    let filesParity = [];
    let filesZarlatokSzama = [];
    let groups = [];

    for (let i = 0; i < numberOfFiles; i++) {
        files.push("");
        filesNumbers.push({});
        filesParity.push(64);
        filesZarlatokSzama.push(0);
    }

    const lines = input.toUpperCase().split("\n");

    for (let line of lines) {
      if (line.trim().length == 0) {
        continue;
      }

      let parts = line.split("-");
      if (parts.length < 2) {
        continue;
      }

      let biggest = 0;
      let currNumbers = [];
      let currfilesParity = 64;

      for (let part of parts) {
        if (biggest < parseInt(part.substring(1,part.length))) {
          biggest = parseInt(part.substring(1,part.length));
        }
      }

      let fileIndex = parseInt(biggest / 64);

      for (let part of parts) {
        if (parseInt(part.substring(1,part.length)) > 32) {
            currfilesParity = 128;
        }
        currNumbers.push(table.table[part] - (fileIndex*64));
      }

      filesParity[fileIndex] = currfilesParity - (fileIndex*64);

      let zarlatSzam = currNumbers[0];
      for (let n of currNumbers) {
        if (n < zarlatSzam) {
          zarlatSzam = n;
        }
      }

      let counter = 0;
      for (let n of currNumbers) {

          // Kivonás a többi fájlból
          filesNumbers[fileIndex][String(n - (fileIndex*64))] = zarlatSzam - (fileIndex*64);
          counter += 1;
      }
      filesZarlatokSzama[fileIndex] += parts.length - 1;
      groups.push(currNumbers);

      //console.log(groups);
    }

    for (let j = 0; j < files.length; j++) {
        let outputStr = filesParity[j]===64 ? "64\n" : "128\n";
        outputStr += `${filesZarlatokSzama[j]}\n`;

        for (let i = 0; i < filesParity[j]; i++) {
          if (Object.keys(filesNumbers[j]).includes(String(i))) {
            outputStr += String(filesNumbers[j][String(i)]) + "\n";
          }
          else {
            outputStr += String(i) + "\n";
          }
        }

        files[j] = outputStr;
    }
    
    let counter = 0;
    for (let i = 0; i < numberOfFiles; i++) {
      if (filesZarlatokSzama[i] !== 0) {
        counter += 1;
      }
    }

    files = files.slice(0, counter);

    let crb = [];
    for (let i = 0; i < counter; i++) {
      crb.push("");
    }
    crb[0] = "checked";
    setCheckRadioBoxes(crb);

    setRadioBoxes(counter);
    setOutput(files[0]);
    setFileContents(files);
    setSaveState({...saveState, fileContents: files});
    return groups;
  }

  function download({ target }) {
    if (output.trim().length > 0) {
      const element = document.createElement("a");
      const file = new Blob([output], {
        type: "text/plain"
      });
      element.href = URL.createObjectURL(file);
  
      const fileName = prompt("Mi legyen a fájl neve? (kiterjesztéssel (.txt))");
      if (fileName) {
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
      }
    }
  }

  function conovertAda({ target }) {
    setOutputWriteableAda(true);
    convert({target:target});
  
    const lines = input.toUpperCase().split("\n");
    let groups = [];

    for (let line of lines) {
      if (line.trim().length === 0) {
        continue;
      }

      const portNames = line.split("-");
      let group = [];
      for (let portName of portNames) {
        group.push(table.tableAda[portName]);
      }
      groups.push(group);
    }

    const prep = KTXPrep(groups, lines);
    const content = KTX(null, prep["groups"]);
    setKtxContent(content);
    setOutputAda(content);
    setOutputWriteableAda(true);
    setSaveState({...saveState, outputAda: content});
  }

  function handleCheckbox({ target }, i) {
    let a = [...checkRadioBoxes];
    
    for (let j = 0; j < checkRadioBoxes.length; j++) {
      if (j != i && checkRadioBoxes[j] === "checked") {
        a[j] = "";
        break;
      }
    }

    a[i] = a[i]=="checked"?"":"checked";
    setCheckRadioBoxes([...a]);
    setOutput(fileContents[i]);
  }

  function downloadAda({ target }) {
    if (outputAda.trim().length > 0) {
      const element = document.createElement("a");
      const fileName = prompt("Mi legyen a fájl neve? (kiterjesztéssel (.ktx vagy .txt))");

      if (fileName) {
        const file = new Blob([KTX(fileName.replace(".ktx", ""), ktxContent)], {
          type: "text/plain"
        });        
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
      }
    }
  }

  // When a radiobox is checked
  useEffect(() => {
    if (checkRadioBoxes.length !== 0) {
      let i = 0;
      for (; i < checkRadioBoxes.length; i++) {
        if (checkRadioBoxes[i] === "checked") {
          break;
        }
      }
      setOutput(fileContents[i]);
    }
  }, [checkRadioBoxes])

  useEffect(() => {
    if (saveState["input"].length === 0) {
      setSaveState({...saveState, input: input});
    }
  }, [input]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function checkEdit() {

    let invTable = {};
    for (let key of Object.keys(table.table)) {
      invTable[table.table[key]] = key;
    }

    let file_index = -1;
    let SSS = "";

    for (let fc of fileContents) {
      file_index += 1;
      let lines = fc.split("\n");
      let numbers = {};

      for (let i = 2; i < lines.length; i++) {
        if (!Object.keys(numbers).includes(lines[i])) {
          numbers[lines[i]] = [];
        }
        else {
          numbers[lines[i]].push(i+1);
        }
      }

      let inpc = "";

      for (let key of Object.keys(numbers)) {
        if (numbers[key].length !== 0) {
          let str_nums = [];
          let int_nums = [parseInt(key), ...numbers[key]];
        
          for (let int_num of int_nums) {
            str_nums.push(invTable[int_num + (file_index*64)]);
          }
          //console.log(str_nums);
          inpc += str_nums.join("-");
          inpc += "\n";
        }
      }
      SSS += inpc;
    }
    setInputCorr(SSS);
  }

  function checkEditAda() {

    // Invert the ada table
    let invAda = {};
    for (let key of Object.keys(table.tableAda)) {
      invAda[table.tableAda[key]] = key;
    }

    let isAt = false;
    let counter = 0;
    let globalPorts = [];

    for (let line of outputAda.split("\n")) {
      if (line[0] === "@") {
        isAt = true;
        continue;
      }
      if (isAt) {
        ++counter;
      }
      if (isAt && counter === 2) {
        let ports = [];
        let parts = line.split(" ");

        for (let part of parts) {
          if (part.replace('"', "").trim().length === 0) {
            continue;
          }

          let a = invAda[parseInt(part.replace('"', ""))];
          ports.push(a);
        }

        globalPorts.push(ports.join("-"));
        counter = 0;
        isAt = false;
      }
    }

    setInputCorr(globalPorts.join("\n"));
  }

  function backwardsEdit() {
    setRadioBoxes(0);
    setCheckRadioBoxes([]);
    setFileContents([]);
    setOutputAda("");
    setOutputWriteableAda(false);

    // Ask for file
    let _input = document.createElement('input');
    _input.type = 'file';
    _input.onchange = function(){
      var file = this.files[0];
      var reader = new FileReader();
      reader.onload = function(progressEvent){
        setOutput(output + this.result + "\n");
      };
      reader.readAsText(file);
    };
    _input.click();

    let invTable = {};
    for (let key of Object.keys(table.table)) {
      invTable[table.table[key]] = key;
    }

    let linesI = 0;
    let numbers = {};
    let index = 0;

    for (let line of output.split("\n")) {
      if (linesI <= 1) {
        linesI += 1;
        continue;
      }

      if (!Object.keys(numbers).includes(index)) {
        numbers[index] = parseInt(line);
      }

      index += 1;
      linesI += 1;
    }

    let groups = {};

    for (let key of Object.keys(numbers)) {
      if (parseInt(numbers[key]) !== parseInt(key)) {
        if (String(numbers[key]) == "NaN") continue;

        key = parseInt(key); 

        if (Object.keys(groups).includes(numbers[key])) {
          groups[numbers[key]].push(parseInt(key));
        } 
        else {
          groups[numbers[key]] = [parseInt(parseInt(key))];
        }        
      }
    }

    let lines = [];

    for (let key of Object.keys(groups)) {
      let S = [key, ...groups[key]];

      for (let i = 0; i < S.length; i++) {
        S[i] = invTable[parseInt(S[i])];
      }

      lines.push(S.join("-"));
    }

    setInputCorr(lines.join("\n"));
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="App">
      <header className="pt-2 pb-2 bg-info text-white">
        <h2 className="font-weight-bold">Teszter Program Konvertáló</h2>
      </header>

      <main className="pb-5 pt-4 pl-5 pr-5">
        <div className="row">
          <div className="col-sm">
            <h4>Bemenet</h4>
            <textarea className="form-control mb-3" cols={8} rows={16} value={input} onChange={e=>handleChange(e,input,setInput)} />
            <div className="row">
              <div className="col-sm">
                <button className="btn btn-block font-weight-bold btn-info" onClick={convert}>
                  Konvertálás Hagyományosra
                </button>
              </div>
              <div className="col-sm">
                <button className="btn btn-block font-weight-bold btn-info" onClick={conovertAda}>Konvertálás Adaptronic-ra</button>
              </div>
            </div>
          </div>
          <div className="col-sm">
            <h4>Hagyományos Teszterhez</h4>
            <textarea className="form-control mb-3" cols={8} rows={16} value={output} onChange={e=>handleChange(e,output,setOutput)} />
            <div className="row mb-3">{(Array.from(Array(radioBoxes).keys())).map((e, i) => (
              <div className="col-sm" key={i+1000}>
                <input id={"id-" + i} className="form-check-input" name={"r" + i} key={i} type="radio" checked={checkRadioBoxes[i]} onChange={e=>handleCheckbox(e,i)} />
                <label htmlFor={"id-" + i} className="form-check-label ml-1 font-weight-bold" key={i+100}>{i+1}. fájl</label>
              </div>
            ))}</div>
            <button className="btn btn-block font-weight-bold btn-success" onClick={download}>Mentés</button>
            <button className="btn btn-block font-weight-bold btn-outline-info" onClick={checkEdit}>Módosítás</button>
            <button className="btn btn-block font-weight-bold btn-outline-danger" onClick={backwardsEdit}>Visszafejtés</button>
          </div>
          <div className="col-sm">
            <h4>Adaptronic Teszterhez</h4>
            {outputWriteableAda?
            <div>
              <textarea className="form-control mb-3 disabled" cols={8} rows={16} value={outputAda} onChange={e=>handleChange(e,outputAda,setOutputAda)} />
              <button className="btn btn-block font-weight-bold btn-success" onClick={downloadAda}>Mentés</button>
              <button className="btn btn-block font-weight-bold btn-outline-info" onClick={checkEditAda}>Módosítás</button>
            </div>
            :
            <div>
              <textarea className="form-control mb-3 disabled" cols={8} rows={16} value={outputAda} onChange={e=>handleChange(e,outputAda,setOutputAda)} disabled />
              <button className="btn btn-block font-weight-bold btn-success" onClick={downloadAda} disabled>Mentés</button>
              <button className="btn btn-block font-weight-bold btn-outline-info" onClick={checkEditAda} disabled>Módosítás Ellenőrzése</button>
            </div>
            }
          </div>
        </div>

        {inputCorr.length!==0?
          <div className="row mt-5">
            <div className="col-sm">
              <h4>Javított Bemenet</h4>
              <textarea className="form-control mb-3" cols={8} rows={inputCorr.split("\n").length} value={inputCorr} disabled />
            </div>
          </div>
        :null}

      </main>

      <footer className="mt-5 pt-4 pb-4 bg-info text-white">
        <p className="small">Copyright &copy; 2022 <a className="font-weight-bold text-white" target="_blank" href="https://MartinKondor.github.io/">Martin Kondor</a></p>
      </footer>
    </div>
  );
}

export default App;
