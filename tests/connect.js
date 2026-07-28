const net = require('net');
const IPP = require('ipp');
const socket = new net.Socket();

const printer = socket.connect(631, "141.13.14.180");
//console.log(printer);

socket.once("connect", (data) => {
    socket.destroy();
    const Printer = IPP.Printer("ipp://141.13.14.180:631/ipp/print");
    console.log(Printer);
});
