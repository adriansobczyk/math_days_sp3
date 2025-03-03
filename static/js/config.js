// Global configuration variables
const config = {
  isRolling: false
};

// Define the spiral snake path coordinates (x, y positions for each cell)
const pathCoordinates = [
  { x: 100, y: 40, special: 'start' }, // 0

  { x: 185, y: 50 },  // 1
  { x: 250, y: 50 },  // 2
  { x: 315, y: 50 },  // 3
  { x: 380, y: 50 },  // 4
  { x: 445, y: 50 },  // 5
  { x: 510, y: 50 },  // 6
  { x: 575, y: 50 },  // 7
  { x: 640, y: 50 },  // 8

  { x: 640, y: 115 },  // 9
  { x: 640, y: 180 },  // 10
  { x: 640, y: 245 },  // 11
  { x: 640, y: 310 },  // 12
  { x: 640, y: 375 },  // 13
  { x: 640, y: 440 },  // 14
  { x: 640, y: 505 },  // 15

  { x: 640, y: 570 },  // 16
  { x: 575, y: 570 },  // 17
  { x: 510, y: 570 },  // 18
  { x: 445, y: 570 },  // 19
  { x: 380, y: 570 },  // 20
  { x: 315, y: 570 },  // 21
  { x: 250, y: 570 },  // 22
  { x: 185, y: 570 },  // 23
  { x: 120, y: 570 },  // 24
  { x: 55, y: 570 },  // 25

  { x: 55, y: 505 },  // 26
  { x: 55, y: 440 },  // 27
  { x: 55, y: 375 },  // 28
  { x: 55, y: 310 },  // 29
  { x: 55, y: 245 },  // 30
  { x: 55, y: 180 },  // 31

  { x: 120, y: 180 },  // 32
  { x: 185, y: 180 },  // 33
  { x: 250, y: 180 },  // 34
  { x: 315, y: 180 },  // 35
  { x: 380, y: 180 },  // 36
  { x: 445, y: 180 },  // 37
  { x: 510, y: 180 },  // 38

  { x: 510, y: 245 },  // 39
  { x: 510, y: 310 },  // 40
  { x: 510, y: 375 },  // 41
  { x: 510, y: 440 },  // 42

  { x: 445, y: 440 },  // 43
  { x: 380, y: 440 },  // 44
  { x: 315, y: 440 },  // 45
  { x: 250, y: 440 },  // 46

  { x: 250, y: 375 },  // 47
  { x: 250, y: 310 },  // 48

  { x: 315, y: 310 },  // 49
  // meta
  { x: 380, y: 300, special: 'meta' }  // 50
];

// Function to get math shape
function getMathShape(shape) {
  const shapes = {
    circle: 'circle(50%)',
    square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
  };
  return shapes[shape] || shapes.circle;
}

export { config, pathCoordinates, getMathShape };
