import shortid from "shortid";

export const parse = (message) => {
  try {
    const item = JSON.parse(message);
    return item;
  } catch (e) {
    return { message: message.toString() };
  }
};

export const convertToRectFormat = (data, scaleX, scaleY, systemGenerated) => {
  return {
    ...(data ? data : []),
    rects: [
      ...(data && data.rects ? data.rects : []).map((s) =>
        computeRectValue(s, scaleX, scaleY, systemGenerated)
      ),
    ],
  };
};

export const computeRect = (rect, scaleX, scaleY) => {
  return {
    x1: Math.round(rect.x/scaleX), // Top Left X
    y1: Math.round(rect.y/scaleY), // Top Left Y
    x2: Math.round((rect.width + rect.x)/scaleX), // Bottom Right X
    y2: Math.round((rect.height + rect.y)/scaleY), // Bottom Right Y
    title: rect.title,
  };
};

export const computeRectValue = (data, scaleX, scaleY, systemGenerated) => {
  console.log(systemGenerated);
  return {
    x: Math.round(data.x1 * scaleX),
    y: Math.round(data.y1 * scaleY),
    width: Math.round((data.x2 - data.x1) * scaleX),
    height: Math.round((data.y2 - data.y1) * scaleY),
    name: systemGenerated ? `rectA` : `customStored`,
    title: data.title || "",
    stroke: systemGenerated ? "#5b41f0" : "#8B0000",
    key: shortid.generate(),
  };
};
