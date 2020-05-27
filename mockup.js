
var fft;
var mic;
var filt;

const names = ["bass", "lowMid", "mid", "highMid", "treble"];
const namesToColour = {
    bass: [0.3, 0, 0.7],
    lowMid: [0, 0.2, 0.8],
    mid: [0.05, 0.8, 0.15],
    highMid: [0.45, 0.45, 0.1],
    treble: [0.9, 0.1, 0]
   };

function getBandAmps(fft) {
  let bands = new Array(names.length);
  for(var i=0; i<names.length; ++i)
  {
    bands[i] = {};
    Object.defineProperty(bands[i], 'name', { value: names[i] });
    Object.defineProperty(bands[i], 'amp', { value: fft.getEnergy(names[i]) });
  }
  return bands;
}

function bandsToColour(bands) {
   const colours = bands.map(
     (band, index) => {
       const middle = 1 - Math.abs(bands.length/2 - index)/bands.length;
       const fac = Math.exp(2, middle);
       return bandToColour(band, namesToColour, fac);
     });
   return colours;
}

function bandToColour(band, namesToColourAmps, fac) {
  const name = band.name;
  const amp = band.amp;
  const colourAmps = namesToColourAmps[name];
  const colour = colourAmps.map(c => amp * c * fac);
  return colour;
}

function mergeBandColours(colours) {
  const colour = colours.reduce(
     (acc, colour) => {
       for(var i=0; i<colour.length; ++i)
       {
         acc[i] += colour[i] * 10;// / colours.length;
       }
       return acc;
     }, [0, 0, 0])
  return colour;
}

function drawSpotlights(colours) {
  buffers.forEach(
    (buffer, index) => {
      buffer.background(...colours[index]);
      image(buffer, 200 * index, 0); 
    });
}
  

function setup() {
  createCanvas(1000, 200);
  buffers = names.map(name => createGraphics(200, 200));
  

  filt = new p5.HighPass();
  const cFreq = 2000;
  const res = 5;
  filt.freq(cFreq);
  filt.res(res);
  
  mic = new p5.AudioIn();
  mic.connect(filt);
  mic.start();
  
  
  smoothing = 0.8;
  bins = 64; // more dynamic
  fft = new p5.FFT(smoothing, bins);
  
  fft.setInput(filt);
}

function draw() {
  // background(220);
  
  let spectrum = fft.analyze();
  const bands = getBandAmps(fft);
  console.log(bands.map(band => band.name + " :" + band.amp));
  const colours = bandsToColour(bands);
  drawSpotlights(colours);
}

  
  