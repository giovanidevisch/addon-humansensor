import React from "react";
import { Link } from "react-router-dom";

import { Row, Col, Card, message } from "antd";

import AnnotationImage from "../../components/AnnotationTool/AnnotationImage";

import { withMqtt } from "../../utils/react-mqtt";
import {
  computeRectValue,
  convertToRectFormat,
  parse,
} from "../../utils/convertors";

const ACTUAL_IMAGE_WIDTH = 32;
const ACTUAL_IMAGE_HEIGHT = 24;
const IMAGE_HEIGHT = 240;
const IMAGE_WIDTH = 320;
const IMAGE_SCALE_FACTOR_X = IMAGE_WIDTH / ACTUAL_IMAGE_WIDTH;
const IMAGE_SCALE_FACTOR_Y = IMAGE_HEIGHT / ACTUAL_IMAGE_HEIGHT;

class DashBoardContainer extends React.Component {
  subIDs = [
    "home-assistant/sensor/status",
    "home-assistant/pimage",
    "home-assistant/settings",
  ];

  devices = [];

  state = {
    devices: [],
    rectangles: [],
  };

  componentDidMount() {
    setTimeout(() => {
      this.mqttClient = this.props.mqttClient;
      this.subscribe(this.subIDs);
      this.listenToMessages();
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
      let matching_device = this.state.devices.filter(
        (d) => d.id === status.id
      );
      let existing = matching_device.length > 0;
      if (topic === this.subIDs[0]) {
        if (existing) {
          this.devices = this.state.devices.map((d) =>
            d.id === status.id ? { ...d, ...status } : { ...d }
          );
          this.setState({
            devices: this.devices,
          });
        } else {
          this.setState({
            devices: [...this.state.devices, { ...status }],
          });
          this.publish(
            `home-assistant/${status.id}/command`,
            { cmd: "geticonfig" },
            "",
            `Couldn't get the image configuration for the device ${
              status.name || status.id
            }.`
          );
        }
      } else if (topic === this.subIDs[1] && existing) {
        this.devices = this.state.devices.map((d) =>
          d.id === status.id
            ? {
                ...d,
                ...convertToRectFormat(
                  status,
                  IMAGE_SCALE_FACTOR_X,
                  IMAGE_SCALE_FACTOR_Y,
                  true
                ),
              }
            : { ...d }
        );
        console.log(this.devices);
        this.setState({
          devices: this.devices,
        });
      } else if (topic === this.subIDs[2] && existing) {
        this.setState({
          rectangles: [
            ...this.state.rectangles.filter(
              (r) => r.id !== matching_device[0].id
            ),
            {
              id: matching_device[0].id,
              rects: [
                ...(status && status.rects ? status.rects : []).map((s) =>
                  computeRectValue(
                    s,
                    IMAGE_SCALE_FACTOR_X,
                    IMAGE_SCALE_FACTOR_Y
                  )
                ),
              ],
            },
          ],
        });
      } else {
        console.log("Not handled the data from topic ", topic);
      }
    });

  renderImageView = (device, rectangles) => {
    const rects = [
      ...(rectangles && rectangles.rects ? rectangles.rects : []),
      ...(device.rects ? device.rects : []),
    ];
    return (
      <Col key={`id_${device.id}`} span={6.5}>
        <Link to={`${device.id}/details`}>
          <Card size="small" type="inner" bordered={false}>
            <AnnotationImage
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              rectangles={rects}
              scaleX={IMAGE_SCALE_FACTOR_X}
              scaleY={IMAGE_SCALE_FACTOR_Y}
              style={{ width: "100%" }}
              src={`data:image/png;base64,${device.image}`}
            />
            <Row justify="center">
              <Col span={12}>
                <h3>{device.name || device.id}</h3>
                <>{device.type}</>
              </Col>
              <Col span={12}>{device.location}</Col>
            </Row>
          </Card>
        </Link>
      </Col>
    );
  };

  render() {
    const { devices, rectangles } = this.state; // imageToRender

    return (
      <Row gutter={16}>
        {devices.map((d) =>
          this.renderImageView(d, rectangles.filter((r) => r.id === d.id)[0])
        )}
      </Row>
    );
  }
}

export default withMqtt(DashBoardContainer);
