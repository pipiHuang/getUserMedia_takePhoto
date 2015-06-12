// add in translation, declare.
var COM_PORT = "COM3";
var BITRATE = 115200;
//------------------------------------------------------------------------
var PublicConnectID = "";

// initialize
var onGetDevices = function(ports) { 
	for(var i = 0; i < ports; i++) {
		console.log("Get port list: "); //print debug info
		console.log(ports[i].path);
	}
}
//chrome.serial.getDevices(onGetDevices);

var onConnect = function(connectionInfo) {
	if(!connectionInfo) {
		console.error("Could not open device, please check hardware connection.");
		return;
	}
	else {
		PublicConnectID = connectionInfo.connectionId;
		console.log("Device connected. Connection ID: ", PublicConnectID);
	}
}

var onSend = function(){
}

var convertStringToArrayBuffer = function(str) {
	var buffer = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buffer);
	for(var i = 0; i < str.length; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buffer;
}
//chrome.serial.connect(COM_PORT, { bitrate: BITRATE }, onConnect);
//------------------------------------------------------------------------
//var status = "P5.on";
// tag: send/ write serial signal
var dev0_1_msg = "off";
var do_dev0_1 = function(pin, msg) {
	var status = "";
	//var status = pin + "." + value;
	//status = status === "P5.on" ? "P5.on" : "P5.off";
	if(msg == "on")
		dev0_1_msg = "off";
	else if(msg == "off")
		dev0_1_msg = "on";
	status = pin + " " + dev0_1_msg;
	
	console.log("send msg to arduino: ", status);
	chrome.serial.send(PublicConnectID, convertStringToArrayBuffer(status), onSend);
}

//[Munaul] Camera
var do_dev0_4 = function(pin, msg) {
	var status = "";
	status = pin + " " + msg;
	console.log("send msg to arduino(camera):", status);
	chrome.serial.send(PublicConnectID, convertStringToArrayBuffer(status), onSend);
}

var rcvMSG_t1 = "";
var onReceive = function(rcvInfo) {
	if(rcvInfo.connectionId != PublicConnectID) 
		return;

	var Int8View = new Int8Array(rcvInfo.data);
	var rcvMSG = String.fromCharCode.apply(null, Int8View);
	//console.log("");
	//console.log("rcvMSG = ", rcvMSG);

	// read serial msg from arduino, read msg until '\n'
	var length = rcvMSG.length;
	if(rcvMSG.substring(length-1) == "\n") {		
		if(rcvMSG_t1) {// if t1 not null, add str
			rcvMSG_t1 = rcvMSG_t1 + rcvMSG;
		}
		else if(!rcvMSG_t1) {
			rcvMSG_t1 = rcvMSG;
		}
		var strArr = rcvMSG_t1.split("-");
		var pin = strArr[1];
		var dev_id = strArr[2];
		var status = strArr[3];
		rcvMSG = '';

		$("#" + dev_id).text(status);
		rcvMSG_t1 = "";
	}
	else {
		//console.log("not rcv finish");
		if(!rcvMSG_t1) // if t1 is null 
			rcvMSG_t1 = rcvMSG;				
	}
}

document.addEventListener('DOMContentLoaded', function() {
	// define call function which triggered by some event
	/*var dev0_1 = document.getElementById("dev0_1");
	dev0_1.addEventListener("click", function() {
		//do someting/call function
		do_dev0_1("P7", dev0_1_msg);
	});

	//[Manual] Camera
	var dev0_4 = document.getElementById("dev0_4");
	dev0_4.addEventListener("click", function() {
		do_dev0_4("A5", "1");
	});

	chrome.serial.onReceive.addListener(onReceive);
	*/
	camera_demo(200,100, 500, 300);
	//startTakePicture();

}); // document.addEventListner()

function hasGetUserMedia(){
	return (navigator.getUserMedia 
		|| navigator.webkitGetUserMedia || navigator.mozGetUserMedia);	
}

function camera_demo(minW, minH, maxW, maxH) {
	var video = document.querySelector("video");
	var canvas = document.querySelector("canvas");
	var photo = document.querySelector("photo");
	//var takePhoto = document.querySelector("takePhoto");
	var takePhoto = document.getElementById("takePhoto");

	var width = 500;
	var height = 0;
	height = video.videoHeight / (video.videoWidth/width);
	if(isNaN(height)) {
		height = width / (4/3);
	}

	navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	//console.log(navigator.getUserMedia);
	if(navigator.getUserMedia) {
		var constraints = {
		  audio: true,
		  video: true/*{
		  	mandatory: {
			  	minWidth: minW,
			  	minHeight: minH,
			  	maxWidth: maxW,
			  	maxHeight: maxH
			},
			optional: []
		  }*/
		};	
	}
	navigator.getUserMedia(constraints, successCallback, errorCallback);

	video.setAttribute("width", width);
	video.setAttribute("height", height);
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	takePhoto.addEventListener("click", function(e) {
		takePicture(width, height);
		e.preventDefault();
	});

}

function successCallback(stream) {
	var video = document.querySelector('video');

	window.stream = stream;
	if(window.URL || window.webkitURL) {
		var vendorURL = window.URL || window.webkitURL;
		video.src = vendorURL.createObjectURL(stream);
	}
	video.play();
}

function errorCallback(error) {
	console.log('navigator.getUserMedia error: ', error);
}

function takePicture(width, height) {
	var canvas = document.querySelector("canvas");
	var video = document.querySelector("video");
	var context = canvas.getContext("2d");

	if(width && height) {
		canvas.width = width;
		canvas.height = height;
		context.drawImage(video, 0, 0, width, height);
	}
}