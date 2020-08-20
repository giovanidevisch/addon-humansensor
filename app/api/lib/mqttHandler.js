var mqtt = require('mqtt');
var imageProcesser = require('./imageProcesser');
var ip = new imageProcesser();

class MqttHandler {
    constructor() {
        this.mqttClient = null;
        this.host = 'mqtt://192.168.0.104';
    }

    connect() {
        // Connect mqtt without credentials 
        // (in case of needed, add username and password parms to 2nd param object)
        this.mqttClient = mqtt.connect(this.host, {
            username: "TomorrowTech",
            password: "tomorrow147",
            clean: false,
            clientId: "HumanSensor_Server_1" + Math.random(),
        });

        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
            console.log("MQTT Error", err);
            this.sendMessage('home-assistant/lifeline', 'HumanSensor is Down!!!')
            this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
            console.log(`MQTT client connected`);
            // mqtt subscriptions
            this.sendMessage('home-assistant/lifeline', 'HumanSensor is Up!!!');
            this.mqttClient.subscribe('home-assistant/image', { qos: 0 });
        });

        // When a message arrives, console.log it
        this.mqttClient.on('message', (topic, message) => {
            try {
                const m = JSON.parse(message.toString());
                console.log("MQTT Message");
                ip.processImage(m.image, (image) => {
                    let passMessage = { "id": m.id, "image": image, "rects": m.rects };
                    // console.log("Image data to be send ", passMessage);
                    if (image) {
                        this.sendMessage('home-assistant/pimage', JSON.stringify(passMessage));
                        console.log("Processed image send to MQTT");
                    }
                });
            } catch (e) {
                console.log("MQTT Message on topic - parsing error ", topic, e);
            }
        });

        this.mqttClient.on('close', () => {
            console.log(`MQTT client disconnected`);
        });
    }

    // Sends a mqtt message to topic: mytopic
    sendMessage(topic, message) {
        this.mqttClient.publish(topic, message, (e) => {
            if(e){
                console.log("MQTT send message failed");
                return;
            }
            console.log("MQTT send message successfully");
        });
    }
}

module.exports = MqttHandler;
