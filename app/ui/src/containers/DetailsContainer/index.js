import React from "react";

import { Row, Col, message, Space, Button } from "antd";

import AnnotationTool from "../../components/AnnotationTool";

import { withMqtt } from "../../utils/react-mqtt";
import { computeRect, computeRectValue, parse } from "../../utils/convertors";

const ACTUAL_IMAGE_WIDTH = 32;
const ACTUAL_IMAGE_HEIGHT = 24;
const IMAGE_HEIGHT = 480;
const IMAGE_WIDTH = 640;
const IMAGE_SCALE_FACTOR_X = IMAGE_WIDTH / ACTUAL_IMAGE_WIDTH;
const IMAGE_SCALE_FACTOR_Y = IMAGE_HEIGHT / ACTUAL_IMAGE_HEIGHT;

class DetailsContainer extends React.Component {
  subIDs = [
    "home-assistant/sensor/status",
    "home-assistant/pimage",
    "home-assistant/settings",
  ];

  state = {
    imageToRender: null,
    device: undefined,
    customRect: [],
    rectangles: [],
  };
  id = undefined;

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    this.id = params.id;
    setTimeout(() => {
      this.mqttClient = this.props.mqttClient;
      this.subscribe(this.subIDs);
      this.listenToMessages();
      this.publish(
        `home-assistant/${this.id}/command`,
        { cmd: "geticonfig" },
        "",
        "Couldn't get the image configuration."
      );
    }, 500);
  }

  componentWillUnmount() {
    this.unsubscribe(this.subIDs);
    this.mqttClient = undefined;
  }

  subscribe = (subIDs) => {
    if (subIDs.length < 1) {
      return;
    }
    this.mqttClient.subscribe(subIDs, (error, granted) => {});
  };

  unsubscribe = (subIDs) => {
    if (subIDs.length < 1) {
      return;
    }
    this.mqttClient.unsubscribe(subIDs, { qos: 1, rap: true }, (error) => {});
  };

  publish = (id, data, successMsg, errorMsg) => {
    if (!id || id.length < 1 || !data) {
      return;
    }
    this.mqttClient.publish(id, JSON.stringify(data), { qos: 2 }, (error) => {
      if (error) {
        errorMsg && message.error(errorMsg);
      } else {
        successMsg && message.success(successMsg);
      }
    });
  };

  listenToMessages = () =>
    this.mqttClient.on("message", (topic, message) => {
      const status = parse(message);
      if (status.id !== this.id) {
        return;
      }
      if (topic === this.subIDs[0]) {
        this.setState({ device: status });
      } else if (topic === this.subIDs[1]) {
        this.setState({
          imageToRender: `data:image/png;base64,${status.image}`,
          rectangles: [
            ...(status && status.rects ? status.rects : []).map((s) =>
              computeRectValue(s, IMAGE_SCALE_FACTOR_X, IMAGE_SCALE_FACTOR_Y, true)
            ),
          ],
        });
      } else if (topic === this.subIDs[2]) {
        this.setState({
          customRect: [
            ...(status && status.rects ? status.rects : []).map((s) =>
              computeRectValue(s, IMAGE_SCALE_FACTOR_X, IMAGE_SCALE_FACTOR_Y)
            ),
          ],
        });
      } else {
        console.log("Not handled the data from topic ", topic);
      }
    });

  onApplyCommand = (rects) => {
    const toSendRect = rects.map((r) =>
      computeRect(r, IMAGE_SCALE_FACTOR_X, IMAGE_SCALE_FACTOR_Y)
    );
    // console.log("Got rects from the tool ", toSendRect);
    this.publish(
      `home-assistant/${this.id}/iconfig`,
      toSendRect,
      "Successfully send rects to the device.",
      "Couldn't apply new rects to device."
    );
  };

  onStartCalibAction = () => {
    this.publish(
      `home-assistant/${this.id}/command`,
      { cmd: "calstart" },
      "Iniciated calibration on the device.",
      "Couldn't iniciated calibration on the device."
    );
  };

  onStartCalibImageAction = () => {
    this.publish(
      `home-assistant/${this.id}/command`,
      { cmd: "calshowon" },
      "Iniciated view calibration image.",
      "Couldn't iniciated view calibration image."
    );
  };

  onStopCalibImageAction = () => {
    this.publish(
      `home-assistant/${this.id}/command`,
      { cmd: "calshowoff" },
      "Iniciated stop viewing calibration image.",
      "Couldn't iniciated stop viewing calibration image."
    );
  };

  render() {
    const { imageToRender, rectangles, customRect, device } = this.state;

    return (
      <Row>
        <Col>
          {imageToRender && (
            <AnnotationTool
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              systemRectangles={rectangles}
              rectangles={customRect}
              title={device && (device.name || device.id)}
              subTitle="Live Image"
              status={device && device.sensorstatus}
              scaleX={IMAGE_SCALE_FACTOR_X}
              scaleY={IMAGE_SCALE_FACTOR_Y}
              style={{ width: "100%", padding: 5 }}
              src={imageToRender}
              onApply={this.onApplyCommand}
            />
          )}
        </Col>
        <Col>
          {device && (
            <div>
              <br />
              <h1>Details</h1>
              <p>
                <b>Device Mode:</b> {device.status}
              </p>
              <p>
                <b>Software Version:</b> {device.sw}
              </p>
              <p>
                <b>Image Count:</b> {device.imagecount}
              </p>
              <p>
                <b>Maximum Temperature:</b> {device.maxtemp} &deg;C
              </p>
              <br />
              <h1>Actions</h1>
              <Space>
                <Button onClick={() => this.onStartCalibAction()}>
                  Start Calibration
                </Button>
                <Button onClick={() => this.onStartCalibImageAction()}>
                  Show Calibration Image
                </Button>
                <Button onClick={() => this.onStopCalibImageAction()}>
                  Hide Calibration Image
                </Button>
              </Space>
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default withMqtt(DetailsContainer);
