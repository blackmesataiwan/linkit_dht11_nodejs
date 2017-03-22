var QIoT = require('./QIoT');

var temperature_mcu = 0;
var humidity_mcu = 0;

/**** linkit MPU to connect MCU ****/

var comport = require("serialport");

var serialPort = new comport.SerialPort("/dev/ttyS0", {
    baudrate: 57600,
    parser: comport.parsers.readline('\n')
  });

serialPort.on('open',function() {
  	console.log('Port open...');
});

serialPort.on('data', function(data) {
	try{
		var comjson = JSON.parse(data);

    	temperature_mcu = comjson.temperature;
    	humidity_mcu = comjson.humidity; 
        }
    catch(err){
    	console.log("UART ERR :" + err);
    	}
    });


/**** Connect QIoT Suite Lite ****/

var Qclient = QIoT.qiotmqtt.start('./res/resourceinfo.json');



/*** 
    Receive data of QIoT Suite Lite.
***/

//Setting Subscribe is use id <qiotmqtt.subscribeofid("ID", Qclient);>
//It will return topic name

var topic_LED = QIoT.qiotmqtt.subscribeofid("LED", Qclient);

//It's Switch case of topic name to receive message

Qclient.on('message', function(topic, message){
    var data = JSON.parse(message.toString());
    switch (topic){
        case topic_LED:
            if (data.value == 1) {
                LED.write(1);
            }
            else{
                LED.write(0);
            }
            break;

        default:
                
            break;
    }
    console.log(topic_LED);
    console.log(data.value);
    //LED.write(LED.read()?0:1);

});



/*** 
    Send sensor's data to QIoT Suite Lite by Resourcetype.
***/

//It's use "resourcetypename" to sending data.
//QIoT.qiotmqtt.type("resourcetypename", value, Qclient);


function sensors(){

    QIoT.qiotmqtt.type("Temperature",temperature_mcu,Qclient);
    QIoT.qiotmqtt.type("Humidity",humidity_mcu,Qclient);

    setTimeout(function() {
        console.log("wating......");
        sensors();
    }, 100);
}
sensors();

