import table from './table.json';


function invertTable(table) {
    let newt = {};
    let keys = Object.keys(table);
    for (let key of keys) {
        newt[table[key]] = key;
    }
    return newt;
}

function getFileContents(lines, maxPortN) {
    let files = [];
    let filesNumbers = [];
    let filesParity = [];
    let filesZarlatokSzama = [];

    for (let i = 0; i < maxPortN; i++) {
        files.push("");
        filesNumbers.push({});
        filesParity.push(64);
        filesZarlatokSzama.push(0);
    }

    for (let line of lines) {
        let parts = line.split("-");

        if (parts.length < 2) {
            continue;
        }

        let biggest = 0;
        let currNumbers = [];
        let zarlatSzam = 256;
        let currfilesParity = 64;

        for (let part of parts) {
            let portName = parseInt(part.substring(1, line.length));
            if (portName > biggest) {
                biggest = portName;
            }
            if (zarlatSzam > table.table[part]) {
                zarlatSzam = table.table[part];
            }
            if (table.table[part] > 128) {
                currfilesParity = 128;
            }
            currNumbers.push(table.table[part]);
        }

        let fileIndex = parseInt(biggest / 64);
        filesParity[fileIndex] = currfilesParity;

        for (let n of currNumbers) {
            filesNumbers[fileIndex][n] = zarlatSzam;
        }
        
        filesZarlatokSzama[fileIndex] = zarlatSzam;
        // files[fileIndex].push();
    }

    for (let j = 0; j < files.length; j++) {
        let outputStr = filesParity[j]===64?"64\n":"128\n";
        outputStr += `${filesZarlatokSzama[j]}\n`;
    
        for (let i = 0; i < filesParity[j]; i++) {
          if (Object.keys(filesNumbers[j]).includes(String(i))) {
            outputStr += String(filesNumbers[j][i]) + "\n";
          }
          else {
            outputStr += String(i) + "\n";
          }
        }

        files[j] = outputStr;
    }

    return files;
}

function isChangeAbleN(n) {
    return (n%128 === 65) || (n%128 === 66);
}

function reverseGroup(_group) {
    let group = [..._group];
    let changeIndex = null;

    console.log(group);
    
    for (let i = 0; i < group.length; i++) {
        if (isChangeAbleN(group[i]) && changeIndex !== null) {
            let temp = group[i];
            group[i] = group[changeIndex];
            group[changeIndex] = temp;
            changeIndex = null;
        }
        else if (isChangeAbleN(group[i])) {
            changeIndex = i;
        }
    }

    console.log(group);

    return group;
}

export function KTXPrep(groups, lines) {
    let maxPortN = 0;
    let maxN = 0;
    let newGroups = [];

    for (let group of groups) {
        for (let n of group) {
            if (n > maxN) {
                maxN = n;
                maxPortN = parseInt(n/64);
            }
        }

        newGroups.push(reverseGroup(group));
    }
    
    /*
    let files = {0:[],1:[]};
    let fn = 0;
    let mfn = 0;

    for (let i = 0; i < groups.length; i++) {
        const portNames = lines[i].split("-");
        for (let portName of portNames) {
            let n = parseInt(portName.substring(1, portName.length));
            fn = parseInt(n/64);
            if (fn > maxPortN) {
                maxPortN = fn;
            }
            if (fn > mfn) {
                mfn = fn;
            }
        }

        let prepg = [];
        for (let p of groups[i]) {
            prepg.push(p + (mfn * 128));
        }

        if (Object.keys(files).includes(String(mfn))) {
            files[String(mfn)].push(prepg);
        }
        else {
            files[String(mfn)] = [prepg];
        }
    }
    */

    return {
        "groups": newGroups,
        "fileContents": getFileContents(lines, maxPortN),
        "filen": maxPortN
    };
}

export function KTX(fileName, groups)
{
const top = `"#NAME_DIRECT "{}"
!
#PARAMETER "{}"
@VERSION "NTControl"
@GOOD_LABEL OFF
@BAD_LABEL OFF
@HEAD_LABEL OFF
@ADD_LABEL OFF
@PRINTER_INTERNAL OFF
@PRINT_HEADER ON
@PRINT_PASSED ON
@PRINT_PARAMETERS ON
@PRINTER_EXTERNAL OFF
@PRINT_VALUE ON
@KEEP_FAULTS OFF
@PRINT_SEGMENT ON
@PRINT_COMP_NAME OFF
@RESULT_DOCUMENTATION_LEVEL 0
@PIN_FORMAT DIRECT
@MONITORING OFF
@STOP_ON_FAULTS ON
@RELAIS_TIME 750
@VISUAL_LED_TEST OFF
@ERROR_LIMIT 20
@LOOSE_CONTACT_TEST OFF
@PRINT_ADD_INFO ON
@PRINT_NEW_PAGE ON
@ABORT_ALL OFF
@EXTERNAL_VOLTAGE_TEST OFF
!
#PARAMETER "{}" "Segment 1"
:TEST_TYPE
    CONNECTION_LOW
    SHORT_LOW
@RESISTANCE_LOW 250.000000
@RESISTANCE_INSULATION 20000.000000
@VOLTAGE_LOW 12.000000
@TIME_LOW_VOLTAGE 0
!
#NET "{}" "Segment 1"`;
const bottom = `!
#PARAMETER "{}"
:DESCRIPTION ($$)
!`;

    const oneRowStr = '@-"{}"\n*-"Sub 1"\n';

    if (fileName !== null) {
        return top.replaceAll("{}", fileName) +"\n"+ groups +"\n"+ bottom.replaceAll("{}", fileName);
    }

    let res = "";

    for (let i = 0; i < groups.length; i++) {
        res += oneRowStr.replace("{}", String(i + 1));
        for (let row of groups[i]) {
            res += '"' + String(row) + '" ';
        }
        if (i != groups.length - 1) res += "\n";
    }
    return res;
}


