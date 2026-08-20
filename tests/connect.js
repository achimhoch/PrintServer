const net = require('net');
const IPP = require('ipp');
const socket = new net.Socket();

const printer = socket.connect(631, "192.168.0.46");

//console.log(printer);

socket.once("connect", (data) => {
    socket.destroy();
    const Printer = IPP.Printer("ipps://192.168.0.46:631/ipp/print");
    console.log(Printer);
});
