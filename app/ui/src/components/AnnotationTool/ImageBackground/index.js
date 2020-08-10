import React from "react";
import { Image } from "react-konva";

class ImageBackground extends React.Component {
  state = {
    image: null,
  };

  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }

  componentWillUnmount() {
    this.image.removeEventListener("load", this.handleLoad);
  }

  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new window.Image();
    this.image.src = this.props.src;
    this.image.addEventListener("load", this.handleLoad);
  }

  handleLoad = () => {
    this.setState({
      image: this.image,
    });
  };

  render() {
    const {
      state: { image },
      props: { scaleX, scaleY },
    } = this;
    return <Image image={image} scaleX={scaleX} scaleY={scaleY} />;
  }
}

export default ImageBackground;
