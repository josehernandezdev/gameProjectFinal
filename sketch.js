/*

The Game Project 7/8 - Make it awesome!

*/
//
var gameState;
var gameOver;
var charColor;
var charGold;
var charRed;
var colorCount;
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

// ------------------
// Background objects
// ------------------
var clouds;
var mountains;
var midHills;
var backHills;
var trees_x;
var canyons;
var collectables;
var isFound; // make collectables disappear
var cabin;
var flagpole;
var game_score;
var lifeCounter;
var lifes;
var extraLife;
var platforms;
// ---------------
// Water animation
// ---------------
var water_array;
var water_cycle;
var img;

// -------
// Enemies
// -------
var enemies;
var enemyImgArray = [];

// ------
// Sounds
// ------
var jumpSound;
var waterSound;
var loseSound;
var gameSound;
var coinSound;
var achievementSound;

function preload() {
  for (var i = 0; i < 25; i++) {
    enemyImgArray[i] = loadImage("assets/enemy/enemy" + i + ".png");
  }

  fontRobotoBold = loadFont("assets/Roboto-Bold.ttf");

  soundFormats("mp3", "wav");

  jumpSound = loadSound("assets/jumpSound.wav");
  jumpSound.setVolume(0.4);

  loseSound = loadSound("assets/loseSound.wav");
  loseSound.setVolume(0.3);
  loseSound.playMode("restart");

  gameSound = loadSound("assets/game.mp3");
  gameSound.setVolume(0.3);

  coinSound = loadSound("assets/coinSound.wav");
  coinSound.setVolume(0.2);

  achievementSound = loadSound("assets/Achievement.mp3");
  achievementSound.setVolume(0.3);

  waterSound = loadSound("assets/waterSound.wav");
  waterSound.setVolume(0.5);
  waterSound.playMode("restart");

  lifeSound = loadSound("assets/lifeSound.wav");
  lifeSound.setVolume(0.5);
}

function setup() {
  createCanvas(1024, 576);
  floorPos_y = (height * 3) / 4;
  // Variable to count life left.
  lifes = 3;

  startGame();
}

function draw() {
  // ---------------
  // Draw background
  // ---------------

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

  // --------------------------------------------
  // Draw interactive objects and game character.
  // --------------------------------------------

  // Draw the platforms.
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  // Draw extra lifes and check if player collects them.
  for (let i = 0; i < extraLife.length; i++) {
    if (extraLife.length > 0) {
      extraLife[i].draw();
      if (extraLife[i].checkContact(gameChar_world_x, gameChar_y)) {
        lifeSound.play();
        extraLife.splice(i, 1);
        if (lifes < 3) {
          lifes++;
        }
      }
    }
  }
  // If player collects life, momentarily turn the character
  // into a red color.
  if (charRed) {
    colorCount++;
    if (colorCount < 7) {
      charColor = "#C91916";
    } else {
      charColor = "AliceWhite";
      colorCount = 0;
      charRed = false;
    }
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
  // If player collects item, momentarily turn the character
  // into a gold color.
  if (charGold) {
    colorCount++;
    if (colorCount < 7) {
      charColor = "gold";
    } else {
      charColor = "AliceWhite";
      colorCount = 0;
      charGold = false;
    }
  }

  drawCabin();

  // Draw flagpole and check if player reaches flagpole.
  renderFlagpole();
  if (flagpole.isReached == false) {
    checkFlagpole();
  }

  // Draw enemies and check if player is hit by enemy.
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw();
    if (enemies[i].checkContact(gameChar_world_x, gameChar_y)) {
      playerDie();
    }
  }

  pop(); // End scrolling background.

  // If the game is over, remove the collectable counter and life
  // counter, and stop the draw() function from looping.
  if (!gameOver) {
    drawCollectableCounter();
    for (var i = 0; i < lifes; i++) {
      drawLifeCounter(lifeCounter[i]);
    }
  } else {
    noLoop();
  }

  drawGameChar();

  push();
  translate(scrollPos, 0); // Implement scrolling background.

  // These objects need to go in front of the character.
  // Draw water animation in canyon.
  for (var i = 0; i < canyons.length; i++) {
    drawWater(canyons[i], water_array[i], water_cycle[i]);
    // Run and reset water animation.
    if (water_cycle[i] > 15) {
      water_cycle[i] = 0;
    } else {
      water_cycle[i] += 1;
    }
  }
  pop(); // End scrolling background.

  // ---------------------------------------------
  // Logic for character movement and interaction.
  // ---------------------------------------------

  // Function for character movement and positioning.
  moveGameChar();

  // Check if the player falls into a canyon and dies.
  if (gameChar_y > height + 100) {
    playerDie();
  }

  // If the player loses all his lifes, then the game is over.
  if (lifes < 1) {
    loseGame();
  }

  // Update real position of gameChar for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

  // If the player reaches the flag, then the game is won.
  if (flagpole.isReached) {
    winGame();
  }

  // For very first instance of game, draw a button to start the game.
  drawStartButton();
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
  // left arrow
  if (keyCode == 37 && gameState == "start") {
    isLeft = true;
  }

  // right arrow
  if (keyCode == 39 && gameState == "start") {
    isRight = true;
  }

  // space bar
  if (
    (keyCode == 32 && gameState == "start") ||
    (keyCode == 231 && gameState == "start") ||
    (keyCode == 0 && gameState == "start")
  ) {
    if (!isFalling) {
      gameChar_y -= 100;
      jumpSound.play();
    }
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
}

function mouseClicked() {
  // If the player clicks the mouse when over the restart button, restart the game.
  if (mouseX > 465 && mouseX < 575 && mouseY > 305 && mouseY < 345) {
    playAgain();
    loop();
  }
  // can't be in the same spot as above
  rect(50, 307, 106, 36, 10);
  if (mouseX > 50 && mouseX < 156 && mouseY > 307 && mouseY < 343) {
    startButton();
  }
}

// ------------------------------
// Game character render function
// ------------------------------

function drawGameChar() {
  if (isLeft && isFalling) {
    // jumping-left
    fill(charColor);
    // body
    rect(gameChar_x - 18, gameChar_y - 67, 38, 60, 5, 20, 5, 20);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 18, gameChar_y - 67, 38, 60, 5, 20, 5, 20);
    drawingContext.filter = "none";
    // legs
    beginShape();
    curveVertex(gameChar_x - 4, gameChar_y - 7);
    curveVertex(gameChar_x - 4, gameChar_y - 7);
    curveVertex(gameChar_x + 4, gameChar_y - 2);
    curveVertex(gameChar_x + 8, gameChar_y - 2);
    curveVertex(gameChar_x + 16, gameChar_y - 7);
    curveVertex(gameChar_x + 16, gameChar_y - 7);
    endShape();
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x - 15, gameChar_y - 44, 7, 20);
    fill("#01261C");
    ellipse(gameChar_x - 16, gameChar_y - 44, 5, 17);
  } else if (isRight && isFalling) {
    // jumping right
    fill(charColor);
    // body
    rect(gameChar_x - 18, gameChar_y - 67, 38, 60, 20, 5, 20, 5);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 18, gameChar_y - 67, 38, 60, 20, 5, 20, 5);
    drawingContext.filter = "none";
    // legs
    beginShape();
    curveVertex(gameChar_x + 4, gameChar_y - 7);
    curveVertex(gameChar_x + 4, gameChar_y - 7);
    curveVertex(gameChar_x - 4, gameChar_y - 2);
    curveVertex(gameChar_x - 8, gameChar_y - 2);
    curveVertex(gameChar_x - 16, gameChar_y - 7);
    curveVertex(gameChar_x - 16, gameChar_y - 7);
    endShape();
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x + 15, gameChar_y - 44, 7, 20);
    fill("#01261C");
    ellipse(gameChar_x + 16, gameChar_y - 44, 5, 17);
  } else if (isLeft) {
    fill(charColor);
    // body
    rect(gameChar_x - 18, gameChar_y - 57, 38, 60, 5, 20, 5, 20);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 18, gameChar_y - 57, 38, 60, 5, 20, 5, 20);
    drawingContext.filter = "none";
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x - 15, gameChar_y - 34, 7, 20);
    fill("#01261C");
    ellipse(gameChar_x - 16, gameChar_y - 34, 5, 17);
  } else if (isRight) {
    fill(charColor);
    // body
    rect(gameChar_x - 18, gameChar_y - 57, 38, 60, 20, 5, 20, 5);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 18, gameChar_y - 57, 38, 60, 20, 5, 20, 5);
    drawingContext.filter = "none";
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x + 16, gameChar_y - 34, 7, 20);
    fill("#01261C");
    ellipse(gameChar_x + 17, gameChar_y - 34, 5, 17);
  } else if (isFalling || isPlummeting) {
    // body
    fill(charColor);
    rect(gameChar_x - 23, gameChar_y - 67, 46, 60, 20, 20, 5, 5);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 23, gameChar_y - 67, 46, 60, 20, 20, 0, 0);
    drawingContext.filter = "none";
    // legs
    beginShape();
    curveVertex(gameChar_x - 23, gameChar_y - 7);
    curveVertex(gameChar_x - 23, gameChar_y - 7);
    curveVertex(gameChar_x - 17, gameChar_y - 2);
    curveVertex(gameChar_x - 10, gameChar_y - 2);
    curveVertex(gameChar_x, gameChar_y - 7);
    curveVertex(gameChar_x, gameChar_y - 7);
    endShape();
    beginShape();
    curveVertex(gameChar_x + 23, gameChar_y - 7);
    curveVertex(gameChar_x + 23, gameChar_y - 7);
    curveVertex(gameChar_x + 17, gameChar_y - 2);
    curveVertex(gameChar_x + 10, gameChar_y - 2);
    curveVertex(gameChar_x, gameChar_y - 7);
    curveVertex(gameChar_x, gameChar_y - 7);
    endShape();
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x - 8, gameChar_y - 44, 20, 20);
    ellipse(gameChar_x + 8, gameChar_y - 44, 20, 20);
    fill("#01261C");
    ellipse(gameChar_x - 8, gameChar_y - 44, 17, 17);
    ellipse(gameChar_x + 8, gameChar_y - 44, 17, 17);
    // smile
    stroke("#01261C");
    beginShape();
    curveVertex(gameChar_x - 10, gameChar_y - 30);
    curveVertex(gameChar_x - 10, gameChar_y - 30);
    curveVertex(gameChar_x - 5, gameChar_y - 25);
    curveVertex(gameChar_x + 5, gameChar_y - 25);
    curveVertex(gameChar_x + 10, gameChar_y - 30);
    curveVertex(gameChar_x + 10, gameChar_y - 30);
    endShape();
    fill("#F2ECE4");
    rect(gameChar_x - 4, gameChar_y - 30, 4, 3);
    rect(gameChar_x, gameChar_y - 30, 4, 3);
    // eyes
    ellipse(gameChar_x - 10, gameChar_y - 46, 8, 8);
    ellipse(gameChar_x - 5, gameChar_y - 41, 4, 4);
    ellipse(gameChar_x + 6, gameChar_y - 46, 8, 8);
    ellipse(gameChar_x + 11, gameChar_y - 41, 4, 4);
  } else {
    // standing front facing
    // body
    fill(charColor);
    rect(gameChar_x - 23, gameChar_y - 57, 46, 60, 20, 20, 5, 5);
    drawingContext.filter = "blur(15px)";
    rect(gameChar_x - 23, gameChar_y - 57, 46, 60, 20, 20, 5, 5);
    drawingContext.filter = "none";
    // eyes
    fill("#F2ECE4");
    ellipse(gameChar_x - 8, gameChar_y - 34, 20, 20);
    ellipse(gameChar_x + 8, gameChar_y - 34, 20, 20);
    fill("#01261C");
    ellipse(gameChar_x - 8, gameChar_y - 34, 17, 17);
    ellipse(gameChar_x + 8, gameChar_y - 34, 17, 17);
    fill("#F2ECE4");
    stroke("#01261C");
    ellipse(gameChar_x - 10, gameChar_y - 36, 8, 8);
    ellipse(gameChar_x - 5, gameChar_y - 31, 4, 4);
    ellipse(gameChar_x + 6, gameChar_y - 36, 8, 8);
    ellipse(gameChar_x + 11, gameChar_y - 31, 4, 4);
    // smile
    noFill();
    beginShape();
    curveVertex(gameChar_x - 10, gameChar_y - 20);
    curveVertex(gameChar_x - 10, gameChar_y - 20);
    curveVertex(gameChar_x - 5, gameChar_y - 15);
    curveVertex(gameChar_x + 5, gameChar_y - 15);
    curveVertex(gameChar_x + 10, gameChar_y - 20);
    curveVertex(gameChar_x + 10, gameChar_y - 20);
    endShape();
  }
}

// ----------------------------------------------
// Game character movement and position function.
// ----------------------------------------------
function moveGameChar() {
  // Make the character run left.
  if (isLeft) {
    // Move the character unless the player reaches the cabin.
    if (gameChar_x > width * 0.2 && gameChar_world_x < 1640) {
      gameChar_x -= 7;
    } else if (gameChar_world_x < cabin.x + 616) {
      scrollPos += 7;
    }
  }
  // Make the character run right.
  if (isRight) {
    // Move the character unless the player reaches the cabin.
    if (gameChar_x < width * 0.8) {
      gameChar_x += 7;
    } else if (gameChar_world_x < cabin.x + 616) {
      scrollPos -= 7; // negative for moving against the background
    }
  }

  // Make the character jump left.
  if (isLeft && isFalling) {
    if (gameChar_x > width * 0.2 && gameChar_world_x < cabin.x + 616) {
      gameChar_x += 1;
    } else {
      scrollPos -= 1;
    }
  }
  // Make the character jump right.
  if (isRight && isFalling) {
    if (gameChar_x < width * 0.8) {
      gameChar_x -= 1;
    } else {
      scrollPos += 1;
    }
  }

  // Make the character fall if above the ground and not on a platform. - Gravity
  if (gameChar_y < floorPos_y) {
    var isContact = false;
    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].checkContact(gameChar_world_x, gameChar_y)) {
        isContact = true;
        break;
      }
    }
    if (!isContact) {
      gameChar_y += 4;
      isFalling = true;
    } else {
      isFalling = false;
    }
  } else {
    isFalling = false;
  }

  // Make the character fall faster if it's in the canyon.
  if (isPlummeting) {
    gameChar_y += 24;
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
  for (var i = 0; i < midHills.length; i++) {
    fill("#47AD66");
    rect(
      midHills[i].valley_x_pos,
      midHills[i].valley_y_pos,
      midHills[i].valley_width,
      midHills[i].valley_height
    );
    rect(
      midHills[i].hill_x_pos,
      midHills[i].hill_y_pos,
      midHills[i].hill_width,
      midHills[i].hill_height
    );
    rect(midHills[i].hill_x_pos + 30, midHills[i].hill_y_pos - 15, 15, 15);
    triangle(
      midHills[i].hill_x_pos + 15,
      midHills[i].hill_y_pos - 15,
      midHills[i].hill_x_pos + 38,
      midHills[i].hill_y_pos - 50,
      midHills[i].hill_x_pos + 60,
      midHills[i].hill_y_pos - 15
    );
    rect(midHills[i].hill_x_pos + 160, midHills[i].hill_y_pos - 15, 15, 15);
    triangle(
      midHills[i].hill_x_pos + 145,
      midHills[i].hill_y_pos - 15,
      midHills[i].hill_x_pos + 168,
      midHills[i].hill_y_pos - 50,
      midHills[i].hill_x_pos + 190,
      midHills[i].hill_y_pos - 15
    );
    rect(midHills[i].hill_x_pos + 260, midHills[i].valley_y_pos - 15, 15, 15);
    triangle(
      midHills[i].hill_x_pos + 245,
      midHills[i].valley_y_pos - 15,
      midHills[i].hill_x_pos + 268,
      midHills[i].valley_y_pos - 50,
      midHills[i].hill_x_pos + 290,
      midHills[i].valley_y_pos - 15
    );
    rect(midHills[i].hill_x_pos + 360, midHills[i].valley_y_pos - 15, 15, 15);
    triangle(
      midHills[i].hill_x_pos + 345,
      midHills[i].valley_y_pos - 15,
      midHills[i].hill_x_pos + 368,
      midHills[i].valley_y_pos - 50,
      midHills[i].hill_x_pos + 390,
      midHills[i].valley_y_pos - 15
    );
  }
}

// Function to draw background hill objects.
function drawBackHills() {
  for (var i = 0; i < backHills.length; i++) {
    fill("#63F28E");
    rect(
      backHills[i].valley_x_pos,
      backHills[i].valley_y_pos,
      backHills[i].valley_width,
      backHills[i].valley_height
    );
    rect(
      backHills[i].hill_x_pos,
      backHills[i].hill_y_pos,
      backHills[i].hill_width,
      backHills[i].hill_height
    );
    rect(backHills[i].hill_x_pos + 30, backHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      backHills[i].hill_x_pos + 20,
      backHills[i].hill_y_pos - 10,
      backHills[i].hill_x_pos + 35,
      backHills[i].hill_y_pos - 35,
      backHills[i].hill_x_pos + 50,
      backHills[i].hill_y_pos - 10
    );
    rect(backHills[i].hill_x_pos + 95, backHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      backHills[i].hill_x_pos + 85,
      backHills[i].hill_y_pos - 10,
      backHills[i].hill_x_pos + 100,
      backHills[i].hill_y_pos - 35,
      backHills[i].hill_x_pos + 115,
      backHills[i].hill_y_pos - 10
    );
    rect(backHills[i].hill_x_pos + 160, backHills[i].hill_y_pos - 10, 10, 10);
    triangle(
      backHills[i].hill_x_pos + 150,
      backHills[i].hill_y_pos - 10,
      backHills[i].hill_x_pos + 165,
      backHills[i].hill_y_pos - 35,
      backHills[i].hill_x_pos + 180,
      backHills[i].hill_y_pos - 10
    );
    rect(backHills[i].hill_x_pos + 260, backHills[i].valley_y_pos - 10, 10, 10);
    triangle(
      backHills[i].hill_x_pos + 250,
      backHills[i].valley_y_pos - 10,
      backHills[i].hill_x_pos + 265,
      backHills[i].valley_y_pos - 35,
      backHills[i].hill_x_pos + 280,
      backHills[i].valley_y_pos - 10
    );
    rect(backHills[i].hill_x_pos + 360, backHills[i].valley_y_pos - 10, 10, 10);
    triangle(
      backHills[i].hill_x_pos + 350,
      backHills[i].valley_y_pos - 10,
      backHills[i].hill_x_pos + 365,
      backHills[i].valley_y_pos - 35,
      backHills[i].hill_x_pos + 380,
      backHills[i].valley_y_pos - 10
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
    rect(trees_x[i] - 15, floorPos_y - 40, 30, 28);
    fill("#996633");
    rect(trees_x[i] - 15, floorPos_y - 40, 5, 28);
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
  vertex(cabin.x + 600, cabin.y + 100);
  vertex(cabin.x + 800, cabin.y + 100);
  vertex(cabin.x + 900, cabin.y + 175);
  vertex(cabin.x + 700, cabin.y + 175);
  endShape(CLOSE);
  // Front slant beam - right
  beginShape();
  vertex(cabin.x + 600, cabin.y + 100);
  vertex(cabin.x + 700, cabin.y + 175);
  vertex(cabin.x + 700, cabin.y + 190);
  vertex(cabin.x + 600, cabin.y + 115);
  endShape(CLOSE);
  // Front slant beam - left
  beginShape();
  vertex(cabin.x + 600, cabin.y + 100);
  vertex(cabin.x + 600, cabin.y + 115);
  vertex(cabin.x + 500, cabin.y + 190);
  vertex(cabin.x + 500, cabin.y + 175);
  endShape(CLOSE);
  // Long beam
  fill("#8c634a");
  beginShape();
  vertex(cabin.x + 700, cabin.y + 175);
  vertex(cabin.x + 700, cabin.y + 190);
  vertex(cabin.x + 900, cabin.y + 190);
  vertex(cabin.x + 900, cabin.y + 175);
  endShape(CLOSE);
  // Underside of roof
  beginShape();
  vertex(cabin.x + 500, cabin.y + 190);
  vertex(cabin.x + 530, cabin.y + 190);
  vertex(cabin.x + 530, cabin.y + 175);
  vertex(cabin.x + 604, cabin.y + 118);
  vertex(cabin.x + 600, cabin.y + 115);
  endShape(CLOSE);
  // Cabin walls and windows
  // Front top wall
  fill("#b78a60");
  noStroke();
  triangle(
    cabin.x + 530,
    cabin.y + 175,
    cabin.x + 604,
    cabin.y + 118,
    cabin.x + 680,
    cabin.y + 175
  );
  stroke("#4d301b");
  rect(cabin.x + 530, cabin.y + 175, 150, 40);
  // Round window
  fill("#775d4d");
  ellipse(cabin.x + 600, cabin.y + 175, 50, 50);
  fill("#fadb86");
  ellipse(cabin.x + 600, cabin.y + 175, 42, 42);
  strokeWeight(3);
  line(cabin.x + 578, cabin.y + 175, cabin.x + 621, cabin.y + 175);
  line(cabin.x + 600, cabin.y + 155, cabin.x + 600, cabin.y + 195);
  // Wood plank lines from top to bottom.
  strokeWeight(1);
  line(cabin.x + 586, cabin.y + 130, cabin.x + 620, cabin.y + 130); // top triangle
  line(cabin.x + 568, cabin.y + 145, cabin.x + 640, cabin.y + 145);
  line(cabin.x + 620, cabin.y + 160, cabin.x + 660, cabin.y + 160); // right side of window - top
  line(cabin.x + 548, cabin.y + 160, cabin.x + 580, cabin.y + 160); // left side of window - top
  line(cabin.x + 530, cabin.y + 190, cabin.x + 580, cabin.y + 190); // left side of window - bottom
  line(cabin.x + 620, cabin.y + 190, cabin.x + 680, cabin.y + 190); // right side of window - bottom
  line(cabin.x + 530, cabin.y + 205, cabin.x + 680, cabin.y + 205);
  // Side top wall
  fill("#8c634a");
  rect(cabin.x + 680, cabin.y + 190, 210, 25);
  noStroke();
  triangle(
    cabin.x + 680,
    cabin.y + 175,
    cabin.x + 700,
    cabin.y + 190,
    cabin.x + 680,
    cabin.y + 190
  );
  stroke("#4d301b");
  line(cabin.x + 680, cabin.y + 205, cabin.x + 890, cabin.y + 205);
  // Side bottom wall
  rect(cabin.x + 720, cabin.y + 215, 170, 150);
  // Side square window
  fill("#b78a60");
  rect(cabin.x + 765, cabin.y + 245, 80, 80);
  fill("#fadb86");
  rect(cabin.x + 770, cabin.y + 250, 70, 70);
  // Wood plank lines from top to bottom.
  strokeWeight(3);
  line(cabin.x + 770, cabin.y + 285, cabin.x + 840, cabin.y + 285);
  line(cabin.x + 805, cabin.y + 250, cabin.x + 805, cabin.y + 320);
  strokeWeight(1);
  line(cabin.x + 720, cabin.y + 230, cabin.x + 890, cabin.y + 230);
  line(cabin.x + 720, cabin.y + 245, cabin.x + 890, cabin.y + 245);
  line(cabin.x + 720, cabin.y + 260, cabin.x + 765, cabin.y + 260); // left side of window
  line(cabin.x + 845, cabin.y + 260, cabin.x + 890, cabin.y + 260); // right side of window
  line(cabin.x + 720, cabin.y + 275, cabin.x + 765, cabin.y + 275); // left side of window
  line(cabin.x + 845, cabin.y + 275, cabin.x + 890, cabin.y + 275); // right side of window
  line(cabin.x + 720, cabin.y + 290, cabin.x + 765, cabin.y + 290); // left side of window
  line(cabin.x + 845, cabin.y + 290, cabin.x + 890, cabin.y + 290); // right side of window
  line(cabin.x + 720, cabin.y + 305, cabin.x + 765, cabin.y + 305); // left side of window
  line(cabin.x + 845, cabin.y + 305, cabin.x + 890, cabin.y + 305); // right side of window
  line(cabin.x + 720, cabin.y + 320, cabin.x + 765, cabin.y + 320); // left side of window
  line(cabin.x + 845, cabin.y + 320, cabin.x + 890, cabin.y + 320); // right side of window
  line(cabin.x + 720, cabin.y + 335, cabin.x + 890, cabin.y + 335);
  line(cabin.x + 720, cabin.y + 350, cabin.x + 890, cabin.y + 350);
  // Front bottom wall next to side wall.
  fill("#b78a60");
  rect(cabin.x + 687, cabin.y + 215, 32, 150);
  line(cabin.x + 687, cabin.y + 230, cabin.x + 719, cabin.y + 230);
  line(cabin.x + 687, cabin.y + 245, cabin.x + 719, cabin.y + 245);
  line(cabin.x + 687, cabin.y + 260, cabin.x + 719, cabin.y + 260);
  line(cabin.x + 687, cabin.y + 275, cabin.x + 719, cabin.y + 275);
  line(cabin.x + 687, cabin.y + 290, cabin.x + 719, cabin.y + 290);
  line(cabin.x + 687, cabin.y + 305, cabin.x + 719, cabin.y + 305);
  line(cabin.x + 687, cabin.y + 320, cabin.x + 719, cabin.y + 320);
  line(cabin.x + 687, cabin.y + 335, cabin.x + 719, cabin.y + 335);
  line(cabin.x + 687, cabin.y + 350, cabin.x + 719, cabin.y + 350);
  // Right side of right pillar
  fill("#8c634a");
  rect(cabin.x + 680, cabin.y + 215, 7, 150);
  // Right side of porch
  rect(cabin.x + 680, cabin.y + 365, 210, 10);
  // Right side of first leg
  rect(cabin.x + 680, cabin.y + 375, 7, 40);
  // Right side of second leg
  rect(cabin.x + 720, cabin.y + 375, 7, 40);
  // Right side of third leg
  rect(cabin.x + 883, cabin.y + 375, 7, 40);
  // Front side of first leg
  fill("#b78a60");
  rect(cabin.x + 670, cabin.y + 375, 10, 40);
  // Front side of second leg
  rect(cabin.x + 710, cabin.y + 375, 10, 40);
  // Front side of third leg
  rect(cabin.x + 873, cabin.y + 375, 10, 40);
  // Front side of right pillar
  rect(cabin.x + 670, cabin.y + 215, 10, 150);
  // Front side of porch - right side of stairs
  rect(cabin.x + 605, cabin.y + 365, 75, 10);
  // Side of steps
  fill("#8c634a");
  beginShape();
  vertex(cabin.x + 605, cabin.y + 365);
  vertex(cabin.x + 605, cabin.y + 415);
  vertex(cabin.x + 555, cabin.y + 415);
  vertex(cabin.x + 555, cabin.y + 400);
  vertex(cabin.x + 572, cabin.y + 400);
  vertex(cabin.x + 572, cabin.y + 383);
  vertex(cabin.x + 587, cabin.y + 383);
  vertex(cabin.x + 587, cabin.y + 365);
  endShape(CLOSE);
  // Front of steps
  fill("#b78a60");
  rect(cabin.x + 515, cabin.y + 400, 40, 14.5);
  fill("#b78a60");
  rect(cabin.x + 530, cabin.y + 382, 44, 18);
  rect(cabin.x + 545, cabin.y + 365, 48, 17);
  // Front side of left pillar
  rect(cabin.x + 530, cabin.y + 215, 10, 150);
  // Side of left pillar
  fill("#8c634a");
  rect(cabin.x + 540, cabin.y + 215, 7, 150);
  // Front side of porch - left side of stairs
  fill("#b78a60");
  rect(cabin.x + 530, cabin.y + 365, 15, 10);
  // Front side of left leg
  rect(cabin.x + 530, cabin.y + 375, 10, 7);
  // Side of left leg
  fill("#8c634a");
  rect(cabin.x + 540, cabin.y + 375, 4, 7);
  // Front bottom wall
  fill("#b78a60");
  rect(cabin.x + 560, cabin.y + 215, 110, 150);
  line(cabin.x + 560, cabin.y + 230, cabin.x + 670, cabin.y + 230);
  line(cabin.x + 560, cabin.y + 245, cabin.x + 670, cabin.y + 245);
  line(cabin.x + 560, cabin.y + 260, cabin.x + 670, cabin.y + 260);
  line(cabin.x + 560, cabin.y + 275, cabin.x + 670, cabin.y + 275);
  line(cabin.x + 560, cabin.y + 290, cabin.x + 670, cabin.y + 290);
  line(cabin.x + 560, cabin.y + 305, cabin.x + 670, cabin.y + 305);
  line(cabin.x + 560, cabin.y + 320, cabin.x + 670, cabin.y + 320);
  line(cabin.x + 560, cabin.y + 335, cabin.x + 670, cabin.y + 335);
  line(cabin.x + 560, cabin.y + 350, cabin.x + 670, cabin.y + 350);
  // Top frame of door
  fill("#8c634a");
  rect(cabin.x + 590, cabin.y + 275, 70, 10);
  // Left frame of door
  rect(cabin.x + 590, cabin.y + 285, 10, 80);
  // Right frame of door
  rect(cabin.x + 650, cabin.y + 285, 10, 80);
  // Door
  fill("#C91916");
  rect(cabin.x + 600, cabin.y + 285, 50, 80);
  // Door handle
  fill("#fadb86");
  ellipse(cabin.x + 610, cabin.y + 325, 7);
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
    gameChar_world_x > t_canyon.x_pos - t_canyon.width / 2 + 25 &&
    gameChar_world_x < t_canyon.x_pos + t_canyon.width / 2 - 25
  ) {
    isLeft = false;
    isRight = false;
    isPlummeting = true;
    waterSound.play();
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
    t_canyon.x_pos - t_canyon.width / 2,
    floorPos_y + 65,
    t_canyon.width,
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
  text("I", t_collectable.x_pos - 5, t_collectable.y_pos + 11);
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
    coinSound.play();
    charGold = true;
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
  text("I", 50, 51);
  fill("white");
  textSize(36);
  textFont(fontRobotoBold);
  text(game_score, 78, 52);
}

// -------------------------
// Functions to start/end the game.
// -------------------------

// Function to start game.
function startGame() {
  gameState = "waiting";
  gameOver = false;
  // Variables to set the characters initial position
  gameChar_x = 100;
  gameChar_y = floorPos_y;
  // Variables to control the character's color
  charColor = "AliceBlue";
  charGold = false;
  charRed = false;
  colorCount = 0;
  // Variable to control the background scrolling
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

  // X and Y position of cabin
  cabin = {
    y: 20,
    x: 1024,
  };

  // Initialise arrays of background/foreground objects.
  trees_x = [230, 530, 740, 1080, 1380];

  // X, Y, width, and height of clouds
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

  // X, Y, width, and height of mountains
  mountains = [
    {
      x_pos: 400,
      y_pos: 420,
      width: 170,
      height: 300,
    },
    {
      x_pos: 600,
      y_pos: 420,
      width: 170,
      height: 300,
    },
    {
      x_pos: 1340,
      y_pos: 420,
      width: 170,
      height: 300,
    },
  ];

  // X, Y, width and height of hills
  midHills = [
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

  // X, Y, width and height of hills
  backHills = [
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

  // X position and width of canyons
  canyons = [
    {
      x_pos: 348,
      width: 100,
    },
    {
      x_pos: 948,
      width: 180,
    },
    {
      x_pos: 1230,
      width: 180,
    },
  ];

  // Enemy constructor
  enemies = [];
  enemies.push(new Enemy(500, floorPos_y - 10, 100, enemyImgArray));
  enemies.push(new Enemy(1350, floorPos_y - 10, 100, enemyImgArray));

  // platform factory
  platforms = [];
  platforms.push(createPlatforms(1210, floorPos_y - 50, 40));
  platforms.push(createPlatforms(600, floorPos_y - 50, 40));
  platforms.push(createPlatforms(665, floorPos_y - 106, 40));
  platforms.push(createPlatforms(780, floorPos_y - 146, 40));

  // extra life factory
  extraLife = [];
  extraLife.push(createExtraLife(775, floorPos_y - 255));
  extraLife.push(createExtraLife(985, floorPos_y - 135));

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

  // X, Y, size, and status of collectable items.
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

  // X and Y positions of life icons.
  lifeCounter = [
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

// Draw the start button
function drawStartButton() {
  if (gameState == "waiting") {
    fill("black");
    textSize(24);
    text("Click", 75, 300);
    rect(50, 307, 106, 36, 10);
    fill("#0FCAFF");
    rect(53, 310, 100, 30, 10);
    fill("white");
    textSize(16);
    text("Begin Game", 60, 330);
  }
}
function startButton() {
  // Set game state to start.
  gameState = "start";
  gameSound.loop();
}

// Extra life factory
function createExtraLife(x, y) {
  life = {
    x: x,
    y: y,
    draw: function () {
      fill("#C91916");
      ellipse(this.x + 66.6, this.y + 66.6, 20, 20);
      ellipse(this.x + 83.2, this.y + 66.6, 20, 20);
      triangle(
        this.x + 91.2,
        this.y + 72.6,
        this.x + 75,
        this.y + 95,
        this.x + 58.6,
        this.y + 72.6
      );
      ellipse(this.x + 66.6, this.y + 66.6, 20, 20);
      ellipse(this.x + 83.2, this.y + 66.6, 20, 20);
      triangle(
        this.x + 91.2,
        this.y + 72.6,
        this.x + 75,
        this.y + 95,
        this.x + 58.6,
        this.y + 72.6
      );
      ellipse(this.x + 66.6, this.y + 66.6, 20, 20);
      ellipse(this.x + 83.2, this.y + 66.6, 20, 20);
      triangle(
        this.x + 91.2,
        this.y + 72.6,
        this.x + 75,
        this.y + 95,
        this.x + 58.6,
        this.y + 72.6
      );
    },
    checkContact: function (gc_x, gc_y) {
      if (dist(gc_x, gc_y, this.x + 75, this.y + 70) < 30) {
        charRed = true;
        return true;
      }
    },
  };
  return life;
}

// Function to draw life counter.
function drawLifeCounter(t_life) {
  fill("#C91916");
  ellipse(t_life.x_pos + 66.6, t_life.y_pos + 66.6, 20, 20);
  ellipse(t_life.x_pos + 83.2, t_life.y_pos + 66.6, 20, 20);
  triangle(
    t_life.x_pos + 91.2,
    t_life.y_pos + 72.6,
    t_life.x_pos + 75,
    t_life.y_pos + 95,
    t_life.x_pos + 58.6,
    t_life.y_pos + 72.6
  );
  ellipse(t_life.x_pos + 66.6, t_life.y_pos + 66.6, 20, 20);
  ellipse(t_life.x_pos + 83.2, t_life.y_pos + 66.6, 20, 20);
  triangle(
    t_life.x_pos + 91.2,
    t_life.y_pos + 72.6,
    t_life.x_pos + 75,
    t_life.y_pos + 95,
    t_life.x_pos + 58.6,
    t_life.y_pos + 72.6
  );
  ellipse(t_life.x_pos + 66.6, t_life.y_pos + 66.6, 20, 20);
  ellipse(t_life.x_pos + 83.2, t_life.y_pos + 66.6, 20, 20);
  triangle(
    t_life.x_pos + 91.2,
    t_life.y_pos + 72.6,
    t_life.x_pos + 75,
    t_life.y_pos + 95,
    t_life.x_pos + 58.6,
    t_life.y_pos + 72.6
  );
}

// Function for when the player has died.
function playerDie() {
  scrollPos = 0;
  gameChar_x = 100;
  gameChar_y = floorPos_y;
  isPlummeting = false;
  game_score = 0;
  lifes -= 1;
  for (var i = 0; i < collectables.length; i++) {
    collectables[i].isFound = false;
  }
}

// Function to end game after player loses all life.
function loseGame() {
  gameOver = true;
  scrollPos = 0;
  gameChar_y = floorPos_y + height;
  noStroke();
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
  gameSound.stop();
  loseSound.play();
  return;
}

// Function to end game after player wins.
function winGame() {
  // Make the character go up the stairs, stand on the cabin's porch, and give
  // winning message.
  if (gameChar_world_x > cabin.x + 534) {
    gameChar_y = cabin.y + 398;
  }
  if (gameChar_world_x > cabin.x + 546) {
    gameChar_y = cabin.y + 386;
  }
  if (gameChar_world_x > cabin.x + 551) {
    gameChar_y = cabin.y + 370;
  }
  if (gameChar_world_x > cabin.x + 586) {
    gameChar_y = cabin.y + 363;
    isFalling = false;
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
    gameSound.stop();
    achievementSound.play();
    noLoop();
  }
}

// Function to restart the game.
function playAgain() {
  scrollPos = 0;
  gameChar_x = 100;
  gameChar_y = floorPos_y;
  isPlummeting = false;
  flagpole.isReached = false;
  game_score = 0;
  gameOver = false;
  // stop and start the game sound so it does not overlap
  gameSound.stop();
  gameSound.loop();
  lifes = 3;
  for (var i = 0; i < collectables.length; i++) {
    collectables[i].isFound = false;
  }
  // Restart extra life factory
  extraLife.push(createExtraLife(775, floorPos_y - 255));
  extraLife.push(createExtraLife(985, floorPos_y - 135));
}

// Platform factory function
function createPlatforms(x, y, length) {
  var p = {
    x: x,
    y: y,
    length: length,
    draw: function () {
      fill("#01a232");
      rect(this.x, this.y, this.length, 5);
      fill("#A30302");
      rect(this.x, this.y + 5, this.length, 5);
      fill("#570100");
      rect(this.x, this.y + 10, this.length, 5);
    },
    checkContact: function (gc_x, gc_y) {
      if (gc_x > this.x - 5 && gc_x < this.x + this.length + 5) {
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

// Enemy constructor function
function Enemy(x, y, range, imgArray) {
  this.x = x;
  this.y = y;
  this.range = range;
  this.imgArray = imgArray;

  this.cycle = 0;
  this.currentX = x;
  this.inc = 1;

  this.update = function () {
    this.currentX += this.inc;

    if (this.currentX >= this.x + this.range) {
      this.inc = -1;
    } else if (this.currentX < this.x) {
      this.inc = 1;
    }
  };

  this.draw = function () {
    this.update();
    image(this.imgArray[this.cycle], this.currentX - 50, this.y - 60, 100, 100);
    if (this.cycle < this.imgArray.length - 1) {
      this.cycle++;
    } else {
      this.cycle = 0;
    }
  };

  this.checkContact = function (gc_x, gc_y) {
    var d = dist(gc_x, gc_y, this.currentX, this.y);
    if (d < 20) {
      return true;
    } else {
      return false;
    }
  };
}
