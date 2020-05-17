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
  
  //////////////////////////////////////////////////////////VYTVORENIE HRÁČA(MENU/WIN/LOSE)
  socket.on('createPlayer', function (data) {
    var nameAlreadyInUse = false;
    //KONTROLA ČI EXISTUJE HRÁČ SO ZADANÝM MENOM
    Object.keys(io.sockets.sockets).forEach(function (socketId) {
      socketName = io.sockets.connected[socketId].player;
      if(data.name == socketName){
        nameAlreadyInUse = true;
      }
    });

    if (nameAlreadyInUse) {
      socket.emit('nameAlreadyInUse');
    } else {
      socket.player = data.name;
      socket.win = 7;
      socket.lose = 0;
      socket.emit('startMenuScene');
    }
  });

  ///////////////////////////////////////////////////AK HRÁČ ZAČAL VYHĽADÁVAŤ HRU
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
          thisHelp.physics.player1 = new Player(thisHelp, waitingPlayers[socketId].x, waitingPlayers[socketId].y, socketId, numberOfRoom).setCollideWorldBounds(true);
          thisHelp.physics.player1.angle = waitingPlayers[socketId].angle;
          playingPlayers[socketId] = thisHelp.physics.player1;
          playingPlayers[socketId].socketId = socketId;
        } else {
          thisHelp.physics.player2 = new Player(thisHelp, waitingPlayers[socketId].x, waitingPlayers[socketId].y, socketId, numberOfRoom).setCollideWorldBounds(true);
          thisHelp.physics.player2.angle = waitingPlayers[socketId].angle;
          playingPlayers[socketId]=thisHelp.physics.player2;
          playingPlayers[socketId].socketId = socketId;
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

  //////////////////////////////////////////////////////////AK HRÁČ NA STRANE KLIENTA ZRUŠÍ VYHĽADÁVANIE HRY
  socket.on('endSearching', function () {
    console.log('-------------------------------------------------');
    console.log('USER(socket: '+ this.id +') ukončil vyhľadávanie hry č. '+ numberOfRoom);
    console.log('-------------------------------------------------');
    socket.leave(numberOfRoom);
    waitingPlayers = {};
  });

  //////////////////////////////////////////////////////////AK HRÁČ ODOSLAL INFORMÁCIU O POHYBE
  socket.on('playerInputDown', function (inputData) {
    //UROBIME POHYB NA SERVERY
      if (inputData['left']) playingPlayers[socket.id].moveLeft(); 
      if (inputData['right']) playingPlayers[socket.id].moveRight(); 
      if (inputData['up']) playingPlayers[socket.id].moveStraight(); 
      if (inputData['down']) playingPlayers[socket.id].moveBack(); 
      //ZASTAVÍME POHYB A ROTÁCIU HRÁČA NA SERVERY
      /*playingPlayers[socket.id].stopRotation();
      playingPlayers[socket.id].stopMoving();
      //ODOŠLEME ZASTAVENIE POHYBU/ROTÁCIE HRÁčA, KVOLI ZASTAVENIU ANIMÁCIE
      io.in(playerRoomNumber).emit('playerStopped', {socketId: socket.id});*/
  });

   //////////////////////////////////////////////////////////AK HRÁČ ODOSLAL INFORMÁCIU O POHYBE
   socket.on('playerInputUp', function (inputData) {
    if (inputData['up'] || inputData['down']){
      playingPlayers[socket.id].stopMoving();
      io.in(myRoom).emit('playerStopped', {socketId: socket.id});
    } 
    if(inputData['left'] || inputData['right']) {
      playingPlayers[socket.id].stopRotation();
      io.in(myRoom).emit('playerStopped', {socketId: socket.id});
    }
  });

  ////////////////////////////////////////////////////////////////AK HRÁČ NA SERVERY STLAČIL KLÁVESU PRE STREĽBU
  socket.on('playerShoot', function () {
    var playersSocket = io.sockets.adapter.rooms[myRoom].sockets;
    var enemy;

    Object.keys(playersSocket).forEach(function (socketId) {
      if (socketId != socket.id)
        enemy = playingPlayers[socketId];
    });
    //VYSTRELÍME STRELU NA SERVERY
    playingPlayers[socket.id].fire(myRoom, socket.id, enemy);
  });

  /////////////////////////////////////////////////////////////////AK HRÁČ ZOBERIE LIFECOIN NA STRANE KLIENTA
  socket.on('lifecoinTaken', function () {
    var playersSocket = io.sockets.adapter.rooms[myRoom].sockets;

    //PRIDÁME MU ŽIVOT(+10)
    Object.keys(playersSocket).forEach(function (socketId) {
      if (socketId == socket.id)
        playingPlayers[socket.id].life += 10;
    });
    //ODOŠLEME NA STRANU KLIENTA OBOM HRÁČOM AKTUALIZOVANÝ ŽIVOT DANÉHO HRÁČA
    io.in(myRoom).emit('playerLifeIncreased', {socketId: socket.id, playerLife: playingPlayers[socket.id].life});
  });

  ///////////////////////////////////////////////////////////////AK NASTAL KONIEC HRY(NIEKOHO ŽIVOT DOSIAHOL NULU)
  socket.on('destroyPlayer', function () {
    socket.leave(myRoom);
    delete playingPlayers[socket.id];
  });

  //////////////////////////////////////////////////////////ULOŽENIE SKÓRE
  socket.on('saveScore', function () {
    var string = fs.readFileSync('server/assets/all-scores.txt', 'utf8');
    var newArrayHighscores = [];
    var arrayScores = string.split('\n');

    if (arrayScores.length != 1) {
      //Kontrola(ak ich je plná tabuľka) či má väčšie skóre ako posledný v zozname
      var lastScoreRow = arrayScores[arrayScores.length-1].split('/');
      if ( arrayScores.length == 10 && ((lastScoreRow[1]-lastScoreRow[2]) >= (socket.win-socket.lose)) ) {
        socket.emit('smallScore', { lowestScore: lastScoreRow[1]-lastScoreRow[2] } );
      } else {
        var inTable = false;
        arrayScores.forEach(function(item) {
          if(!inTable) {
            row = item.split('/');
            if ( (socket.win-socket.lose) < (row[1]-row[2]) ) {
              newArrayHighscores.push(item);
            } else {
              newArrayHighscores.push(socket.player+'/'+socket.win+'/'+socket.lose);
              newArrayHighscores.push(item);
              inTable = true;
            }
          } else {
            newArrayHighscores.push(item);
          }
        });

        //Ak je 11 hráčov v tabuľke, vymažem posledné skóre
        if (newArrayHighscores.length == 11) {
          newArrayHighscores.pop();
        }

        //Vyčistí txt súbor
        fs.truncateSync('server/assets/all-scores.txt');
        
        //Uloží všetky highscore aj s novým do tabuľky
        newArrayHighscores.forEach(function(item, index) {
          if (index != (newArrayHighscores.length-1)) {
            item = item+'\n';
          }
          fs.writeFileSync('server/assets/all-scores.txt', item, {flag: 'a'});   
        });
        socket.emit('scoreSaved');
        socket.win = 0;
        socket.lose = 0;
      } 
    } else {
      //ULOŽENIE PRVÉHO HIGHSCORE
      fs.writeFile('server/assets/all-scores.txt', socket.player+'/'+socket.win+'/'+socket.lose+'\n', {flag: 'a'}, function (err) {
        if (err) return console.log(err);
      });
      socket.emit('scoreSaved');
      socket.win = 0;
      socket.lose = 0;
    }
  });

  //////////////////////////////////////////////////////////////ODOŠLE ZOZNAM HIGHSCORE HRÁČOV
  socket.on('getHighscoreData', function () {
    var string = fs.readFileSync('server/assets/all-scores.txt', 'utf8');
    socket.emit('startHighscoreScene', string);
  });

  //////////////////////////////////////////////////////////////AK SA HRÁČ ODPOJIL Z HRY, VYMAŽEME JEHO OBJEKT NA SERVERY
  socket.on('disconnect', function () {
    //OŠETRENIE AK: HRAL+ODPOJIL SA/VYHĽADÁVAL HRU+ODPOJIL SA
    if(typeof playingPlayers[socket.id] !== 'undefined') {
      Object.keys(io.sockets.adapter.rooms[myRoom].sockets).forEach(function (socketId) {
        enemyPlayerSocket = io.sockets.connected[socketId];
        enemyPlayerSocket.win++;
        enemyPlayerSocket.emit('gameEnd', { status: 'WIN' } );
      });
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

