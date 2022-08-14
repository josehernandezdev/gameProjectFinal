/*

The Game Project 7/8 - Make it awesome!

*/
// -----------
// Positioning
// -----------
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var char_canyon_pos;

// -----------------------
// Game character movement
// -----------------------
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isJumpRight;
var isJumpLeft;
var isJumping;
var walkLeftCycle;
var walkRightCycle;

// ------------------
// Background objects
// ------------------
var clouds;
var mountains;
var MidHills;
var BackHills;
var trees_x;
var canyons;
var collectables;
var isFound; // make collectables disappear
var cabin_y;
var flagpole;
var game_score;
var liveShapes;
var lives;
var tryAgain;
var replay;
var platforms;
// ---------------
// Water animation
// ---------------
var water_array;
var water_cycle;
var img;

// Preload font used in game.
function preload() {
  fontRobotoBold = loadFont("assets/Roboto-Bold.ttf");
}

function setup() {
  createCanvas(1024, 576);
  floorPos_y = (height * 3) / 4;
  // Variable to count life left.
  lives = 3;

  startGame();
}

function draw() {
  // --------------------------------------
  // Draw background, items, and character.
  // --------------------------------------

  background("#7dd8ea"); // fill the sky blue

  noStroke();

  push();
  translate(scrollPos * 0.1, 0); // Create parallex effect.
  drawBackHills();
  pop();

  push();
  translate(scrollPos * 0.2, 0); // Create parallex effect.
  drawMidHills();
  pop();

  drawGround();

  push();
  translate(scrollPos, 0); // implement scrolling background

  drawClouds();

  drawMountains();

  drawTrees();

  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  // Draw canyon and check if player falls in canyon.
  for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
  }

  // Draw collectable items and check if player collects item.
  for (var i = 0; i < collectables.length; i++) {
    if (collectables[i].isFound == false) {
      drawCollectable(collectables[i]);
      checkCollectable(collectables[i]);
    }
  }

  drawCabin();

  // Draw flagpole and check if player reaches flagpole.
  renderFlagpole();
  //
  if (flagpole.isReached == false) {
    checkFlagpole();
  }

  pop(); // End scrolling background.

  drawCollectableCounter();

  for (var i = 0; i < lives; i++) {
    drawLiveCounter(liveShapes[i]);
  }

  drawGameChar();

  push();
  translate(scrollPos, 0); // Implement scrolling background.
  // These objects need to go in front of the character.
  // Draw water animation in canyon.
  for (var i = 0; i < canyons.length; i++) {
    drawWater(canyons[i], water_array[i], water_cycle[i]);
    // Run and reset water animations.
    if (water_cycle[i] > 15) {
      water_cycle[i] = 0;
    } else {
      water_cycle[i] += 1;
    }
  }
  pop(); // End scrolling background.

  // -----------------------------
  // Logic for character movement.
  // -----------------------------

  // Function for character movement and positioning.
  moveGameChar();

  // Check if the player falls into a canyon and dies.
  checkPlayerDie();

  // If the player loses all his lives, then the game is over.
  if (lives < 1) {
    loseGame();
  }

  // Update real position of gameChar for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

  // If the player reaches the flag, then the game is won.
  if (flagpole.isReached) {
    winGame();
  }
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
  // left arrow
  if (keyCode == 37) {
    isLeft = true;
  }

  // right arrow
  if (keyCode == 39) {
    isRight = true;
  }

  // space bar
  if (keyCode == 32 || keyCode == 231 || keyCode == 0) {
    isFalling = true;
  }

  // So the player can't repeatedly push the space button to stay in the air
  if (gameChar_y < floorPos_y) {
    isFalling = false;
  }
  // So the player can't repeatedly push the space button to stay in the air
  // when falling down the canyon
  if (gameChar_y > floorPos_y + 2) {
    isFalling = false;
  }
}

function keyReleased() {
  // left arrow
  if (keyCode == 37) {
    isLeft = false;
  }

  // right arrow
  if (keyCode == 39) {
    isRight = false;
  }

  // space bar
  if (keyCode == 32 || keyCode == 231 || keyCode == 0) {
    isFalling = false;
  }
}

function mouseClicked() {
  // If the player clicks the mouse when over the restart button, restart the game.
  if (mouseX > 465 && mouseX < 575 && mouseY > 305 && mouseY < 345) {
    playAgain();
  }
}

// ------------------------------
// Game character render function
// ------------------------------

function drawGameChar() {
  if (isJumpLeft) {
    // jumping-left
    // char_head
    fill("#ff296d");
    rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
    // char_eyes
    fill("#d1f9ff");
    ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
    fill("#010014");
    ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
    // char_mouth
    ellipse(gameChar_x - 8.5, gameChar_y - 53, 2, 5);
    // char_neck
    fill("#ff296d");
    rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
    // char_shirt
    fill("#1490b3");
    rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
    // sleeves
    rect(gameChar_x + 5, gameChar_y - 43, 6, 6, 2);
    // char_shorts
    fill("#010014");
    rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
    rect(gameChar_x - 13, gameChar_y - 23, 8, 8);
    // char_right_arm
    fill("#ff296d");
    rect(gameChar_x + 11, gameChar_y - 41, 8, 3);
    rect(gameChar_x + 19, gameChar_y - 41, 3, 9);
    rect(gameChar_x + 18, gameChar_y - 32, 5, 4);
    // char_left_arm
    rect(gameChar_x - 15, gameChar_y - 41, 10, 3);
    rect(gameChar_x - 15, gameChar_y - 50, 3, 9);
    rect(gameChar_x - 16, gameChar_y - 54, 5, 4);
    //char_leg
    rect(gameChar_x - 17, gameChar_y - 21, 4, 5);
    rect(gameChar_x - 17, gameChar_y - 16, 4, 5);
    rect(gameChar_x - 2.5, gameChar_y - 10, 4, 8);
    rect(gameChar_x + 1.5, gameChar_y - 6, 5, 4);
    // char_shoe
    fill("#010014");
    rect(gameChar_x + 6, gameChar_y - 6, 5, 8);
    rect(gameChar_x - 21, gameChar_y - 11, 8, 5);
  } else if (isJumpRight) {
    // jumping-right
    // char_head
    fill("#ff296d");
    rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
    // char_eyes
    fill("#d1f9ff");
    ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
    fill("#010014");
    ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
    // char_mouth
    ellipse(gameChar_x + 8.5, gameChar_y - 53, 2, 5);
    // char_neck
    fill("#ff296d");
    rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
    // char_shirt
    fill("#1490b3");
    rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
    // sleeves
    rect(gameChar_x - 11, gameChar_y - 43, 6, 6, 2);
    // char_shorts
    fill("#010014");
    rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
    rect(gameChar_x + 5, gameChar_y - 23, 8, 8);
    // char_right_arm
    fill("#ff296d");
    rect(gameChar_x - 20, gameChar_y - 41, 9, 3);
    rect(gameChar_x - 20, gameChar_y - 41, 3, 9);
    rect(gameChar_x - 21, gameChar_y - 32, 5, 4);
    // char_left_arm
    rect(gameChar_x + 5, gameChar_y - 41, 10, 3);
    rect(gameChar_x + 12, gameChar_y - 50, 3, 9);
    rect(gameChar_x + 11, gameChar_y - 54, 5, 4);
    //char_leg
    rect(gameChar_x + 13, gameChar_y - 21, 4, 5);
    rect(gameChar_x + 13, gameChar_y - 16, 4, 5);
    rect(gameChar_x - 2.5, gameChar_y - 10, 4, 8);
    rect(gameChar_x - 7.5, gameChar_y - 6, 5, 4);
    // char_shoe
    fill("#010014");
    rect(gameChar_x - 12, gameChar_y - 6, 5, 8);
    rect(gameChar_x + 13, gameChar_y - 11, 8, 5);
  } else if (isLeft) {
    // walking left animation
    switch (walkLeftCycle) {
      case 0:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x - 9, gameChar_y - 53, gameChar_x - 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x + 11, gameChar_y - 42);
        line(
          gameChar_x + 11,
          gameChar_y - 42,
          gameChar_x + 11,
          gameChar_y - 35
        );
        line(gameChar_x - 4, gameChar_y - 42, gameChar_x - 10, gameChar_y - 39);
        line(
          gameChar_x - 10,
          gameChar_y - 39,
          gameChar_x - 12,
          gameChar_y - 46
        );
        noStroke();
        strokeWeight(1);
        // hands
        fill("#ff296d"); // RED
        rect(gameChar_x + 9, gameChar_y - 35, 5, 4);
        rect(gameChar_x - 15, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x + 3, gameChar_y - 9, gameChar_x + 4, gameChar_y - 5);
        line(gameChar_x + 4, gameChar_y - 5, gameChar_x + 10, gameChar_y - 7);
        line(gameChar_x - 1, gameChar_y - 10, gameChar_x - 6, gameChar_y - 7);
        line(gameChar_x - 6, gameChar_y - 7, gameChar_x - 2, gameChar_y - 2);
        noStroke();
        // char_shoe
        fill("#010014");
        rect(gameChar_x + 12, gameChar_y - 8, 5, 8);
        rect(gameChar_x - 8, gameChar_y - 3, 8, 5);
        walkLeftCycle += 1;
        break;
      case 1:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x - 9, gameChar_y - 53, gameChar_x - 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x + 7, gameChar_y - 30);
        line(gameChar_x + 7, gameChar_y - 30, gameChar_x - 3, gameChar_y - 28);
        line(gameChar_x - 4, gameChar_y - 31, gameChar_x - 10, gameChar_y - 35);
        noStroke();
        strokeWeight(1);
        // hands
        fill("#ff296d"); // RED
        rect(gameChar_x - 8, gameChar_y - 29, 5, 4);
        rect(gameChar_x - 13, gameChar_y - 38, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x - 1.5, gameChar_y - 10, gameChar_x + 8, gameChar_y - 7);
        line(gameChar_x - 1, gameChar_y - 10, gameChar_x + 1, gameChar_y - 3);
        noStroke();
        // char_shoe
        fill("#010014");
        rect(gameChar_x + 9, gameChar_y - 8, 5, 8);
        rect(gameChar_x - 4, gameChar_y - 3, 8, 5);
        walkLeftCycle += 1;
        break;
      case 2:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x - 9, gameChar_y - 53, gameChar_x - 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x + 8, gameChar_y - 32);
        line(gameChar_x + 8, gameChar_y - 32, gameChar_x, gameChar_y - 24);
        line(gameChar_x - 4, gameChar_y - 42, gameChar_x - 10, gameChar_y - 35);
        line(
          gameChar_x - 10,
          gameChar_y - 35,
          gameChar_x - 15,
          gameChar_y - 46
        );
        noStroke();
        fill("#ff296d"); // RED
        // hands
        rect(gameChar_x - 4, gameChar_y - 24, 5, 4);
        rect(gameChar_x - 17, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        line(gameChar_x + 2, gameChar_y - 9, gameChar_x + 6, gameChar_y - 2);
        line(gameChar_x - 1, gameChar_y - 9, gameChar_x - 6, gameChar_y - 7);
        line(gameChar_x - 6, gameChar_y - 7, gameChar_x - 4, gameChar_y - 4);
        noStroke();
        strokeWeight(1);
        // char_shoe
        fill("#010014"); // DARK BLUE
        rect(gameChar_x - 9, gameChar_y - 2, 8, 5);
        rect(gameChar_x, gameChar_y - 2, 8, 5);
        walkLeftCycle += 1;
        break;
      case 3:
        // char_head
        fill("#ff296d"); // RED
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff"); // GREY
        ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
        fill("#010014"); // DARK BLUE
        ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x - 10, gameChar_y - 53, gameChar_x - 5, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d"); // RED
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014"); // DARK BLUE
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 39, gameChar_x + 10, gameChar_y - 34);
        line(gameChar_x + 10, gameChar_y - 34, gameChar_x + 7, gameChar_y - 24);
        line(gameChar_x - 4, gameChar_y - 42, gameChar_x - 10, gameChar_y - 35);
        line(
          gameChar_x - 10,
          gameChar_y - 35,
          gameChar_x - 17,
          gameChar_y - 46
        );
        noStroke();
        fill("#ff296d"); // RED
        // hands
        rect(gameChar_x + 5, gameChar_y - 24, 5, 4);
        rect(gameChar_x - 18, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        line(gameChar_x + 2, gameChar_y - 9, gameChar_x + 3, gameChar_y - 5);
        line(gameChar_x + 3, gameChar_y - 5, gameChar_x + 6, gameChar_y - 4);
        line(gameChar_x - 1, gameChar_y - 9, gameChar_x - 6, gameChar_y - 7);
        line(gameChar_x - 6, gameChar_y - 7, gameChar_x - 6, gameChar_y - 4);
        noStroke();
        strokeWeight(1);
        // char_shoe
        fill("#010014"); // DARK BLUE
        rect(gameChar_x - 12, gameChar_y - 2, 8, 5);
        rect(gameChar_x + 8, gameChar_y - 6, 5, 8);
        walkLeftCycle += 1;
        break;
      default: // RED
        // GREY
        // DARK BLUE
        // RED
        // DARK BLUE
        // RED
        // RED
        // RED
        // DARK BLUE
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x - 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x - 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x - 10, gameChar_y - 53, gameChar_x - 5, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d");
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 39, gameChar_x + 10, gameChar_y - 38);
        line(gameChar_x + 10, gameChar_y - 38, gameChar_x + 9, gameChar_y - 28);
        line(gameChar_x - 4, gameChar_y - 42, gameChar_x - 7, gameChar_y - 35);
        line(gameChar_x - 7, gameChar_y - 35, gameChar_x - 14, gameChar_y - 46);
        noStroke();
        fill("#ff296d");
        // hands
        rect(gameChar_x + 7, gameChar_y - 28, 5, 4);
        rect(gameChar_x - 15, gameChar_y - 47, 5, 4);
        //char_leg
        stroke("#ff296d");
        line(gameChar_x + 2, gameChar_y - 9, gameChar_x + 3, gameChar_y - 5);
        line(gameChar_x + 3, gameChar_y - 5, gameChar_x + 7, gameChar_y - 6);
        line(gameChar_x - 1, gameChar_y - 9, gameChar_x - 6, gameChar_y - 2);
        noStroke();
        // char_shoe
        fill("#010014");
        rect(gameChar_x - 12, gameChar_y - 2, 8, 5);
        rect(gameChar_x + 9, gameChar_y - 8, 5, 8);
        walkLeftCycle = 0;
        break;
    }
  } else if (isRight) {
    // walking right animation
    switch (walkRightCycle) {
      case 0:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x + 9, gameChar_y - 53, gameChar_x + 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x - 11, gameChar_y - 42);
        line(
          gameChar_x - 11,
          gameChar_y - 42,
          gameChar_x - 11,
          gameChar_y - 35
        );
        line(gameChar_x + 4, gameChar_y - 42, gameChar_x + 10, gameChar_y - 39);
        line(
          gameChar_x + 10,
          gameChar_y - 39,
          gameChar_x + 12,
          gameChar_y - 46
        );
        noStroke();
        strokeWeight(1);
        // hands
        fill("#ff296d"); // RED
        rect(gameChar_x - 13, gameChar_y - 35, 5, 4);
        rect(gameChar_x + 10, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x - 3, gameChar_y - 9, gameChar_x - 4, gameChar_y - 5);
        line(gameChar_x - 4, gameChar_y - 5, gameChar_x - 10, gameChar_y - 7);
        line(gameChar_x + 1, gameChar_y - 10, gameChar_x + 6, gameChar_y - 7);
        line(gameChar_x + 6, gameChar_y - 7, gameChar_x + 2, gameChar_y - 2);
        noStroke();
        // char_shoe
        fill("#010014");
        rect(gameChar_x - 14, gameChar_y - 8, 5, 8);
        rect(gameChar_x + 1, gameChar_y - 3, 8, 5);
        walkRightCycle += 1;
        break;
      case 1:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x + 9, gameChar_y - 53, gameChar_x + 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x - 7, gameChar_y - 30);
        line(gameChar_x - 7, gameChar_y - 30, gameChar_x + 3, gameChar_y - 28);
        line(gameChar_x + 4, gameChar_y - 31, gameChar_x + 10, gameChar_y - 35);
        noStroke();
        strokeWeight(1);
        // hands
        fill("#ff296d"); // RED
        rect(gameChar_x + 4, gameChar_y - 28, 5, 4);
        rect(gameChar_x + 9, gameChar_y - 38, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x + 1.5, gameChar_y - 10, gameChar_x - 8, gameChar_y - 7);
        line(gameChar_x + 1, gameChar_y - 10, gameChar_x - 1, gameChar_y - 3);
        noStroke();
        // char_shoe
        fill("#010014");
        rect(gameChar_x - 13, gameChar_y - 8, 5, 8);
        rect(gameChar_x - 2, gameChar_y - 3, 8, 5);
        walkRightCycle += 1;
        break;
      case 2:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x + 9, gameChar_y - 53, gameChar_x + 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 38, gameChar_x - 8, gameChar_y - 32);
        line(gameChar_x - 8, gameChar_y - 32, gameChar_x, gameChar_y - 24);
        line(gameChar_x + 4, gameChar_y - 42, gameChar_x + 10, gameChar_y - 35);
        line(
          gameChar_x + 10,
          gameChar_y - 35,
          gameChar_x + 15,
          gameChar_y - 46
        );
        noStroke();
        fill("#ff296d"); // RED
        // hands
        rect(gameChar_x, gameChar_y - 24, 5, 4);
        rect(gameChar_x + 13, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        line(gameChar_x - 2, gameChar_y - 9, gameChar_x - 6, gameChar_y - 2);
        line(gameChar_x + 1, gameChar_y - 9, gameChar_x + 6, gameChar_y - 7);
        line(gameChar_x + 6, gameChar_y - 7, gameChar_x + 4, gameChar_y - 4);
        noStroke();
        strokeWeight(1);
        // char_shoe
        fill("#010014"); // DARK BLUE
        rect(gameChar_x + 3, gameChar_y - 2, 8, 5);
        rect(gameChar_x - 7, gameChar_y - 2, 8, 5);
        walkRightCycle += 1;
        break;
      case 3:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x + 9, gameChar_y - 53, gameChar_x + 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d"); // RED
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 39, gameChar_x - 10, gameChar_y - 34);
        line(gameChar_x - 10, gameChar_y - 34, gameChar_x - 7, gameChar_y - 24);
        line(gameChar_x + 4, gameChar_y - 42, gameChar_x + 10, gameChar_y - 35);
        line(
          gameChar_x + 10,
          gameChar_y - 35,
          gameChar_x + 17,
          gameChar_y - 46
        );
        noStroke();
        fill("#ff296d"); // RED
        // hands
        rect(gameChar_x - 9, gameChar_y - 24, 5, 4);
        rect(gameChar_x + 15, gameChar_y - 48, 5, 4);
        //char_leg
        stroke("#ff296d"); // RED
        line(gameChar_x - 2, gameChar_y - 9, gameChar_x - 3, gameChar_y - 5);
        line(gameChar_x - 3, gameChar_y - 5, gameChar_x - 6, gameChar_y - 4);
        line(gameChar_x + 1, gameChar_y - 9, gameChar_x + 6, gameChar_y - 7);
        line(gameChar_x + 6, gameChar_y - 7, gameChar_x + 6, gameChar_y - 4);
        noStroke();
        strokeWeight(1);
        // char_shoe
        fill("#010014"); // DARK BLUE
        rect(gameChar_x + 5, gameChar_y - 2, 8, 5);
        rect(gameChar_x - 12, gameChar_y - 6, 5, 8);
        walkRightCycle += 1;
        break;
      default:
        // char_head
        fill("#ff296d");
        rect(gameChar_x - 10, gameChar_y - 75, 20, 30);
        // char_eyes
        fill("#d1f9ff");
        ellipse(gameChar_x + 8, gameChar_y - 65, 5, 15);
        fill("#010014");
        ellipse(gameChar_x + 8, gameChar_y - 65, 4, 12);
        // char_mouth
        stroke("#010014");
        line(gameChar_x + 9, gameChar_y - 53, gameChar_x + 4, gameChar_y - 53);
        noStroke();
        // char_neck
        fill("#ff296d");
        rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
        // char_shirt
        fill("#1490b3");
        rect(gameChar_x - 5, gameChar_y - 43, 10, 20);
        // char_shorts
        fill("#010014");
        rect(gameChar_x - 5, gameChar_y - 23, 10, 13);
        // arms
        stroke("#ff296d");
        strokeWeight(3);
        line(gameChar_x, gameChar_y - 39, gameChar_x - 10, gameChar_y - 38);
        line(gameChar_x - 10, gameChar_y - 38, gameChar_x - 9, gameChar_y - 28);
        line(gameChar_x + 4, gameChar_y - 42, gameChar_x + 7, gameChar_y - 35);
        line(gameChar_x + 7, gameChar_y - 35, gameChar_x + 14, gameChar_y - 46);
        noStroke();
        fill("#ff296d");
        // hands
        rect(gameChar_x - 11, gameChar_y - 28, 5, 4);
        rect(gameChar_x + 12, gameChar_y - 47, 5, 4);
        //char_leg
        stroke("#ff296d");
        line(gameChar_x - 2, gameChar_y - 9, gameChar_x - 3, gameChar_y - 5);
        line(gameChar_x - 3, gameChar_y - 5, gameChar_x - 7, gameChar_y - 6);
        line(gameChar_x + 1, gameChar_y - 9, gameChar_x + 6, gameChar_y - 2);
        noStroke();
        strokeWeight(1);
        // char_shoe
        fill("#010014");
        rect(gameChar_x + 5, gameChar_y - 2, 8, 5);
        rect(gameChar_x - 12, gameChar_y - 8, 5, 8);
        walkRightCycle = 0;
        break;
    }
  } else if (isFalling || isPlummeting || isJumping) {
    // char_head
    fill("#ff296d");
    rect(gameChar_x - 20, gameChar_y - 75, 40, 30);
    // char_eyes
    fill("#d1f9ff");
    ellipse(gameChar_x - 5, gameChar_y - 65, 15, 15);
    ellipse(gameChar_x + 5, gameChar_y - 65, 15, 15);
    fill("#010014");
    ellipse(gameChar_x - 5, gameChar_y - 65, 12, 12);
    ellipse(gameChar_x + 5, gameChar_y - 65, 12, 12);
    fill("#d1f9ff");
    ellipse(gameChar_x - 6, gameChar_y - 67, 4, 4);
    ellipse(gameChar_x - 3.75, gameChar_y - 63.5, 3, 3);
    ellipse(gameChar_x + 4, gameChar_y - 67, 4, 4);
    ellipse(gameChar_x + 6.75, gameChar_y - 63.5, 3, 3);
    // char_mouth
    fill("#010014");
    ellipse(gameChar_x, gameChar_y - 53, 8, 5);
    // char_neck
    fill("#ff296d");
    rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
    // char_shirt
    fill("#1490b3");
    rect(gameChar_x - 10, gameChar_y - 43, 20, 20);
    // sleeves
    rect(gameChar_x - 16, gameChar_y - 43, 6, 6, 2);
    rect(gameChar_x + 10, gameChar_y - 43, 6, 6, 2);
    // line and buttons
    stroke("#010014");
    strokeWeight(1);
    line(gameChar_x - 1, gameChar_y - 43, gameChar_x - 1, gameChar_y - 23);
    noStroke();
    fill("#010014");
    ellipse(gameChar_x + 2, gameChar_y - 38, 2, 2);
    ellipse(gameChar_x + 2, gameChar_y - 33, 2, 2);
    ellipse(gameChar_x + 2, gameChar_y - 28, 2, 2);
    // char_arms_hands
    fill("#ff296d");
    // char_right_arm
    rect(gameChar_x - 23, gameChar_y - 41, 9, 3);
    rect(gameChar_x - 23, gameChar_y - 41, 3, 9);
    rect(gameChar_x - 23.5, gameChar_y - 32, 5, 4);
    // char_left_arm
    rect(gameChar_x + 14, gameChar_y - 41, 9, 3);
    rect(gameChar_x + 20.5, gameChar_y - 41, 3, 9);
    rect(gameChar_x + 19.5, gameChar_y - 32, 5, 4);
    // char_shorts
    fill("#010014");
    rect(gameChar_x - 10, gameChar_y - 23, 20, 5);
    rect(gameChar_x - 10, gameChar_y - 18, 8, 4);
    rect(gameChar_x + 2, gameChar_y - 18, 8, 4);
    // char_legs
    fill("#ff296d");
    rect(gameChar_x - 9, gameChar_y - 18, 5, 8);
    rect(gameChar_x + 4, gameChar_y - 18, 5, 8);
    // char_shoes
    fill("#010014");
    rect(gameChar_x - 10, gameChar_y - 10, 8, 5);
    rect(gameChar_x + 2, gameChar_y - 10, 8, 5);
  } else {
    // standing front facing
    // head
    fill("#ff296d");
    rect(gameChar_x - 20, gameChar_y - 75, 40, 30);
    // eyes
    fill("#f5f5f5");
    ellipse(gameChar_x - 5, gameChar_y - 65, 15, 15);
    ellipse(gameChar_x + 5, gameChar_y - 65, 15, 15);
    fill("#010014");
    ellipse(gameChar_x - 5, gameChar_y - 65, 12, 12);
    ellipse(gameChar_x + 5, gameChar_y - 65, 12, 12);
    fill("#d1f9ff");
    ellipse(gameChar_x - 6, gameChar_y - 67, 4, 4);
    ellipse(gameChar_x - 3.75, gameChar_y - 63.5, 3, 3);
    ellipse(gameChar_x + 4, gameChar_y - 67, 4, 4);
    ellipse(gameChar_x + 6.75, gameChar_y - 63.5, 3, 3);
    // smile
    let p1 = { x: gameChar_x + 10, y: gameChar_y - 85 };
    let p2 = { x: gameChar_x + 5, y: gameChar_y - 55 };
    let p3 = { x: gameChar_x - 5, y: gameChar_y - 55 };
    let p4 = { x: gameChar_x - 10, y: gameChar_y - 85 };
    noFill();
    noStroke();
    curve(p1.x, p1.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    stroke("#010014");
    curve(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    noStroke();
    curve(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, p4.x, p4.y);
    // neck
    fill("#ff296d");
    rect(gameChar_x - 2, gameChar_y - 45, 4, 2);
    // shirt
    fill("#1490b3");
    rect(gameChar_x - 10, gameChar_y - 43, 20, 20);
    rect(gameChar_x - 16, gameChar_y - 43, 6, 8, 2);
    rect(gameChar_x + 10, gameChar_y - 43, 6, 8, 2);
    stroke("#010014");
    strokeWeight(1);
    line(gameChar_x - 1, gameChar_y - 43, gameChar_x - 1, gameChar_y - 23);
    noStroke();
    fill("#010014");
    ellipse(gameChar_x + 2, gameChar_y - 38, 2, 2);
    ellipse(gameChar_x + 2, gameChar_y - 33, 2, 2);
    ellipse(gameChar_x + 2, gameChar_y - 28, 2, 2);
    // arms_hands
    fill("#ff296d");
    rect(gameChar_x - 15, gameChar_y - 35, 3, 14);
    rect(gameChar_x + 12, gameChar_y - 35, 3, 14);
    rect(gameChar_x - 16, gameChar_y - 21, 5, 4);
    rect(gameChar_x + 11, gameChar_y - 21, 5, 4);
    // shorts
    fill("#010014");
    rect(gameChar_x - 10, gameChar_y - 23, 20, 5);
    rect(gameChar_x - 10, gameChar_y - 18, 8, 8);
    rect(gameChar_x + 2, gameChar_y - 18, 8, 8);
    // legs
    fill("#ff296d");
    rect(gameChar_x - 9, gameChar_y - 10, 5, 8);
    rect(gameChar_x + 4, gameChar_y - 10, 5, 8);
    // shoes
    fill("#010014");
    rect(gameChar_x - 10, gameChar_y - 2, 8, 5);
    rect(gameChar_x + 2, gameChar_y - 2, 8, 5);
  }
}

// ----------------------------------------------
// Game character movement and position function.
// ----------------------------------------------
function moveGameChar() {
  // Make the character run left.
  if (isLeft) {
    // Stop character from moving after reaching the cabin.
    if (gameChar_world_x > 1640) {
      isLeft = false;
    }
    // Move the character unless the player reaches the cabin.
    if (gameChar_x > width * 0.2 && gameChar_world_x < 1640) {
      gameChar_x -= 5;
    } else if (gameChar_world_x < 1640) {
      scrollPos += 5;
    }
  }
  // Make the character run right.
  if (isRight) {
    // Stop character from moving after reaching the cabin.
    if (gameChar_world_x > 1640) {
      isRight = false;
    }
    // Move the character unless the player reaches the cabin.
    if (gameChar_x < width * 0.8) {
      gameChar_x += 5;
    } else if (gameChar_world_x < 1640) {
      scrollPos -= 5; // negative for moving against the background
    }
  }

  // Make the character jump left.
  if (isLeft && isFalling) {
    // Draw the character jumping to the left
    // Use for loop for a smooth jump
    for (let i = 0; i < 7; i++) {
      gameChar_y -= 1;
      // stop the character from going beyond 70 from the ground
      if (gameChar_y < floorPos_y - 70) {
        gameChar_y = floorPos_y - 70;
        // stop the player from holding the space bar to float in the air
        isFalling = false;
      }
    }
  }
  // Draw the character jumping to the left if the player jumps straight up
  // and then moves left.
  if (gameChar_y < floorPos_y && isLeft) {
    isJumpLeft = true;
  }

  // Make the character jump right.
  if (isRight && isFalling) {
    // Draw the character jumping to the right
    // Use for loop for a smooth jump
    for (let i = 0; i < 7; i++) {
      gameChar_y -= 1;
      // stop the character from going beyond 70 from the ground
      if (gameChar_y < floorPos_y - 70) {
        gameChar_y = floorPos_y - 70;
        // stop the player from holding the space bar to float in the air
        isFalling = false;
      }
    }
  }
  // Draw the character jumping to the right if the player jumps straight up
  // and then moves right.
  if (gameChar_y < floorPos_y && isRight) {
    isJumpRight = true;
  }

  // Make the character jump up.
  if (isFalling) {
    // Use for loop for a smooth jump
    for (let i = 0; i < 10; i++) {
      gameChar_y -= 1;
    }
    // stop the character from going beyond 100 from the ground
    if (gameChar_y < floorPos_y - 100) {
      gameChar_y = floorPos_y - 100;
      // stop the player from holding the space bar to float in the air
      isFalling = false;
    }
  }

  // Make the character fall if above the ground. - Gravity
  if (gameChar_y < floorPos_y) {
    //var isContact = false;
    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].checkContact(gameChar_world_x, gameChar_y)) {
        //isContact = true;
        //break;
        gameChar_y = platforms[i].y - 90;
        break;
      }
    }
    // isJumping = true;
    gameChar_y += 4;
  }
  console.log(isFalling);
  // Make the character fall faster if it's in the canyon.
  if (isPlummeting) {
    gameChar_y += 12;
  }

  // If at ground level then face forward.
  if (gameChar_y >= floorPos_y) {
    isJumping = false;
    isJumpLeft = false;
    isJumpRight = false;
  }

  // Stop the character from going off the left side of the screen.
  if (gameChar_world_x < 194) {
    scrollPos = 0;
    isLeft = false;
  }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw ground.
function drawGround() {
  // draw green ground top layer
  fill("#1AF05A");
  rect(0, floorPos_y - 12, width, height / 4);
  // draw green ground bottom layer
  fill("#01a232");
  rect(0, floorPos_y + 10, width, 10);
  // draw brown ground outline layer
  fill("#A30302");
  rect(0, floorPos_y + 20, width, height / 4);
  // draw brown ground layer
  fill("#570100");
  rect(0, floorPos_y + 30, width, height / 4);
}

// Function to draw midground hill objects.
function drawMidHills() {
  for (var i = 0; i < MidHills.length; i++) {
    fill("#47AD66");
    rect(
      MidHills[i].valley_x_pos,
      MidHills[i].valley_y_pos,
      MidHills[i].valley_width,
      MidHills[i].valley_height
    );
    rect(
      MidHills[i].hill_x_pos,
      MidHills[i].hill_y_pos,
      MidHills[i].hill_width,
      MidHills[i].hill_height
    );
    rect(MidHills[i].hill_x_pos + 30, MidHills[i].hill_y_pos - 15, 15, 15);
    triangle(
      MidHills[i].hill_x_pos + 15,
      MidHills[i].hill_y_pos - 15,
      MidHills[i].hill_x_pos + 38,
      MidHills[i].hill_y_pos - 50,
      MidHills[i].hill_x_pos + 60,
      MidHills[i].hill_y_pos - 15
    );
    rect(MidHills[i].hill_x_pos + 160, MidHills[i].hill_y_pos - 15, 15, 15);
    triangle(
      MidHills[i].hill_x_pos + 145,
      MidHills[i].hill_y_pos - 15,
      MidHills[i].hill_x_pos + 168,
      MidHills[i].hill_y_pos - 50,
      MidHills[i].hill_x_pos + 190,
      MidHills[i].hill_y_pos - 15
    );
    rect(MidHills[i].hill_x_pos + 260, MidHills[i].valley_y_pos - 15, 15, 15);
    triangle(
      MidHills[i].hill_x_pos + 245,
      MidHills[i].valley_y_pos - 15,
      MidHills[i].hill_x_pos + 268,
      MidHills[i].valley_y_pos - 50,
      MidHills[i].hill_x_pos + 290,
      MidHills[i].valley_y_pos - 15
    );
    rect(MidHills[i].hill_x_pos + 360, MidHills[i].valley_y_pos - 15, 15, 15);
    triangle(
      MidHills[i].hill_x_pos + 345,
      MidHills[i].valley_y_pos - 15,
      MidHills[i].hill_x_pos + 368,
      MidHills[i].valley_y_pos - 50,
      MidHills[i].hill_x_pos + 390,
      MidHills[i].valley_y_pos - 15
    );
  }
}

// Function to draw background hill objects.
function drawBackHills() {
  for (var i = 0; i < BackHills.length; i++) {
    fill("#63F28E");
    rect(
      BackHills[i].valley_x_pos,
      BackHills[i].valley_y_pos,
      BackHills[i].valley_width,
      BackHills[i].valley_height
    );
    rect(
      BackHills[i].hill_x_pos,
      BackHills[i].hill_y_pos,
      BackHills[i].hill_width,
      BackHills[i].hill_height
    );
    rect(BackHills[i].hill_x_pos + 30, BackHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      BackHills[i].hill_x_pos + 20,
      BackHills[i].hill_y_pos - 10,
      BackHills[i].hill_x_pos + 35,
      BackHills[i].hill_y_pos - 35,
      BackHills[i].hill_x_pos + 50,
      BackHills[i].hill_y_pos - 10
    );
    rect(BackHills[i].hill_x_pos + 95, BackHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      BackHills[i].hill_x_pos + 85,
      BackHills[i].hill_y_pos - 10,
      BackHills[i].hill_x_pos + 100,
      BackHills[i].hill_y_pos - 35,
      BackHills[i].hill_x_pos + 115,
      BackHills[i].hill_y_pos - 10
    );
    rect(BackHills[i].hill_x_pos + 160, BackHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      BackHills[i].hill_x_pos + 150,
      BackHills[i].hill_y_pos - 10,
      BackHills[i].hill_x_pos + 165,
      BackHills[i].hill_y_pos - 35,
      BackHills[i].hill_x_pos + 180,
      BackHills[i].hill_y_pos - 10
    );
    rect(BackHills[i].hill_x_pos + 260, BackHills[i].valley_y_pos - 10, 10, 10);
    triangle(
      BackHills[i].hill_x_pos + 250,
      BackHills[i].valley_y_pos - 10,
      BackHills[i].hill_x_pos + 265,
      BackHills[i].valley_y_pos - 35,
      BackHills[i].hill_x_pos + 280,
      BackHills[i].valley_y_pos - 10
    );
    rect(BackHills[i].hill_x_pos + 360, BackHills[i].valley_y_pos - 10, 10, 10);
    triangle(
      BackHills[i].hill_x_pos + 350,
      BackHills[i].valley_y_pos - 10,
      BackHills[i].hill_x_pos + 365,
      BackHills[i].valley_y_pos - 35,
      BackHills[i].hill_x_pos + 380,
      BackHills[i].valley_y_pos - 10
    );
  }
}

// Function to draw cloud objects.
function drawClouds() {
  for (var i = 0; i < clouds.length; i++) {
    drawingContext.filter = "blur(10px)";
    fill("#646464");
    ellipse(
      clouds[i].x_pos + 5,
      clouds[i].y_pos + 15,
      clouds[i].width - 30,
      clouds[i].height - 60
    );
    ellipse(
      clouds[i].x_pos + 75,
      clouds[i].y_pos + 25,
      clouds[i].width - 70,
      clouds[i].height - 90
    );
    drawingContext.filter = "blur(10px)";
    fill("#f5f5f5");
    ellipse(
      clouds[i].x_pos,
      clouds[i].y_pos,
      clouds[i].width,
      clouds[i].height - 30
    );
    ellipse(
      clouds[i].x_pos + 70,
      clouds[i].y_pos + 10,
      clouds[i].width - 40,
      clouds[i].height - 60
    );
    drawingContext.filter = "none";
  }
}

// Function to draw mountains objects.
function drawMountains() {
  for (var i = 0; i < mountains.length; i++) {
    fill("#646464");
    triangle(
      mountains[i].x_pos,
      mountains[i].y_pos,
      mountains[i].x_pos + mountains[i].width / 2,
      mountains[i].y_pos - mountains[i].height,
      mountains[i].x_pos + mountains[i].width,
      mountains[i].y_pos
    );
    triangle(
      mountains[i].x_pos + 85,
      mountains[i].y_pos,
      mountains[i].x_pos + mountains[i].width / 2 + 85,
      mountains[i].y_pos - mountains[i].height + 50,
      mountains[i].x_pos + mountains[i].width + 85,
      mountains[i].y_pos
    );
    //snowcaps
    fill("#f5f5f5");
    triangle(
      mountains[i].x_pos + 70,
      mountains[i].y_pos - 250,
      mountains[i].x_pos + mountains[i].width / 2,
      mountains[i].y_pos - mountains[i].height,
      mountains[i].x_pos + 100,
      mountains[i].y_pos - 250
    );
    triangle(
      mountains[i].x_pos + 70,
      mountains[i].y_pos - 250,
      mountains[i].x_pos + mountains[i].width / 2,
      mountains[i].y_pos - mountains[i].height + 60,
      mountains[i].x_pos + 100,
      mountains[i].y_pos - 250
    );
    triangle(
      mountains[i].x_pos + 153,
      mountains[i].y_pos - 200,
      mountains[i].x_pos + mountains[i].width / 2 + 85,
      mountains[i].y_pos - mountains[i].height + 50,
      mountains[i].x_pos + 187,
      mountains[i].y_pos - 200
    );
    triangle(
      mountains[i].x_pos + 153,
      mountains[i].y_pos - 200,
      mountains[i].x_pos + mountains[i].width / 2 + 85,
      mountains[i].y_pos - mountains[i].height + 110,
      mountains[i].x_pos + 187,
      mountains[i].y_pos - 200
    );
    // middle outline
    stroke(255, 255, 255, 15);
    strokeWeight(3);
    line(
      mountains[i].x_pos + 85,
      mountains[i].y_pos - 3,
      mountains[i].x_pos + mountains[i].width / 2 + 85,
      mountains[i].y_pos - mountains[i].height + 50
    );
    strokeWeight(1);
    noStroke();
  }
}

// Function to draw trees objects.
function drawTrees() {
  for (var i = 0; i < trees_x.length; i++) {
    // trunk
    fill("#8b4513");
    rect(trees_x[i] - 15, floorPos_y - 40, 30, 40);
    fill("#996633");
    rect(trees_x[i] - 15, floorPos_y - 40, 5, 40);
    // leaves
    fill("#005625");
    triangle(
      trees_x[i] - 70,
      floorPos_y - 40,
      trees_x[i],
      floorPos_y - 110,
      trees_x[i] + 70,
      floorPos_y - 40
    );
    fill("#016725");
    triangle(
      trees_x[i] - 65,
      floorPos_y - 50,
      trees_x[i],
      floorPos_y - 115,
      trees_x[i] + 65,
      floorPos_y - 50
    );
    fill("#008b31");
    triangle(
      trees_x[i] - 60,
      floorPos_y - 60,
      trees_x[i],
      floorPos_y - 120,
      trees_x[i] + 60,
      floorPos_y - 60
    );
    fill("#01a232");
    triangle(
      trees_x[i] - 55,
      floorPos_y - 70,
      trees_x[i],
      floorPos_y - 125,
      trees_x[i] + 55,
      floorPos_y - 70
    );
  }
}

// Function to draw the cabin.
function drawCabin() {
  stroke("#4d301b");
  // Cabin roof
  // Main roof section
  fill("#b78a60");
  beginShape();
  vertex(width + 600, cabin_y + 100);
  vertex(width + 800, cabin_y + 100);
  vertex(width + 900, cabin_y + 175);
  vertex(width + 700, cabin_y + 175);
  endShape(CLOSE);
  // Front slant beam - right
  beginShape();
  vertex(width + 600, cabin_y + 100);
  vertex(width + 700, cabin_y + 175);
  vertex(width + 700, cabin_y + 190);
  vertex(width + 600, cabin_y + 115);
  endShape(CLOSE);
  // Front slant beam - left
  beginShape();
  vertex(width + 600, cabin_y + 100);
  vertex(width + 600, cabin_y + 115);
  vertex(width + 500, cabin_y + 190);
  vertex(width + 500, cabin_y + 175);
  endShape(CLOSE);
  // Long beam
  fill("#8c634a");
  beginShape();
  vertex(width + 700, cabin_y + 175);
  vertex(width + 700, cabin_y + 190);
  vertex(width + 900, cabin_y + 190);
  vertex(width + 900, cabin_y + 175);
  endShape(CLOSE);
  // Underside of roof
  beginShape();
  vertex(width + 500, cabin_y + 190);
  vertex(width + 530, cabin_y + 190);
  vertex(width + 530, cabin_y + 175);
  vertex(width + 604, cabin_y + 118);
  vertex(width + 600, cabin_y + 115);
  endShape(CLOSE);
  // Cabin walls and windows
  // Front top wall
  fill("#b78a60");
  noStroke();
  triangle(
    width + 530,
    cabin_y + 175,
    width + 604,
    cabin_y + 118,
    width + 680,
    cabin_y + 175
  );
  stroke("#4d301b");
  rect(width + 530, cabin_y + 175, 150, 40);
  // Round window
  fill("#775d4d");
  ellipse(width + 600, cabin_y + 175, 50, 50);
  fill("#fadb86");
  ellipse(width + 600, cabin_y + 175, 42, 42);
  strokeWeight(3);
  line(width + 578, cabin_y + 175, width + 621, cabin_y + 175);
  line(width + 600, cabin_y + 155, width + 600, cabin_y + 195);
  // Wood plank lines from top to bottom.
  strokeWeight(1);
  line(width + 586, cabin_y + 130, width + 620, cabin_y + 130); // top triangle
  line(width + 568, cabin_y + 145, width + 640, cabin_y + 145);
  line(width + 620, cabin_y + 160, width + 660, cabin_y + 160); // right side of window - top
  line(width + 548, cabin_y + 160, width + 580, cabin_y + 160); // left side of window - top
  line(width + 530, cabin_y + 190, width + 580, cabin_y + 190); // left side of window - bottom
  line(width + 620, cabin_y + 190, width + 680, cabin_y + 190); // right side of window - bottom
  line(width + 530, cabin_y + 205, width + 680, cabin_y + 205);
  // Side top wall
  fill("#8c634a");
  rect(width + 680, cabin_y + 190, 210, 25);
  noStroke();
  triangle(
    width + 680,
    cabin_y + 175,
    width + 700,
    cabin_y + 190,
    width + 680,
    cabin_y + 190
  );
  stroke("#4d301b");
  line(width + 680, cabin_y + 205, width + 890, cabin_y + 205);
  // Side bottom wall
  rect(width + 720, cabin_y + 215, 170, 150);
  // Side square window
  fill("#b78a60");
  rect(width + 765, cabin_y + 245, 80, 80);
  fill("#fadb86");
  rect(width + 770, cabin_y + 250, 70, 70);
  // Wood plank lines from top to bottom.
  strokeWeight(3);
  line(width + 770, cabin_y + 285, width + 840, cabin_y + 285);
  line(width + 805, cabin_y + 250, width + 805, cabin_y + 320);
  strokeWeight(1);
  line(width + 720, cabin_y + 230, width + 890, cabin_y + 230);
  line(width + 720, cabin_y + 245, width + 890, cabin_y + 245);
  line(width + 720, cabin_y + 260, width + 765, cabin_y + 260); // left side of window
  line(width + 845, cabin_y + 260, width + 890, cabin_y + 260); // right side of window
  line(width + 720, cabin_y + 275, width + 765, cabin_y + 275); // left side of window
  line(width + 845, cabin_y + 275, width + 890, cabin_y + 275); // right side of window
  line(width + 720, cabin_y + 290, width + 765, cabin_y + 290); // left side of window
  line(width + 845, cabin_y + 290, width + 890, cabin_y + 290); // right side of window
  line(width + 720, cabin_y + 305, width + 765, cabin_y + 305); // left side of window
  line(width + 845, cabin_y + 305, width + 890, cabin_y + 305); // right side of window
  line(width + 720, cabin_y + 320, width + 765, cabin_y + 320); // left side of window
  line(width + 845, cabin_y + 320, width + 890, cabin_y + 320); // right side of window
  line(width + 720, cabin_y + 335, width + 890, cabin_y + 335);
  line(width + 720, cabin_y + 350, width + 890, cabin_y + 350);
  // Front bottom wall next to side wall.
  fill("#b78a60");
  rect(width + 687, cabin_y + 215, 32, 150);
  line(width + 687, cabin_y + 230, width + 719, cabin_y + 230);
  line(width + 687, cabin_y + 245, width + 719, cabin_y + 245);
  line(width + 687, cabin_y + 260, width + 719, cabin_y + 260);
  line(width + 687, cabin_y + 275, width + 719, cabin_y + 275);
  line(width + 687, cabin_y + 290, width + 719, cabin_y + 290);
  line(width + 687, cabin_y + 305, width + 719, cabin_y + 305);
  line(width + 687, cabin_y + 320, width + 719, cabin_y + 320);
  line(width + 687, cabin_y + 335, width + 719, cabin_y + 335);
  line(width + 687, cabin_y + 350, width + 719, cabin_y + 350);
  // Right side of right pillar
  fill("#8c634a");
  rect(width + 680, cabin_y + 215, 7, 150);
  // Right side of porch
  rect(width + 680, cabin_y + 365, 210, 10);
  // Right side of first leg
  rect(width + 680, cabin_y + 375, 7, 40);
  // Right side of second leg
  rect(width + 720, cabin_y + 375, 7, 40);
  // Right side of third leg
  rect(width + 883, cabin_y + 375, 7, 40);
  // Front side of first leg
  fill("#b78a60");
  rect(width + 670, cabin_y + 375, 10, 40);
  // Front side of second leg
  rect(width + 710, cabin_y + 375, 10, 40);
  // Front side of third leg
  rect(width + 873, cabin_y + 375, 10, 40);
  // Front side of right pillar
  rect(width + 670, cabin_y + 215, 10, 150);
  // Front side of porch - right side of stairs
  rect(width + 605, cabin_y + 365, 75, 10);
  // Side of steps
  fill("#8c634a");
  beginShape();
  vertex(width + 605, cabin_y + 365);
  vertex(width + 605, cabin_y + 415);
  vertex(width + 555, cabin_y + 415);
  vertex(width + 555, cabin_y + 400);
  vertex(width + 572, cabin_y + 400);
  vertex(width + 572, cabin_y + 383);
  vertex(width + 587, cabin_y + 383);
  vertex(width + 587, cabin_y + 365);
  endShape(CLOSE);
  // Front of steps
  fill("#b78a60");
  rect(width + 515, cabin_y + 400, 40, 14.5);
  fill("#b78a60");
  rect(width + 530, cabin_y + 382, 44, 18);
  rect(width + 545, cabin_y + 365, 48, 17);
  // Front side of left pillar
  rect(width + 530, cabin_y + 215, 10, 150);
  // Side of left pillar
  fill("#8c634a");
  rect(width + 540, cabin_y + 215, 7, 150);
  // Front side of porch - left side of stairs
  fill("#b78a60");
  rect(width + 530, cabin_y + 365, 15, 10);
  // Front side of left leg
  rect(width + 530, cabin_y + 375, 10, 7);
  // Side of left leg
  fill("#8c634a");
  rect(width + 540, cabin_y + 375, 4, 7);
  // Front bottom wall
  fill("#b78a60");
  rect(width + 560, cabin_y + 215, 110, 150);
  line(width + 560, cabin_y + 230, width + 670, cabin_y + 230);
  line(width + 560, cabin_y + 245, width + 670, cabin_y + 245);
  line(width + 560, cabin_y + 260, width + 670, cabin_y + 260);
  line(width + 560, cabin_y + 275, width + 670, cabin_y + 275);
  line(width + 560, cabin_y + 290, width + 670, cabin_y + 290);
  line(width + 560, cabin_y + 305, width + 670, cabin_y + 305);
  line(width + 560, cabin_y + 320, width + 670, cabin_y + 320);
  line(width + 560, cabin_y + 335, width + 670, cabin_y + 335);
  line(width + 560, cabin_y + 350, width + 670, cabin_y + 350);
  // Top frame of door
  fill("#8c634a");
  rect(width + 590, cabin_y + 275, 70, 10);
  // Left frame of door
  rect(width + 590, cabin_y + 285, 10, 80);
  // Right frame of door
  rect(width + 650, cabin_y + 285, 10, 80);
  // Door
  fill("#C91916");
  rect(width + 600, cabin_y + 285, 50, 80);
  // Door handle
  fill("#fadb86");
  ellipse(width + 610, cabin_y + 325, 7);
}

// ------------------------------------
// Flagpole render and check functions.
// ------------------------------------

// Function to draw flagpole.
function renderFlagpole() {
  push();
  strokeWeight(5);
  stroke("black");
  line(
    flagpole.x_pos,
    floorPos_y,
    flagpole.x_pos,
    floorPos_y - flagpole.flag_height
  );
  fill("#C91916");
  noStroke();
  if (flagpole.isReached) {
    rect(flagpole.x_pos, floorPos_y - flagpole.flag_height, 50, 50);
  } else {
    rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
  }
  pop();
}

// Function to check flagpole is reached or not.
function checkFlagpole() {
  var d = abs(gameChar_world_x - flagpole.x_pos);
  if (d < 5) {
    flagpole.isReached = true;
  }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon) {
  fill("#47AD66");
  rect(
    t_canyon.x_pos - t_canyon.width / 2,
    floorPos_y - 15,
    t_canyon.width,
    height - floorPos_y
  );
  // Canyon sides
  fill("#A30302");
  rect(
    t_canyon.x_pos - t_canyon.width / 2 - 10,
    floorPos_y + 30,
    10,
    height - floorPos_y
  );
  rect(
    t_canyon.x_pos + t_canyon.width / 2,
    floorPos_y + 30,
    10,
    height - floorPos_y
  );
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon) {
  // Jumping over and falling down the canyon.
  if (
    gameChar_y >= floorPos_y &&
    gameChar_world_x > t_canyon.x_pos - 35 &&
    gameChar_world_x < t_canyon.x_pos + 35
  ) {
    isLeft = false;
    isRight = false;
    isPlummeting = true;
    // Position the character in the canyon so his body and arms stay within the
    // canyon walls.
    if (gameChar_world_x < t_canyon.x_pos) {
      gameChar_x = t_canyon.x_pos + scrollPos - 15;
    } else {
      gameChar_x = t_canyon.x_pos + scrollPos + 15;
    }
  }
}

// -----------------------------------
// Functions to create animated water.
// -----------------------------------

// Function to create array of image objects for water animation.
function createWaterImgArray(t_water_array) {
  // There are 17 images.
  for (var i = 0; i < 17; i++) {
    // Naming convention for the images:
    // image 1.png, image 2.png, image 3.png, etc.
    imgFrameNum = i + 1;
    imgFrame = imgFrameNum.toString();
    img = loadImage("water/image " + imgFrame + ".png");
    t_water_array.push(img);
  }
}
// Function to draw animated water.
function drawWater(t_canyon, t_water_array, t_water_cycle) {
  image(
    t_water_array[t_water_cycle],
    t_canyon.x_pos - 40,
    floorPos_y + 65,
    80,
    80
  );
}

// ---------------------------------------------
// Collectable items render and check functions.
// ---------------------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable) {
  fill("#E89507");
  ellipse(
    t_collectable.x_pos,
    t_collectable.y_pos,
    t_collectable.size - 15,
    t_collectable.size - 15
  );
  fill("#febc06");
  ellipse(
    t_collectable.x_pos,
    t_collectable.y_pos,
    t_collectable.size - 20,
    t_collectable.size - 20
  );
  fill("#E89507");
  textSize(30);
  textFont(fontRobotoBold);
  text("1", t_collectable.x_pos - 8, t_collectable.y_pos + 11);
}

// Function to check character has collected an item.
function checkCollectable(t_collectable) {
  if (
    dist(
      gameChar_world_x,
      gameChar_y,
      t_collectable.x_pos,
      t_collectable.y_pos
    ) < 30
  ) {
    t_collectable.isFound = true;
    game_score += 1;
  }
}

// Function to draw collectable counter.
function drawCollectableCounter() {
  fill("#E89507");
  ellipse(54, 40, 35, 35);
  fill("#febc06");
  ellipse(54, 40, 30, 30);
  fill("#E89507");
  textSize(30);
  textFont(fontRobotoBold);
  text("1", 46, 51);
  fill("white");
  textSize(36);
  textFont(fontRobotoBold);
  text(game_score, 78, 52);
}

// -------------------------
// Fuctions to start/end the game.
// -------------------------

// Function to start game.
function startGame() {
  gameChar_x = width - 830;
  gameChar_y = floorPos_y;

  // Variable to control the background scrolling.
  // Subract width and 300 to work on cabin. Set to 0 to reset.
  scrollPos = 0;

  // Boolean variables to control the movement of the game character.
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;
  isJumpLeft = false;
  isJumpRight = false;
  isJumping = false;
  // Boolean variable to control appearance of collectable items.
  isFound = false;

  // Variable to cycle through walking animation.
  walkLeftCycle = 0;
  walkRightCycle = 0;

  // Variable to count collectable items.
  game_score = 0;

  // Variable to hold flagpole object.
  flagpole = { isReached: false, x_pos: 1520, flag_height: 300 };

  // Variable for cabin y position.
  cabin_y = 20;

  // Initialise arrays of background/foreground objects.
  trees_x = [230, 530, 740, 1080, 1380];

  clouds = [
    {
      x_pos: 280,
      y_pos: 100,
      width: 100,
      height: 100,
    },
    {
      x_pos: 800,
      y_pos: 100,
      width: 150,
      height: 150,
    },
    {
      x_pos: 980,
      y_pos: 200,
      width: 100,
      height: 100,
    },
    {
      x_pos: 1580,
      y_pos: 50,
      width: 150,
      height: 150,
    },
  ];

  mountains = [
    {
      x_pos: 400,
      y_pos: 420,
      width: 170,
      height: 300,
    },
    {
      x_pos: 640,
      y_pos: 420,
      width: 170,
      height: 300,
    },
    {
      x_pos: 1290,
      y_pos: 420,
      width: 170,
      height: 300,
    },
  ];

  MidHills = [
    {
      valley_x_pos: 0,
      valley_y_pos: floorPos_y - 20,
      valley_width: 500,
      valley_height: 160,
      hill_x_pos: 0,
      hill_y_pos: floorPos_y - 80,
      hill_width: 200,
      hill_height: 600,
    },
    {
      valley_x_pos: 500,
      valley_y_pos: floorPos_y - 20,
      valley_width: 500,
      valley_height: 160,
      hill_x_pos: 700,
      hill_y_pos: floorPos_y - 80,
      hill_width: 200,
      hill_height: 60,
    },
    {
      valley_x_pos: 1000,
      valley_y_pos: floorPos_y - 20,
      valley_width: 500,
      valley_height: 160,
      hill_x_pos: 1200,
      hill_y_pos: floorPos_y - 80,
      hill_width: 200,
      hill_height: 60,
    },
  ];

  BackHills = [
    {
      valley_x_pos: 50,
      valley_y_pos: floorPos_y - 60,
      valley_width: 500,
      valley_height: 160,
      hill_x_pos: 150,
      hill_y_pos: floorPos_y - 120,
      hill_width: 200,
      hill_height: 60,
    },
    {
      valley_x_pos: 400,
      valley_y_pos: floorPos_y - 60,
      valley_width: 500,
      valley_height: 160,
      hill_x_pos: 550,
      hill_y_pos: floorPos_y - 120,
      hill_width: 200,
      hill_height: 60,
    },
    {
      valley_x_pos: 900,
      valley_y_pos: floorPos_y - 110,
      valley_width: 600,
      valley_height: 210,
      hill_x_pos: 1050,
      hill_y_pos: floorPos_y - 170,
      hill_width: 200,
      hill_height: 60,
    },
    {
      valley_x_pos: 1500,
      valley_y_pos: floorPos_y - 110,
      valley_width: 600,
      valley_height: 210,
      hill_x_pos: 1550,
      hill_y_pos: floorPos_y - 170,
      hill_width: 200,
      hill_height: 60,
    },
  ];

  canyons = [
    {
      x_pos: 348,
      width: 80,
    },
    {
      x_pos: 948,
      width: 80,
    },
    {
      x_pos: 1230,
      width: 80,
    },
  ];

  platforms = [];

  platforms.push(createPlatforms(500, floorPos_y - 100, 100));

  // Each water animation requires it's own array and cycle count.
  // Arrays to store water animation frames.
  water_array = [];
  water_cycle = [];
  for (let i = 0; i < canyons.length; i++) {
    water_array.push([]);
    water_cycle.push(0);
  }
  // Function to create array of water animation frames.
  for (var i = 0; i < water_array.length; i++) {
    createWaterImgArray(water_array[i]);
  }

  collectables = [
    {
      x_pos: 460,
      y_pos: 415,
      size: 50,
      isFound: false,
    },
    {
      x_pos: 820,
      y_pos: 415,
      size: 50,
      isFound: false,
    },
    {
      x_pos: 1130,
      y_pos: 415,
      size: 50,
      isFound: false,
    },
  ];

  liveShapes = [
    {
      x_pos: 790,
      y_pos: -35,
    },
    {
      x_pos: 840,
      y_pos: -35,
    },
    {
      x_pos: 890,
      y_pos: -35,
    },
  ];
}

// Function to draw live counter.
function drawLiveCounter(t_live) {
  fill("#C91916");
  ellipse(t_live.x_pos + 66.6, t_live.y_pos + 66.6, 20, 20);
  ellipse(t_live.x_pos + 83.2, t_live.y_pos + 66.6, 20, 20);
  triangle(
    t_live.x_pos + 91.2,
    t_live.y_pos + 72.6,
    t_live.x_pos + 75,
    t_live.y_pos + 95,
    t_live.x_pos + 58.6,
    t_live.y_pos + 72.6
  );
  ellipse(t_live.x_pos + 66.6, t_live.y_pos + 66.6, 20, 20);
  ellipse(t_live.x_pos + 83.2, t_live.y_pos + 66.6, 20, 20);
  triangle(
    t_live.x_pos + 91.2,
    t_live.y_pos + 72.6,
    t_live.x_pos + 75,
    t_live.y_pos + 95,
    t_live.x_pos + 58.6,
    t_live.y_pos + 72.6
  );
  ellipse(t_live.x_pos + 66.6, t_live.y_pos + 66.6, 20, 20);
  ellipse(t_live.x_pos + 83.2, t_live.y_pos + 66.6, 20, 20);
  triangle(
    t_live.x_pos + 91.2,
    t_live.y_pos + 72.6,
    t_live.x_pos + 75,
    t_live.y_pos + 95,
    t_live.x_pos + 58.6,
    t_live.y_pos + 72.6
  );
}

// Function to check if the player has died.
function checkPlayerDie() {
  // Restart the player's position and subtract a life after a fall into the canyon.
  if (gameChar_y > height + 100) {
    scrollPos = 0;
    gameChar_x = width - 830;
    gameChar_y = floorPos_y;
    isPlummeting = false;
    game_score = 0;
    lives -= 1;
    for (var i = 0; i < collectables.length; i++) {
      collectables[i].isFound = false;
    }
  }
}

// Function to end game after player loses all life.
function loseGame() {
  scrollPos = 0;
  gameChar_y = floorPos_y + height;
  fill("grey");
  rect(100, floorPos_y - 30, 30, 30);
  ellipse(115, floorPos_y - 30, 30);
  textSize(10);
  fill("black");
  text("RIP", 107.5, floorPos_y - 20);
  // "GAME OVER"
  textSize(84);
  textFont(fontRobotoBold);
  text("GAME OVER!", 275, height / 2);
  textSize(20);
  text("Click try again!", 455, height / 2 + 75);
  // Button to restart game
  rect(467, 307, 106, 36, 10);
  fill("#0FCAFF");
  rect(470, 310, 100, 30, 10);
  fill("white");
  textSize(18);
  text("Try Again", 483, 330);
  return;
}

// Function to end game after player wins.
function winGame() {
  // Make the character go up the stairs, stand on the cabin's porch, and give
  // winning message.
  if (gameChar_world_x > 1558) {
    gameChar_y = cabin_y + 398;
  }
  if (gameChar_world_x > 1570) {
    gameChar_y = cabin_y + 386;
  }
  if (gameChar_world_x > 1575) {
    gameChar_y = cabin_y + 370;
  }
  if (gameChar_world_x > 1580) {
    gameChar_y = cabin_y + 363;
    isJumping = false;
    isJumpLeft = false;
    isJumpRight = false;
    textSize(84);
    stroke("black");
    textFont(fontRobotoBold);
    fill("#C91916");
    text("You Made It Home!", 175, height / 2);
    textSize(20);
    fill("white");
    text("Level complete! Click play again!", 375, height / 2 + 75);
    // Button to restart game
    fill("black");
    rect(467, 307, 104, 36, 10);
    fill("#C91916");
    rect(470, 310, 100, 30, 10);
    fill("white");
    textSize(18);
    text("Play Again", 478, 331);
  }
}

// Function to restart the game.
function playAgain() {
  scrollPos = 0;
  gameChar_x = width - 830;
  gameChar_y = floorPos_y;
  isPlummeting = false;
  flagpole.isReached = false;
  game_score = 0;
  lives = 3;
  for (var i = 0; i < collectables.length; i++) {
    collectables[i].isFound = false;
  }
}

function createPlatforms(x, y, length) {
  var p = {
    x: x,
    y: y,
    length: length,
    draw: function () {
      fill(255, 0, 255);
      rect(this.x, this.y, this.length, 20);
    },
    checkContact: function (gc_x, gc_y) {
      if (gc_x > this.x && gc_x < this.x + this.length) {
        var d = this.y - gc_y;
        if (d >= 0 && d < 5) {
          return true;
        }
      }
      return false;
    },
  };
  return p;
}
