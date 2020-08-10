import React, { useState, useEffect, useContext } from "react";

import mqtt from 'mqtt';

export const MqttContext = React.createContext();

export const useMqtt = () => useContext(MqttContext);

export const withMqtt = (Component) => {
  return (props) => {
    const mqtt = useMqtt();
    return <Component {...mqtt} {...props} />
  }
}

export const MqttProvider = ({ children }) => {

  const [mqttClient, setMqtt] = useState();
  const [mqttStatus, setStatus] = useState('');

  useEffect(() => {

    const initMqtt = async () => {

      const client = mqtt.connect(
        "ws://hassio.local:1884",
        {
          username: "user1",
          password: "user1",
          clean: false,
          clientId: "HumanSensor_Web_1" + Math.random(),
        });

      setMqtt(client);

      client.on('connect', () => {
        console.log("Connected to server");
        setStatus("Connected");
      })
      client.on('close', () => {
        console.log("Disconnected to server");
        setStatus("Disconnected");
      })
      client.on('reconnect', () => {
        console.log("Reconnecting to server");
        setStatus("Reconnecting");
      })
      client.on('offline', () => {
        console.log("Client is offline");
        setStatus("Offline");
      })
      client.on('disconnect', () => {
        console.log("Disconnecting to server");
        setStatus("disconnecting");
      })
      client.on('error', () => {
        console.log("Error connecting to server");
        setStatus("Error connecting");
      })
      client.on('end', () => {
        console.log("Ending connection to server");
        setStatus("Ending connection");
      })
      // client.on('message', function (topic, message) {
      // message is Buffer
      // console.log(message.toString())
      // client.end();
      // })
    };
    initMqtt();
    // eslint-disable-next-line
  }, []);

  return (
    <MqttContext.Provider
      value={{
        mqttClient,
        mqttStatus
      }}>
      {children}
    </MqttContext.Provider>
  );
};