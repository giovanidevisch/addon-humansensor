import React from "react";
import { Stage, Layer, Text, Group } from "react-konva";
import shortid from "shortid";

import { Button, PageHeader, Tag } from "antd";
import swal from "@sweetalert/with-react";

import Rectangle from "./Rectangle";
// import RectTransformer from './Rectangle/Transformer';
import ImageBackground from "./ImageBackground";

class AnnotationTool extends React.Component {
  state = {
    rectangles: [],
    rectCount: 0,
    selectedShapeName: "",
    mouseDown: false,
    mouseDraw: false,
    newRectX: 0,
    newRectY: 0,
    reloadImage: false,
  };

  componentDidMount() {
    this.img.moveToBottom();
    this.setState({
      rectangles: this.props.rectangles ? this.props.rectangles : [],
      rectCount: this.props.rectangles ? this.props.rectangles.length : 0,
    });
  }

  componentDidUpdate(oldProps) {
    if (
      oldProps.src !== this.props.src ||
      JSON.stringify(oldProps.systemRectangles) !==
        JSON.stringify(this.props.systemRectangles)
    ) {
      this.setState({ reloadImage: !this.reloadImage });
    } else if (
      JSON.stringify(oldProps.rectangles) !==
      JSON.stringify(this.props.rectangles)
    ) {
      let newRects = [
        ...this.state.rectangles.filter((r) => r.name !== "rectA"),
        ...(this.props.rectangles ? this.props.rectangles : []),
      ];
      this.setState({
        rectangles: newRects,
        rectCount: newRects.length,
      });
    }
  }

  handleStageMouseDown = (event) => {
    const { rectangles } = this.state;
    // clicked on stage - clear selection or ready to generate new rectangle
    if (event.target.className === "Image") {
      if (rectangles.length === 10) {
        swal("Number of custom objects that can be defined is limited to 10.");
        return;
      }
      const stage = event.target.getStage();
      const mousePos = stage.getPointerPosition();
      this.setState({
        mouseDown: true,
        newRectX: mousePos.x,
        newRectY: mousePos.y,
        selectedShapeName: "",
      });
      return;
    }
    // clicked on transformer - do nothing
    const clickedOnTransformer =
      event.target.getParent() &&
      event.target.getParent().className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    // find clicked rect by its name
    const name = event.target.name();
    const rect = rectangles.find((r) => name !== "rectA" && r.name === name);
    if (rect) {
      this.setState({
        selectedShapeName: name,
        rectangles,
      });
    } else {
      this.setState({
        selectedShapeName: "",
      });
    }
  };

  handleRectChange = (index, newProps) => {
    const { rectangles } = this.state;
    rectangles[index] = {
      ...rectangles[index],
      ...newProps,
    };

    this.setState({ rectangles });
  };

  handleNewRectChange = (event) => {
    const { rectangles, rectCount, newRectX, newRectY } = this.state;
    const stage = event.target.getStage();
    const mousePos = stage.getPointerPosition();
    if (!rectangles[rectCount]) {
      rectangles.push({
        x: newRectX,
        y: newRectY,
        width: mousePos.x - newRectX,
        height: mousePos.y - newRectY,
        name: `customRect${rectCount + 1}`,
        stroke: "#8B0000",
        key: shortid.generate(),
      });
      return this.setState({ rectangles, mouseDraw: true });
    }
    rectangles[rectCount].width = mousePos.x - newRectX;
    rectangles[rectCount].height = mousePos.y - newRectY;
    return this.setState({ rectangles });
  };

  handleStageMouseUp = () => {
    let { rectCount, mouseDraw, rectangles } = this.state;
    if (!rectangles[rectCount]) {
      return;
    }
    swal("Please name the custom object", {
      content: "input",
    }).then((sensorName) => {
      // });
      // const sensorName = prompt("Please Name Object", "Door");
      if (
        sensorName === null ||
        sensorName === "" ||
        (sensorName !== null && sensorName.length > 20)
      ) {
        if (sensorName !== null && sensorName.length > 20) {
          swal(`Name should not be longer than 20 characters`);
        }
        rectangles.pop();
      } else {
        rectangles[rectCount].title = sensorName;
      }
      if (mouseDraw) {
        this.setState({
          rectCount: rectangles.length,
          rectangles,
          mouseDraw: false,
        });
      }
      this.setState({ mouseDown: false });
    });
  };

  onClickRemoveUserDrawnBoxes = () => {
    // const { rectangles } = this.state;
    // const resetedRects = rectangles.filter(
    //   (v) => !v.name.includes("customRect")
    // );
    // this.setState({ rectCount: resetedRects.length, rectangles: resetedRects });
    this.setState({ rectCount: 0, rectangles: [] });
  };

  render() {
    const {
      state: { rectangles, mouseDown }, //selectedShapeName
      props: {
        systemRectangles,
        onApply,
        width,
        height,
        scaleX,
        scaleY,
        src,
        style,
        title,
        subTitle,
        status,
      },
      handleStageMouseDown,
      handleNewRectChange,
      handleRectChange,
      handleStageMouseUp,
    } = this;
    return (
      <PageHeader
        title={title}
        subTitle={subTitle}
        tags={
          status && (
            <Tag color={status === "Connected" ? "green" : "red"}>{status}</Tag>
          )
        }
        extra={[
          <Button
            key="2"
            type="primary"
            danger
            onClick={this.onClickRemoveUserDrawnBoxes}
          >
            Reset
          </Button>,
          <Button key="1" type="primary" onClick={() => onApply(rectangles)}>
            Apply
          </Button>,
        ]}
      >
        <div style={style}>
          <Stage
            ref={(node) => {
              this.stage = node;
            }}
            width={width}
            height={height}
            onMouseDown={handleStageMouseDown}
            onTouchStart={handleStageMouseDown}
            onMouseMove={mouseDown && handleNewRectChange}
            onTouchMove={mouseDown && handleNewRectChange}
            onMouseUp={mouseDown && handleStageMouseUp}
            onTouchEnd={mouseDown && handleStageMouseUp}
          >
            <Layer
              ref={(node) => {
                this.img = node;
              }}
            >
              <ImageBackground src={src} scaleX={scaleX} scaleY={scaleY} />
            </Layer>
            <Layer>
              {rectangles.map((rect, i) => (
                <Group key={rect.key}>
                  <Rectangle
                    sclassName="rect"
                    {...rect}
                    onTransform={(newProps) => {
                      handleRectChange(i, newProps);
                    }}
                  />
                  <Text
                    fill={rect.stroke || "#8B0000"}
                    fontSize={12}
                    fontFamily="Calibri"
                    fontStyle="bold"
                    strokeWidth={1}
                    text={rect.title}
                    x={rect.x}
                    y={rect.y <= 14 ? rect.y + 15 : rect.y - 15}
                  />
                </Group>
              ))}
              {systemRectangles.map((rect) => (
                <Group key={rect.key}>
                  <Rectangle sclassName="rect" disabled={true} {...rect} />
                  <Text
                    fill={rect.stroke || "#8B0000"}
                    fontSize={12}
                    fontFamily="Calibri"
                    fontStyle="bold"
                    strokeWidth={1}
                    text={rect.title}
                    x={rect.x}
                    y={rect.y <= 14 ? rect.y + 15 : rect.y - 15}
                  />
                </Group>
              ))}
              {/* <RectTransformer selectedShapeName={selectedShapeName} /> */}
            </Layer>
          </Stage>
        </div>
      </PageHeader>
    );
  }
}

export default AnnotationTool;
