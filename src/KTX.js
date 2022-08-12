
export function KTXPrep(groups, lines) {
    let maxPortN = 0;
    let files = {0:[],1:[]};
    let fn = 0;
    let mfn = 0;

    for (let i = 0; i < groups.length; i++) {
        const portNames = lines[i].split("-");
        for (let portName of portNames) {
            let n = parseInt(portName.substring(1, portName.length));
            fn = parseInt(n/64);
            if (fn > maxPortN) {
                maxPortN = n%64;
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

    console.log(files);

    return {
        "groups": groups,
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


