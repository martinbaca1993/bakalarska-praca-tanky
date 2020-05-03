var thisHelp;
var waitingPlayers = {};
var playingPlayers = {};
var numberOfRoom = 1;

//NASTAVENIE KONFIGURÁCIE PRE VYTVORENIE HRY Phaser.Game V HEADLESS MÓDE NA SERVERY
const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false
};


function preload() {
  this.load.spritesheet('tank', 'assets/sprite-tank.png', { frameWidth: 32, frameHeight: 32 });
  this.load.image('wall-small', 'assets/wall-small.png');
  this.load.spritesheet('lifecoin', 'assets/sprite-lifecoin.png', { frameWidth: 16, frameHeight: 16 });
  this.load.image('wall', 'assets/wall.png');
  this.load.image('bullet', 'assets/bullet.png');
}

function create() {
  thisHelp = this;

  //VYTVORENIE PREKÁŽOK
  this.physics.platforms = this.physics.add.staticGroup();
  this.physics.platforms.create(350, 300, 'wall');
  this.physics.platforms.create(450, 300, 'wall');
  this.physics.platforms.create(150, 200, 'wall-small');
  this.physics.platforms.create(150, 400, 'wall-small');
  this.physics.platforms.create(250, 100, 'wall-small');
  this.physics.platforms.create(250, 500, 'wall-small');
  this.physics.platforms.create(400, 150, 'wall-small');
  this.physics.platforms.create(400, 450, 'wall-small');
  this.physics.platforms.create(550, 100, 'wall-small');
  this.physics.platforms.create(550, 500, 'wall-small');
  this.physics.platforms.create(650, 200, 'wall-small');
  this.physics.platforms.create(650, 400, 'wall-small');
  
  //VYTVORENIE LIFECOINOV
  this.physics.lifecoins = this.physics.add.staticGroup();
  this.physics.lifecoins.create(250, 200, 'lifecoin');
  this.physics.lifecoins.create(250, 400, 'lifecoin');
  this.physics.lifecoins.create(550, 200, 'lifecoin');
  this.physics.lifecoins.create(550, 400, 'lifecoin');   
  this.physics.lifecoins.create(100, 100, 'lifecoin');  
  this.physics.lifecoins.create(100, 500, 'lifecoin');  
  this.physics.lifecoins.create(700, 100, 'lifecoin');  
  this.physics.lifecoins.create(700, 500, 'lifecoin');

  //AK SA NIEKTO PRIPOJÍ NA SERVER
  io.on('connection', onConnect);
}


function update() {}

//FUNKCIA, KTORÁ SA ZAVOLÁ PO PRIPOJENÍ HRÁČA NA SERVER
function onConnect(socket) {
  var myRoom;
  console.log('-------------------------------------------------');
  console.log('USER(socket: ' + socket.id + ') connected.');
  console.log('POCET HRACOV ONLINE: ' + io.engine.clientsCount);

  //AK HRÁČ ZAČAL VYHĽADÁVAŤ HRU
  socket.on('searchingForGame', function () {
    console.log('-------------------------------------------------');
    console.log('USER(socket: ' + socket.id + ') vyhľadáva hru č.'+ numberOfRoom);

    //VSTUP SOCKETU HRÁČA DO MIESTNOSTI - V KAŽDEJ MIESTNOSTI BUDÚ DVAJA HRÁČI
    myRoom = numberOfRoom;
    socket.join(numberOfRoom);

    if (Object.keys(waitingPlayers).length == 0) {
      waitingPlayers[socket.id] = { x: 90, y: 300, angle: 0 };
    } else {
      waitingPlayers[socket.id] = { x: 650, y: 300, angle: 180 };
      
      //VYTVORENIE HRÁČOV NA STRANE SERVERA
      var readyPlayersSockets = io.sockets.adapter.rooms[numberOfRoom].sockets;
      Object.keys(readyPlayersSockets).forEach(function (socketId) {
        if (socket.id == socketId) {
          thisHelp.physics.player1 = new Player(thisHelp, waitingPlayers[socketId].x, waitingPlayers[socketId].y).setCollideWorldBounds(true);
          thisHelp.physics.player1.angle = waitingPlayers[socketId].angle;
          playingPlayers[socketId] = thisHelp.physics.player1;
        } else {
          thisHelp.physics.player2 = new Player(thisHelp, waitingPlayers[socketId].x, waitingPlayers[socketId].y).setCollideWorldBounds(true);
          thisHelp.physics.player2.angle = waitingPlayers[socketId].angle;
          playingPlayers[socketId]=thisHelp.physics.player2;
        }
      });
            
      //NASTAVENIA KOLÍZIE HRÁČ-HRÁČ A HRÁČ-PREKÁŽKA
      thisHelp.physics.add.collider(thisHelp.physics.player1, thisHelp.physics.player2);
      thisHelp.physics.add.collider(thisHelp.physics.player1, thisHelp.physics.platforms);
      thisHelp.physics.add.collider(thisHelp.physics.player2, thisHelp.physics.platforms);

      // POSLE VŠETKÝM V ROOME AKCIU(ŠTART) + POLE(waitingPlayers)
      io.in(numberOfRoom).emit('startGame', waitingPlayers);
      console.log('-------------------------------------------------');
      console.log('Začala sa hrať hra č.'+ numberOfRoom);
      console.log('-------------------------------------------------');

      waitingPlayers = {};
      numberOfRoom++;
    }
  });

  //AK HRÁČ NA STRANE KLIENTA ZRUŠÍ VYHĽADÁVANIE HRY
  socket.on('endSearching', function () {
    console.log('-------------------------------------------------');
    console.log('USER(socket: '+ this.id +') ukončil vyhľadávanie hry č. '+ numberOfRoom);
    console.log('-------------------------------------------------');
    socket.leave(numberOfRoom);
    waitingPlayers = {};
  });

  /* AK HRÁČ ODOSLAL INFORMÁCIU O POHYBE */
  socket.on('playerInput', function (inputData) {
    var playerRoomNumber = Object.keys(socket.rooms);
    playerRoomNumber = playerRoomNumber[0];

    //UROBIME POHYB NA SERVERY
    if (inputData['up'] || inputData['down'] || inputData['left'] || inputData['right']) {
      if (inputData['left']) {
        playingPlayers[socket.id].moveLeft();
      } else if (inputData['right']) {
        playingPlayers[socket.id].moveRight();
      } else {
        playingPlayers[socket.id].stopRotation();
      }
  
      if (inputData['up']) {
        playingPlayers[socket.id].moveStraight();
      } else if (inputData['down']) {
        playingPlayers[socket.id].moveBack();
      } else {
        playingPlayers[socket.id].stopMoving();
      }

      //ODOŠLEME VYKONANÝ POHYB KLIENTOM(HRÁČOM) V DANEJ HRE NA STRANU KLIENTA
      var playersSocket = io.sockets.adapter.rooms[playerRoomNumber].sockets;
      Object.keys(playersSocket).forEach(function (socketId) {
        if (socketId == socket.id) {
          io.in(playerRoomNumber).emit('playerMoved', { 
            x: playingPlayers[socketId].x, 
            y: playingPlayers[socketId].y, 
            rotation: playingPlayers[socketId].rotation, 
            inputKeyboard: {up: inputData['up'], down: inputData['down'], left: inputData['left'], right: inputData['right']}, 
            socketId: socketId}); 
        } else {
          io.in(playerRoomNumber).emit('playerMoved', {
            x: playingPlayers[socketId].x, 
            y: playingPlayers[socketId].y, 
            rotation: playingPlayers[socketId].rotation, 
            inputKeyboard: {up: false, down: false, left: false, right: false}, 
            socketId: socketId});
        }
      });
    } else {
      //ZASTAVÍME POHYB A ROTÁCIU HRÁČA NA SERVERY
      playingPlayers[socket.id].stopRotation();
      playingPlayers[socket.id].stopMoving();

      //ODOŠLEME ZASTAVENIE POHYBU/ROTÁCIE HRÁčA, KVOLI ZASTAVENIU ANIMÁCIE
      io.in(playerRoomNumber).emit('playerStopped', {socketId: socket.id});
    }
  });

  //AK HRÁČ NA SERVERY STLAČIL KLÁVESU PRE STREĽBU
  socket.on('playerShoot', function () {
    var playerRoomNumber = Object.keys(socket.rooms);
    playerRoomNumber = playerRoomNumber[0];
    var playersSocket = io.sockets.adapter.rooms[playerRoomNumber].sockets;
    var enemy;

    Object.keys(playersSocket).forEach(function (socketId) {
      if (socketId != socket.id)
        enemy = playingPlayers[socketId];
    });
    //VYSTRELÍME STRELU NA SERVERY
    playingPlayers[socket.id].fire(playerRoomNumber, socket.id, enemy);
  });

  //AK HRÁČ ZOBERIE LIFECOIN NA STRANE KLIENTA
  socket.on('lifecoinTaken', function () {
    var playerRoomNumber = Object.keys(socket.rooms);
    playerRoomNumber = playerRoomNumber[0];
    var playersSocket = io.sockets.adapter.rooms[playerRoomNumber].sockets;

    //PRIDÁME MU ŽIVOT(+10)
    Object.keys(playersSocket).forEach(function (socketId) {
      if (socketId == socket.id)
        playingPlayers[socket.id].life += 10;
    });
    //ODOŠLEME NA STRANU KLIENTA OBOM HRÁČOM AKTUALIZOVANÝ ŽIVOT DANÉHO HRÁČA
    io.in(playerRoomNumber).emit('playerLifeIncreased', {socketId: socket.id, playerLife: playingPlayers[socket.id].life});
  });

  //AK NASTAL KONIEC HRY(NIEKOHO ŽIVOT DOSIAHOL NULU)
  socket.on('gameOver', function () {
    var playerRoomNumber = Object.keys(socket.rooms);
    playerRoomNumber = playerRoomNumber[0];
    
    socket.leave(playerRoomNumber);
    delete playingPlayers[socket.id];
  });

  //AK SA HRÁČ ODPOJIL Z HRY, VYMAŽEME JEHO OBJEKT NA SERVERY
  socket.on('disconnect', function () {
    //OŠETRENIE AK: HRAL+ODPOJIL SA/VYHĽADÁVAL HRU A ODPOJIL SA
    if(typeof playingPlayers[socket.id] !== 'undefined') {
      Object.keys(io.sockets.adapter.rooms[myRoom].sockets).forEach(function (socketId) {
        playersSocket = socketId;
      });
      io.in(myRoom).emit('enemyHitByBullet', { socketOfShooter: playersSocket, enemyLife: 0 });
      delete playingPlayers[socket.id];
    } else if (typeof waitingPlayers !== 'undefined'){
      waitingPlayers = {};
    }

    io.emit('disconnect', socket.id);
    
    console.log('-------------------------------------------------');
    console.log('User ' + socket.id + ' disconnected.');
    console.log('POCET HRACOV ONLINE: ' + io.engine.clientsCount);

    
  });
}

const game = new Phaser.Game(config);
window.gameLoaded();

