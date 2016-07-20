//Symbolic constants
//Time in ms between individual asteroid spawns
var AST_SPAWN_INTERVAL;

//Distance in pixels the player moves every gameLoop() step.
var TRAVEL_DISTANCE = 4;
//Distance in pixels an asteroid moves every gameLoop() step.
var AST_TRAVEL_DISTANCE;

//Default possible asteroid sizes.
var ASTEROID_LARGE = 40;
var ASTEROID_MED = 25;
var ASTEROID_SMALL = 10;

//Global variables

//Controls current position of moving element onscreen.
//Also the starting position relative to the svg.
var totalDistanceY = 745;
var totalDistanceX = 0;

//Keeps track of the player's score for the session
var score = 0;

//Keeps track of whether or not the game has ended
var gameOver;

//Functions

/*
Begins all necessary functions to start a new game.
Clears the screen and currentAsteroids of all asteroids, removes the GAME OVER
message. Resets all variables. Triggered when the spacebar is pressed.
Opens high score list when the 'h' key is pressed.
*/
var spacebarOk = true;
function readyGame() {
  gotScores = false;
  document.onkeydown = function(e) {
    if(e.keyCode === 72) {
      spacebarOk = false;
      document.getElementById('gameover').style.visibility = 'hidden';
      document.getElementById('highscores').style.visibility = 'visible';
      if(gotScores === false)
        getScores();
    }  else if(e.keyCode === 32) {
      if(spacebarOk === true) {
        playAgain();
      }
    }
  }
}

function playAgain() {
  spacebarOk = true;
  document.getElementById('titlescreen').style.visibility = 'hidden';
  document.getElementById('scoreArea').style.visibility = 'visible';
  document.getElementById('player').style.visibility = 'visible';
  document.getElementById('gameover').style.visibility = 'hidden';
  document.getElementById('highscores').style.visibility = 'hidden';
  document.getElementById('asteroidField').innerHTML = '';
  document.getElementById('scoretable').innerHTML = '';
  currentAsteroids = [];
  document.getElementById('player').style.top = '745px';
  document.getElementById('player').style.left = '0px';
  totalDistanceY = 745;
  totalDistanceX = 0;
  AST_SPAWN_INTERVAL = 100;
  AST_TRAVEL_DISTANCE = 4;
  gameOver = false;
  score = 0;
  spawnAsteroid();
  gameLoop();
  keyBoardControl();
  scoreTrack();
}

//Updates the score for the player in the current session.
function scoreTrack() {
  if(gameOver === false) {
    score += 1;
    document.getElementById('scoreArea').innerHTML = 'SCORE: ' + score;
  }
}

/*
Edits page CSS to change the position of elements (ships). Takes three parameters:
"movee," which is the ID of the element that is going to be moved, "distance,"
which is the distance per function call that the element will move, and "direction,"
which is the direction the element moves onscreen, either up, down, left, or right.
*/
function moveShip(movee, distance, direction) {
  var ship = document.getElementById(movee).style;

  if(direction == 'up') {
    totalDistanceY -= distance;
    ship.top = String(totalDistanceY) + 'px';
  }

  if(direction == 'down') {
    totalDistanceY += distance;
    ship.top = String(totalDistanceY) + 'px';
  }

  if(direction == 'right') {
    totalDistanceX += distance;
    ship.left = String(totalDistanceX) + 'px';
  }

  if(direction == 'left') {
    totalDistanceX -= distance;
    ship.left = String(totalDistanceX) + 'px';
  }
}

//Array contains all arrow key presses that still need to be acted upon.
//It's an array vs. a var so that multiple directions can be used at once, allowing
//the player to move diagonally.
var currentKeys = [];

/*
Detects which arrow key is being pressed down and adds its corresponding direction
to currentKeys array. After the key is released, it removes all instances of that
direction from currentKeys so as to make sure that gameLoop does not continuously
read a particular direction that hasn't been removed from currentKeys.
*/
function keyBoardControl() {
  if(gameOver === false) {
    document.onkeydown = function(e) {
      switch(e.keyCode) {
        case 37:
          currentKeys.push('left');
          break;
        case 39:
          currentKeys.push('right');
          break;
        case 40:
          currentKeys.push('down');
          break;
        case 38:
          currentKeys.push('up');
          break;
      }
    }
    document.onkeyup = function(e) {
      switch(e.keyCode) {
        case 37:
          while(currentKeys.indexOf('left') >= 0)
            currentKeys.splice(currentKeys.indexOf('left'), 1);
          break;
        case 39:
          while(currentKeys.indexOf('right') >= 0)
            currentKeys.splice(currentKeys.indexOf('right'), 1);
          break;
        case 40:
          while(currentKeys.indexOf('down') >= 0)
            currentKeys.splice(currentKeys.indexOf('down'), 1);
          break;
        case 38:
          while(currentKeys.indexOf('up') >= 0)
            currentKeys.splice(currentKeys.indexOf('up'), 1);
          break;
      }
    }
  }
}

/*
Controls the pace of onscreen movement. Executes every 2ms. Searches for directions
in currentKeys and if it finds one, calls moveShip on the player in that direction.
*/
function gameLoop() {
  if(gameOver === false) {
    var ship = document.getElementById('player').style;
    //Don't allow the ship to move in the direction of an edge it is touching.
    if(currentKeys.indexOf('left') >= 0 && parseInt(ship.left.substring(0, ship.left.indexOf('p'))) > -476) {
      moveShip('player', TRAVEL_DISTANCE, 'left')
    }
    if(currentKeys.indexOf('right') >= 0 && parseInt(ship.left.substring(0, ship.left.indexOf('p'))) < 476) {
      moveShip('player', TRAVEL_DISTANCE, 'right')
    }
    if(currentKeys.indexOf('down') >= 0 && parseInt(ship.top.substring(0, ship.top.indexOf('p'))) < 749) {
      moveShip('player', TRAVEL_DISTANCE, 'down')
    }
    if(currentKeys.indexOf('up') >= 0 && parseInt(ship.top.substring(0, ship.top.indexOf('p'))) > 1) {
      moveShip('player', TRAVEL_DISTANCE, 'up')
    }

    scoreTrack();

    //Once the asteroid has left the screen, destroy it to free memory
    if(currentAsteroids.length > 0) {
      for(i = 0; i < currentAsteroids.length; i++) {
        var asteroid = document.getElementById('a' + currentAsteroids[i]);
        if(parseInt(asteroid.getAttribute('cy')) >= 900) {
          destroyAsteroid(currentAsteroids[i]);
        }
        if(currentAsteroids[i] != null)
          asteroidFall('a' + currentAsteroids[i]);
        //Collision detection between ship and asteroid
        var shipCx = parseInt(ship.left.substring(0, ship.left.indexOf('p'))) + 499;
        var shipCy = parseInt(ship.top.substring(0, ship.top.indexOf('p'))) + 24;
        var asterRadius = parseInt(asteroid.getAttribute('r'));
        var asterCx = parseInt(asteroid.getAttribute('cx'));
        var asterCy = parseInt(asteroid.getAttribute('cy'));
        if(Math.pow(Math.abs(shipCx - asterCx), 2) + Math.pow(Math.abs(shipCy - asterCy), 2) <= Math.pow(asterRadius + 25, 2)) {
          gameOver = true;
          document.getElementById('gameover').style.visibility = 'visible';
          readyGame();
        }
      }
    }

    setTimeout(gameLoop, 2);
  }
}



//Array to hold id's of all asteroids in field
var currentAsteroids = [];
//Spawns an asteroid in the asteroid field.
function spawnAsteroid() {
  if(gameOver === false) {
    var field = document.getElementById("asteroidField");
    //Generate asteroid x-coordinate and random size
    var xCoord = Math.floor(Math.random() * 1000);
    var radius;
    var rand = Math.floor(Math.random() * 3);
    switch(rand) {
      case 0:
        radius = ASTEROID_SMALL;
        break;
      case 1:
        radius = ASTEROID_MED;
        break;
      case 2:
        radius = ASTEROID_LARGE;
        break;

    }
    //Add ID number to currentAsteroids
    var aID = Math.floor(Math.random() * 100 + 1);
    //If its ID is already in the array, find another one at random.
    while(currentAsteroids.indexOf(aID) >= 0) {
      aID = Math.floor(Math.random() * 100 + 1);
    }
    currentAsteroids.push(aID);

    //Draw asteroid into svg
    field.innerHTML += "<circle cx='" + xCoord + "' cy='-10' r='" + radius
    + "' stroke='white' stroke-width='5' id='a" + aID + "' />";
    setTimeout(spawnAsteroid, AST_SPAWN_INTERVAL);
  }
}

//Allows a single asteroid to move downward on the screen
function asteroidFall(aID) {
  var asteroid = document.getElementById(aID);
  var asteroidPos = parseInt(asteroid.getAttribute('cy'));
  asteroidPos += AST_TRAVEL_DISTANCE;
  asteroid.setAttribute('cy', String(asteroidPos));
}

//Removes a single asteroid from the game and from currentAsteroids
function destroyAsteroid(aID) {
  currentAsteroids.splice(currentAsteroids.indexOf(aID), 1);
  var child = document.getElementById('a' + aID);
  child.parentNode.removeChild(child);
}

//Prints top ten high scores into high scores table using AJAX
var gotScores;
function getScores() {
  var scoresIds = [];
  var xhttp = new XMLHttpRequest();
  var scoreTable = document.getElementById('scoretable');
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState === 4 && xhttp.status === 200) {
      scoresIds = xhttp.responseText.split('\n');
      scoreTable.innerHTML += '<tbody>';
      for(i = 0; i < scoresIds.length - 1; i++) {
        var entry = {};
        var currentPair = scoresIds[i].split(':');
        entry.score = currentPair[0];
        entry.uname = currentPair[1];
        scoreTable.innerHTML += '<tr><th>' + entry.uname + '</th><td style="text-align:center;">' + entry.score + '</td></tr>';
      }
      scoreTable.innerHTML += '</tbody>';
    }
  };
  xhttp.open('POST', 'highscores.txt', true);
  xhttp.send();
  document.getElementById('score').value = score;
  gotScores = true;
}

//Makes sure that the player does not tamper with the score field.
function submitScore(evt) {
  if(parseInt(document.getElementById('score').value) != score ||
  score.isNaN()) {
    alert('Do not even try.');
    return false;
  }
}
