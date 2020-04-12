window.onload
{
  //Find Canvas
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const tileing = 32;

  //Load sprites
  let playerSpr = new Image();
  let wallSpr = new Image();
  let coinSpr = new Image();
  let questionSpr = new Image();
  let anotherSpr = new Image();
  let checkSpr = new Image();
  playerSpr.src = "../img/player.png";
  wallSpr.src = "../img/wall.png";
  coinSpr.src = "../img/coin.png";
  questionSpr.src = "../img/question.png";
  anotherSpr.src = "../img/anotherplayer.png";
  checkSpr.src = "../img/check.png";

  //Load sounds
  let stepSound = new Audio("../audio/step.wav");
  let coinSound = new Audio("../audio/coin.wav");

  //Players
  class Player {
    constructor(id, posX, posY) {
      this.id = id;
      this.posX = posX;
      this.posY = posY;
    }
  }
  var players = [];
  var currentPlayer = new Player(0, 0, 0);
  function playerSet(data)
  {
    console.log(data.id);
    currentPlayer.id = data.id;
    calculateShift();
  }
  //Сheck KeyDown
  document.addEventListener('keydown', function(event) {
    switch(event.code){
      case 'KeyW':
      tryToMakeStep(currentPlayer.posY-1,currentPlayer.posX);
      break;
      case 'KeyS':
      tryToMakeStep(currentPlayer.posY+1,currentPlayer.posX);
      break;
      case 'KeyA':
      tryToMakeStep(currentPlayer.posY,currentPlayer.posX-1);
      break;
      case 'KeyD':
      tryToMakeStep(currentPlayer.posY,currentPlayer.posX+1);
      break;
    }
  });

  function tryToMakeStep(y, x)
  {
    console.log(x + " " + y);
    checkExtras(y, x);
    if(level.levelArray[y][x] != 1)
    {
      currentPlayer.posX = x;
      currentPlayer.posY = y;
      refresh();
      draw();
    }
  }

  function checkExtras(y, x)
  {
    switch(level.levelArray[y][x]){
        case 3:
        extras({id: currentPlayer.id, eType: 3, x: x, y: y});
        break;
        case 4:
        coinSound.play();
        extras({id: currentPlayer.id, eType: 4, x: x, y: y});
        break;
        case 5:
        extras({id: currentPlayer.id, eType: 5, x: x, y: y});
        break;
        default:
        stepSound.play();
    }
  }
  //Get Current Player
  function spawn()
  {
    return currentPlayer;
  }
  //Set new Player
  function instance(data)
  {
    players.push(new Player(data.id, data.posX, data.posY));
    draw();
    console.log("instance: " + players[players.length-1].id);
  }
  //Refresh player's pos with id
  function refreshPlayerPos(data)
  {
    for(var i = 0; i < players.length; i++)
    if(players[i].id == data.id)
    {
      players[i].posX = data.posX;
      players[i].posY = data.posY;
      console.log("redraw: " + players[i]);
    }
    draw();
  }
  //Delete disconnected player
  function remove(data)
  {
    for(var i = 0; i < players.length;i++)
    {
      if(players[i].id == data.id)
      {
        players.splice(i);
        draw();
      }
    }
  }
  //Add connected earlier users
  function getState(data)
  {
    console.log(data.length);
    for(var i = 0; i < data.length; i++)
    {
      players.push(new Player(data[i].id, data[i].posX, data[i].posY));
    }
    draw();
  }

  //Level
  let level = {
    levelHeight: 6,
    levelWidth: 11,
    shiftX: 0,
    shiftY: 0,
    levelArray: [
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 5, 0, 1],
      [1, 0, 0, 0, 1, 3, 4, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    ]
  };
  function calculateShift()
  {
    for(let h = 0; h < level.levelHeight; h++)
    {
      for(let w = 0; w < level.levelWidth; w++)
      {
        if(level.levelArray[h][w] == 2)
        {
          currentPlayer.posX = w;
          currentPlayer.posY = h;
          level.shiftX = h - 3;
          level.shiftY = w - 2;
          break;
        }
      }
    }
    draw();
  }
  function draw()
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let h = 0; h < level.levelHeight; h++)
    {
      for(let w = 0; w < level.levelWidth; w++)
      {
        if(level.levelArray[h][w] == 1) drawSprite(wallSpr, w, h);
        if(level.levelArray[h][w] == 3) drawSprite(questionSpr, w, h);
        if(level.levelArray[h][w] == 4) drawSprite(coinSpr, w, h);
        if(level.levelArray[h][w] == 5) drawSprite(checkSpr, w, h);
      }
    }
    for(var i = 0; i < players.length; i++)
    {
      drawSprite(anotherSpr, players[i].posX, players[i].posY);
    }
    drawPlayer();
  }

  function drawSprite(sprite, x, y)
  {
    ctx.drawImage(sprite, canvas.width/2 - (-x + level.shiftX + currentPlayer.posX) * tileing,canvas.height/2 - (-y + level.shiftY + currentPlayer.posY)*tileing, tileing, tileing);
  }

  function drawPlayer()
  {
    ctx.drawImage(playerSpr, canvas.width/2, canvas.height/2, tileing, tileing);
  }
}
