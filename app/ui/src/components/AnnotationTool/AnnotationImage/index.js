import React from "react";
import { Stage, Layer, Text, Group } from "react-konva";

import Rectangle from "../Rectangle";
import ImageBackground from "../ImageBackground";

class AnnotationTool extends React.Component {
  state = {
    reloadImage: false,
  };

  componentDidUpdate(oldProps) {
    if (
      oldProps.src !== this.props.src ||
      JSON.stringify(oldProps.rectangles) !==
        JSON.stringify(this.props.rectangles)
    ) {
      this.setState({ reloadImage: !this.reloadImage });
    }
  }

  render() {
    const { width, height, rectangles, src, style, scaleX, scaleY } = this.props;
    return (
      <div style={style}>
        <Stage width={width} height={height}>
          <Layer>
            <ImageBackground src={src} scaleX={scaleX} scaleY={scaleY} />
          </Layer>
          <Layer>
            {rectangles.map((rect) => (
              <Group key={rect.key}>
                <Rectangle sclassName="rect" disabled={true} {...rect} />
                <Text
                  fill={ rect.stroke || "#8B0000"}
                  fontSize={12}
                  fontFamily="Calibri"
                  fontStyle="bold"
                  strokeWidth={1}
                  text={rect.title || ""}
                  x={rect.x}
                  y={rect.y <= 14 ? rect.y + 15 : rect.y - 15}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    );
  }
}

export default AnnotationTool;
