var fs = require('fs');
var png_encoder = require('png-stream');
//var sharp = require('sharp');

class imageProcesser {

    constructor() {
        this.width = 32;
        this.height = 24;
    }

    async processImage(imageArray, callback) {
        var pixels = new Buffer.alloc(this.width * this.height * 3, null, 'base64');
        var color = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 0, 0], [1, 0, 1], [1, 1, 1]];
        var idx1, idx2;
        var fractBetween = 0;
        var vmin = 5.0; //deg C 
        var vmax = 50.0;//deg C 
        var vrange = vmax - vmin;
        for (var h = 0; h < this.height; h += 1) {
            for (var w = 0; w < this.width; w += 1) {
                var i = ((h * this.width) + w) * 3;
                var v = imageArray[this.width * (this.height - 1 - h) + w];
                v -= vmin; // new = Tempvalue - min Temp 
                v /= vrange;// new2 = new / 45 degreeC
                if (v <= 0) { idx1 = idx2 = 0; }
                else if (v >= 1) { idx1 = idx2 = 6; } //NUM_COLORS = 7
                else {
                    v *= 6;
                    idx1 = Math.floor(v);
                    idx2 = idx1 + 1;
                    fractBetween = v - idx1;
                }
                pixels[i] = ((((color[idx2][0] - color[idx1][0]) * fractBetween) + color[idx1][0]) * 255.0);
                pixels[i + 1] = ((((color[idx2][1] - color[idx1][1]) * fractBetween) + color[idx1][1]) * 255.0);
                pixels[i + 2] = ((((color[idx2][2] - color[idx1][2]) * fractBetween) + color[idx1][2]) * 255.0);
            }
        }
        var fileStream = await fs.createWriteStream('home-assistant-image1.png');

        fileStream.on("close", () => {
            // sharp('home-assistant-image1.png')
            //     .flip(true)
            //   //  .resize(640, 480)
            //     .toBuffer()
            //     .then(data => {
            //         callback(data.toString('base64'));
            //     })
            //     .catch(err => {
            //         console.log(`Image processing issue ${err}`)
            //         callback(false);
            //     });
            var v = fs.readFileSync('home-assistant-image1.png');
            callback(new Buffer(v).toString('base64'));
        });
        var enc = new png_encoder.Encoder(this.width, this.height);
        enc.pipe(fileStream);
        enc.end(pixels);
    }
}

module.exports = imageProcesser;