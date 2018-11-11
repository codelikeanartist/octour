
// instructions
const cmds = ["JMP","JZ","JNZ","ADD","SUB","LD","IN","OUT","RD","WR"];
const cmdDesc = ["Jump","Jump if Zero","Jump if not Zero","Add data to W","Sub data from w","Load W","Port input to W","Port output from W","Read RAM","Write RAM"];
const maxInst = cmds.length;
const minVal = 0;
const maxVal = 15;
const romSize = 16;
const ramSize = 4;

// component variables
//const nullCmd = {"cmd":0,"data":0};
var rom = new Array(); //[nullCmd]; // cmd, data
var ram = new Array();
var pc = 0;
var pc_next = 0;
var pc_prev = 0;
var inport = 0;
var outport = 0;
var w = 0;
var z = 1;
var alu = 0;
var alu_op = "NOP";

var rom_cmd = 0;
var rom_data = 0;

var running = false;

// runtime variables
var timer;
var loops = 0;

// delays
const pstart = 500.0;
const pmin = 50.0;
const pmax = 5000.0;
var period = pstart;

// decode instruction and set all variables
// must be followed by visual update
var idec = function() {
    rom_cmd = rom[pc].cmd; // get current instruction
    rom_data = rom[pc].data; // get data
    //document.getElementById("log").innerHTML = "ROM: " + rom_cmd + " " + rom_data;
    
    // address selection
    try {
        switch (rom_cmd){
            case cmds.indexOf("JMP"): 
                if ((rom_data >= rom.length) || (rom_data < 0))  {
                    stop();
                    throw ("Invalid address");
                }
                pc_next = rom_data;
                break;
            case cmds.indexOf("JZ"):
                if (z) {
                    if ((rom_data >= rom.length) || (rom_data < 0))  {
                        stop();
                        throw ("Invalid address");
                    }
                    pc_next = rom_data;
                } else
                    pc_next = pc + 1;
                break;
            case cmds.indexOf("JNZ"):
                if (!z) {
                    if ((rom_data >= rom.length) || (rom_data < 0))  {
                        stop();
                        throw ("Invalid address");
                    }
                    pc_next = rom_data;
                } else
                    pc_next = pc + 1;
                break;
            default:
                //console.log("Cmd index: " + rom_cmd + ": " + cmds[rom_cmd]);
                pc_next = pc + 1;
                break;
        }
    }catch(e) {
        alert(e);
    }
    
    // data selection
    try {
        alu_op = "NOP";
        switch (rom_cmd){
            case cmds.indexOf("ADD"): 
                alu_op = "ADD";
                alu = w + rom_data;
                if (alu > maxVal) alu = 0;
                if (alu < minVal) alu = manVal;
                w = alu;
                z = (0 == w)? 1 : 0; 
                break;
            case cmds.indexOf("SUB"): 
                alu_op = "SUB";
                alu = w - rom_data;
                if (alu > maxVal) alu = 0;
                if (alu < minVal) alu = manVal;
                w = alu;
                z = (0 == w)? 1 : 0; 
                break;
            case cmds.indexOf("LD"): 
                w = rom_data;
                z = (0 == w)? 1 : 0; 
                break;
            case cmds.indexOf("IN"): 
                w = inport;
                z = (0 == w)? 1 : 0; 
                break;
            case cmds.indexOf("OUT"): 
                outport = w;
                break;
            case cmds.indexOf("RD"): 
                if (rom_data >= ram.length){  // check ram address
                    stop();
                    throw ("Invalid variable");
                }
                w = ram[rom_data];
                z = (0 == w)? 1 : 0; 
                break;
            case cmds.indexOf("WR"): 
                if (rom_data >= ram.length){  // check ram address
                    stop();
                    throw ("Invalid variable");
                }
                ram[rom_data] = w;
                break;
        }
    }catch(e) {
        alert(e);
    }
    
}

// update gui
var update = function(){
    try {
        document.getElementById("logic_w").value = w;
        document.getElementById("logic_pc").value = pc;
        document.getElementById("logic_alu").value = alu_op; // alu;
        document.getElementById("logic_zero").value = z;
        /* disnplay instruction as binary
        var i = "0000" + rom_cmd.toString(2);
        document.getElementById("logic_idec").value = i.substring(i.length - 4, i.length);
        */
        // display instruction mnemonic
        document.getElementById("logic_idec").value = cmds[rom_cmd];
        var d = "0000" + rom_data.toString(2);
        document.getElementById("logic_data").value = d.substring(d.length - 4, d.length);
        var o = document.getElementById("outputport");
        o.value = outport.toString(2);
        o.style.backgroundColor = outport?"yellow":"azure";
        var r = document.getElementById("outputport");
        o.value = outport.toString(2);
        o.style.backgroundColor = outport?"yellow":"azure";
        
        var table = document.getElementById("ramTable");
        var rowCount = table.rows.length;
        for (var i = 1; i < rowCount; i++){
            table.rows[i].cells[0].childNodes[0].value = ram[i - 1];
        }
        // ram mpa
        table = document.getElementById("ramView");
        rowCount = table.rows.length;
        for (var i = 0; i < ram.length; i++){
            // with signed values we can only count to 7. use 1 bit each color
            var rc = ram[i] & 0x1;
            var rg = (ram[i] & 0x2) >> 1;
            var rb = (ram[i] & 0x4) >> 2;
            var color = "rgb(" + (255*rc) + "," + (255*rg) + "," + (255*rb) + ")" ;
            //var rg = (ram[i] & 0x6) >> 1;
            //var rb = (ram[i] & 0x8) >> 3;
            //var color = "rgb(" + (255*rc) + "," + (85*rg) + "," + (255*rb) + ")" ;
            table.rows[1 + parseInt(i/2)].cells[parseInt(i % 2)].style.backgroundColor = color;//rgb(ram[i - 1],ram[i - 1],ram[i - 1]);
        }
        
        var r = document.getElementById("romTable");
        r.rows[pc_prev + 2].cells[0].childNodes[0].style.backgroundColor = "azure";
        r.rows[pc + 2].cells[0].childNodes[0].style.backgroundColor = "yellow";
        pc_prev = pc;
        pc = pc_next;
        
    }catch(e) {
        alert(e);
    }
    
}


// input functions
function setIn() {
    inport = 1;
    try{
    // var i = document.getElementById("logic").rows[1].cells[0];
    var i = document.getElementById("inputport");
    i.value = "ON";
    i.style.backgroundColor = "yellow"; // can use numbers: "#F0FFF0";             
    }catch(e) {
        alert(e);
    }

}
function clrIn() {
    inport = 0;
    try {
    var i = document.getElementById("inputport");
    i.value = "OFF";
    i.style.backgroundColor = "azure";            
    }catch(e) {
        alert(e);
    }
}

function speedUp() {
    if (period > pmin) {
        period /= 2;
        if (running) {
            clearInterval(timer);
            timer = setInterval(execute ,period); 
        }
    }
}


function slowDown() {
    if (period < pmax) {
        period *= 2;
        if (running) {
            clearInterval(timer);
            timer = setInterval(execute ,period); 
        }
    }
}


var reset = function () {
    stop();
    pc_prev = pc_next = pc = 0;
    w = 0;
    alu = 0;
    clrIn();
    loops = 0;
    try {
        var i = document.getElementById("instructions");
        i.innerHTML = "Instruction list:<br>";
        for (var j=0;j<cmds.length;j++) {
            i.innerHTML += cmds[j] + ": " + j;
            if (j < cmds.length - 1) 
                i.innerHTML += ",  ";
            else
                i.innerHTML += "<br><hr>";
        }
        var d = document.getElementById("descriptions");
        d.innerHTML = "";
        for (var j=0;j<cmdDesc.length;j++) {
            console.log(j);
            d.innerHTML += cmds[j] + ": " + cmdDesc[j];
            if (j < cmdDesc.length - 1) 
                d.innerHTML += ",  ";
            else
                d.innerHTML += "<br><hr>";
        }
        if (document.getElementById("romTable").rows.length < 3)
            for (var i = 0; i< romSize; i++) addRom();
        if (document.getElementById("ramTable").rows.length < 2) {
            for (var i = 0; i< ramSize; i++) addRam();
            ramView();            
        }
        //document.getElementById("log").innerHTML = "ROM: " + rom_cmd + " " + rom_data;
        document.getElementById("loops").innerHTML = "Loops: " + loops;
    }catch(e) {
        alert(e);
    }
    // insert sample instructions
    var table = document.getElementById("romTable");
    var row = table.rows[2];
    row.cells[1].childNodes[0].value = cmds.indexOf("IN"); 
    row.cells[2].childNodes[0].value = 0;
    row = table.rows[3];
    row.cells[1].childNodes[0].value = cmds.indexOf("OUT");
    row.cells[2].childNodes[0].value = 0;
    row = table.rows[4];
    row.cells[1].childNodes[0].value = cmds.indexOf("JMP");;
    row.cells[2].childNodes[0].value = 0;
    
    update();
    period = pstart;
}

function run() {
    if (running) return;
    
    // collect data from rom
    try {
        var table = document.getElementById("romTable");
        var rowCount = table.rows.length;
        for (var i = 2; i< rowCount; i++){
            var row = table.rows[i];
            var a = parseInt(row.cells[0].childNodes[0].value);
            var c = parseInt(row.cells[1].childNodes[0].value);
            var d = parseInt(row.cells[2].childNodes[0].value);
            // check valid numbers
            if (isNaN(c) || isNaN(d)) {
                //alert("Invalid instruction or data");
                break;
            }
            if ((0 > c) || (maxInst < c))  {
                alert("Invalid range on instruction");
                break;
            };
            /*
            if ((minVal > d) || (maxVal < d))  {
                alert("Invalid range on data");
                break;
            };
            */
            var r = new Object();
            r.cmd = c;
            r.data = d;
            rom[a] = r;
            // console.log("ROM " + a + ": " + c + " - " + d + ", size: " + rom.length);
        }
        
    }catch(e) {
        alert(e);
    }
    
    timer = setInterval(execute ,period); // 1000
    running = true;
}

function stop() {
    running = false;
    clearInterval(timer);
    if (rom.length > 2)
        try {
            var r = document.getElementById("romTable");
            r.rows[pc_prev + 2].cells[0].childNodes[0].style.backgroundColor = "azure";
            r.rows[pc + 2].cells[0].childNodes[0].style.backgroundColor = "azure";
        }catch(e) {
            alert(e);
        }
}

var execute = function() {
    // check oc
    if (pc >= rom.length) {
        alert("End of ROM reached");
        stop();
        return;
    }
    // decode and execute
    idec();
    // update display
    update();
    // test ...
    loops++;
    console.log("execute: " + loops);
    try {
    document.getElementById("loops").innerHTML = "Loops: " + loops;
    }catch(e) {
        alert(e);
    }
}

// ----------- table functions -----------
function addRom() {

        var table = document.getElementById("romTable");

        var rowCount = table.rows.length;
        var row = table.insertRow(rowCount);

        var cell1 = row.insertCell(0);
        var element1 = document.createElement("input");
        element1.type = "text";
        element1.name="addr";
        element1.readOnly=true;
        element1.size=8;
        element1.style['text-align'] = "center";
        element1.style['font-weight'] = "bold";
        element1.style['width'] = "100%";
        element1.value = rowCount - 2;
        cell1.appendChild(element1);

        var cell2 = row.insertCell(1);
        var element2 = document.createElement("input");
        element2.type = "text";
        element2.name="instr";
        element2.size=8;
        element2.style['text-align'] = "center";
        element2.style['font-weight'] = "bold";
        element2.style['width'] = "100%";
        cell2.appendChild(element2);

        var cell3 = row.insertCell(2);
        var element3 = document.createElement("input");
        element3.type = "text";
        element3.name="data";
        element3.size=8;
        element3.style['text-align'] = "center";
        element3.style['font-weight'] = "bold";
        element3.style['width'] = "100%";
        cell3.appendChild(element3);

}

function addRam() {

        var table = document.getElementById("ramTable");

        var rowCount = table.rows.length;
        // new row
        var row = table.insertRow(rowCount);

        var cell1 = row.insertCell(0);
        var element1 = document.createElement("input");
        element1.type = "text";
        element1.name="ram";
        element1.readOnly=true;
        element1.size=8;
        element1.style['text-align'] = "center";
        element1.style['font-weight'] = "bold";
        element1.style['width'] = "100%";
        cell1.appendChild(element1);
        
        ram.push(0);
}


function ramView() {

        var table = document.getElementById("ramView");

        var rowCount = table.rows.length;
        // new row
        var row = table.insertRow(rowCount);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var element1 = document.createTextNode("\u0020"); //"123"); // '\u0020');
        cell1.width = "50%";
        cell1.height = "50px";
        var element2 = document.createTextNode("\u0020");
        element2.style = element1.style;
        cell1.style.backgroundColor = "#F0F";
        cell2.style.backgroundColor = "#0F0";
        cell1.appendChild(element1);
        cell2.appendChild(element2);

        // next row
        var row = table.insertRow(rowCount);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var element1 = document.createTextNode("\u0020"); //"123"); // '\u0020');
        cell1.width = "50%";
        cell1.height = "50px";
        var element2 = document.createTextNode("\u0020");
        element2.style = element1.style;
        cell1.style.backgroundColor = "#F0F";
        cell2.style.backgroundColor = "#0F0";
        cell1.appendChild(element1);
        cell2.appendChild(element2);
        
}
