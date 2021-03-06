class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    //DÁTA(HRÁČI) KTORÉ PRÍDU Z PREDCHÁDZAJÚCEJ SCÉNY
    init(data) {
        this.players = data.players;
    }

    preload() {
        //Načítanie obrázkov 
        this.load.spritesheet('tank', 'assets/sprite-tank.png', { frameWidth: 32, frameHeight: 32}); 
        this.load.spritesheet('lifecoin', 'assets/sprite-lifecoin.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('wall', 'assets/wall.png');
        this.load.image('wall-small', 'assets/wall-small.png');
        this.load.image('bullet', 'assets/bullet.png');

        //Načítanie hudby - OGG pre Mozzilu Firefox
        this.load.audio('game-music', ['audio/game.mp3', 'audio/game.ogg']);  
        this.load.audio('shot-music', ['audio/shot.mp3', 'audio/shot.ogg']);
    }
    
    create() {
        this.playerMovementMemory = { left: false, right: false, up: false, down: false };
        this.sound.add('shot-music');
        this.gameMusic = this.sound.add('game-music');
        this.gameMusic.play();
        
        //ZÁSOBNÍK Z KTORÉHO BUDEME VYBERAŤ A ZOBRAZOVAŤ STRELY
        this.zasobnik = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        
        //VŠETKY ANIMÁCIE POTREBNÉ V HRE
        this.anims.create({
            key: 'sprite-lifecoin-animation',
            frames: this.anims.generateFrameNumbers('lifecoin', { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'sprite-player-tank-movement',
            frames: this.anims.generateFrameNumbers('tank', { frames: [0,1,2,3,4,5,6,7] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'sprite-enemy-tank-movement',
            frames: this.anims.generateFrameNumbers('tank', { frames: [8,9,10,11,12,13,14,15] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'sprite-explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 19 }),
            frameRate: 20,
            repeat: 0
        });
        
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

        //VYTVORNEIE LIFECOINOV A SPUSTENIE ANIMÁCIE
        this.physics.lifecoins = this.physics.add.staticGroup();
        this.physics.lifecoins.create(250, 200, 'lifecoin');
        this.physics.lifecoins.create(250, 400, 'lifecoin');
        this.physics.lifecoins.create(550, 200, 'lifecoin');
        this.physics.lifecoins.create(550, 400, 'lifecoin');   
        this.physics.lifecoins.create(100, 100, 'lifecoin');  
        this.physics.lifecoins.create(100, 500, 'lifecoin');  
        this.physics.lifecoins.create(700, 100, 'lifecoin');  
        this.physics.lifecoins.create(700, 500, 'lifecoin');         
        this.physics.lifecoins.playAnimation('sprite-lifecoin-animation', 0);
        

        this.wasMoving = false;
        var thisHelp = this;
        //VYTVORENIE HRÁČOV V HRE
        Object.keys(thisHelp.players).forEach(function (id) {
            if (game.socket.id == id) {
                thisHelp.physics.player = new Player(thisHelp, thisHelp.players[id].x, thisHelp.players[id].y);
                thisHelp.physics.player.angle = thisHelp.players[id].angle;
                if (thisHelp.players[id].x < 400) 
                    thisHelp.physics.player.addLifeText(50, 20, 'YOUR');
                else 
                    thisHelp.physics.player.addLifeText(620, 20, 'YOUR');
            } else {
                thisHelp.physics.enemy = new Player(thisHelp, thisHelp.players[id].x, thisHelp.players[id].y);
                thisHelp.physics.enemy.angle = thisHelp.players[id].angle;
                if (thisHelp.players[id].x < 400)
                    thisHelp.physics.enemy.addLifeText(50, 20, 'ENEMY');
                else
                    thisHelp.physics.enemy.addLifeText(620, 20, 'ENEMY');
            }
        });
        
        //NASTAVENIE PREKRYTIA HRÁČOV A LIFECOINOV - ZAVOLÁ SA disablePlayerLifecoin()
        this.physics.add.overlap(this.physics.player, this.physics.lifecoins, this.disablePlayerLifecoin, null, this);
        this.physics.add.overlap(this.physics.enemy, this.physics.lifecoins, this.disableEnemyLifecoin, null, this);

        //ODŠTARTOVANIE ANIMÁCIE A NÁSLEDNÉ POZASTAVENIE PRE HRÁČA/NEPRIATEĽA
        this.physics.player.play('sprite-player-tank-movement');
        this.physics.player.anims.pause();
        this.physics.enemy.play('sprite-enemy-tank-movement');
        this.physics.enemy.anims.pause();


        //PRIDANIE OVLÁDANIA PRE HRÁČA(UP, DOWN, LEFT, RIGHT, SPACE)
        this.playerControl = this.input.keyboard.createCursorKeys();
        //KONTROLA POHYBU(STLAČENIA KLÁVES) A ODOSLANIE NA SERVER
        this.playerControl.left.on('down', function(event) { game.socket.emit('playerInputDown', { left: true }); });
        this.playerControl.right.on('down', function(event) { game.socket.emit('playerInputDown', { right: true }); });
        this.playerControl.up.on('down', function(event) { game.socket.emit('playerInputDown', { up: true }); });
        this.playerControl.down.on('down', function(event) { game.socket.emit('playerInputDown', { down: true }); });
        //KONTROLA POHYBU(PUSTENIE KLÁVES) A ODOSLANIE NA SERVER
        this.playerControl.left.on('up', function(event) { game.socket.emit('playerInputUp', { left: true }); });
        this.playerControl.right.on('up', function(event) { game.socket.emit('playerInputUp', { right: true }); });
        this.playerControl.up.on('up', function(event) { game.socket.emit('playerInputUp', { up: true }); });
        this.playerControl.down.on('up', function(event) { game.socket.emit('playerInputUp', { down: true }); });
        //KONTROLA STRELY(STLAČENIA KLÁVESY) A ODOSLANIE NA SERVER
        this.playerControl.space.on('down', function(event) { 
            game.socket.emit('playerShoot');  
            thisHelp.sound.play('shot-music');
         });

        //AK SA HRÁČ/NEPRIATEĽ POHOL ALEBO ZASTAVIL
        game.socket.on('playerMoved', function (playerData) {
            var player;
            if (playerData.socketId == this.id) {
                player = thisHelp.physics.player;
            } else {
                player = thisHelp.physics.enemy;
            }

            player.x = playerData.x;
            player.y = playerData.y;
            player.rotation = playerData.rotation;

            //OTOČENIE ANIMÁCIE
            if (playerData.inputKeyboard.up || playerData.inputKeyboard.down || playerData.inputKeyboard.left || playerData.inputKeyboard.right) {
                if ((playerData.inputKeyboard.up && !thisHelp.physics.player.anims.forward) || (playerData.inputKeyboard.down && thisHelp.physics.player.anims.forward)) {
                    player.anims.reverse();
                }
                player.anims.resume();
            }
        });


        //AK SA PRESTAL POHYBOVAŤ HRÁČ/NEPRIATEĽ, ZASTAVÍM ANIMÁCIU
        game.socket.on('playerStopped', function (playerData) {
            if (playerData.socketId == this.id) {
                thisHelp.physics.player.anims.pause();
            } else {
                thisHelp.physics.enemy.anims.pause();
            }
        });

        
        //ZOBRAZENIE VYSTRELENEJ STRELY HRÁČA/NEPRIATEĽA
        var bulletPlayer;
        var bulletEnemy;
        game.socket.on('showBullet', function (bulletToShow) {
            if (bulletToShow.socketId == this.id) {
                if (!bulletPlayer) {
                    bulletPlayer = thisHelp.zasobnik.get();
                }
                bulletPlayer.x = bulletToShow.x;
                bulletPlayer.y = bulletToShow.y;
            } else {
                if (!bulletEnemy) {
                    bulletEnemy = thisHelp.zasobnik.get();
                }
                bulletEnemy.x = bulletToShow.x;
                bulletEnemy.y = bulletToShow.y;
            }
        });

        //ZNIČENIE STRELY HRÁČA/NEPRIATEĽA A VYKRESLENIE ANIMÁCIE(EXPLÓZIA) NA POZÍCIE STRELY
        game.socket.on('destroyBullet', function (bulletOwner) {
            if (bulletOwner.socketId == this.id) {
                thisHelp.explosion = thisHelp.physics.add.sprite(bulletPlayer.x, bulletPlayer.y, 'explosion');
                thisHelp.explosion.anims.play('sprite-explosion', false);
                bulletPlayer.disableBullet();
                bulletPlayer = thisHelp.zasobnik.get();
            } else {
                thisHelp.explosion = thisHelp.physics.add.sprite(bulletEnemy.x, bulletEnemy.y, 'explosion');
                thisHelp.explosion.anims.play('sprite-explosion', false);
                bulletEnemy.disableBullet();
                bulletEnemy = thisHelp.zasobnik.get();
            }
        });
        
        //AK BOL HRÁČ ZASIAHNUTÝ STRELOU, ZMENÍME TEXT VÝPISU ŽIVOTA A AKTUALIZUJEME HO
        game.socket.on('enemyHitByBullet', function (shootingInfo) {
            if (shootingInfo.socketOfShooter == this.id) {
                thisHelp.physics.enemy.scoreText.setText('ENEMY LIFE: '+shootingInfo.enemyLife);
                thisHelp.physics.enemy.life = shootingInfo.enemyLife;
            } else {
                thisHelp.physics.player.scoreText.setText('YOUR LIFE: '+shootingInfo.enemyLife);
                thisHelp.physics.player.life = shootingInfo.enemyLife;
            }
        });

        //AK HRÁČ ZOBRAL LIFECOIN, ZMENÍME TEXT VÝPISU ŽIVOTA A AKTUALIZUJEME HO 
        game.socket.on('playerLifeIncreased', function (playerInfo) {
            if (playerInfo.socketId == this.id) {
                thisHelp.physics.player.scoreText.setText('YOUR LIFE: '+playerInfo.playerLife);
                thisHelp.physics.player.life = playerInfo.playerLife;
            } else {
                thisHelp.physics.enemy.scoreText.setText('ENEMY LIFE: '+playerInfo.playerLife);
                thisHelp.physics.enemy.life = playerInfo.playerLife;
            }
        });
        
        //AK HRÁČ ZOBRAL LIFECOIN, ZMENÍME TEXT VÝPISU ŽIVOTA A AKTUALIZUJEME HO 
        game.socket.on('gameEnd', function (endData) {
            if (endData.status == 'WIN')
                game.win++;
            else 
                game.lose++;
                
            thisHelp.gameMusic.stop();
            this.emit('destroyPlayer');
            game.socket.removeAllListeners();
            thisHelp.scene.start('GameOverScene',{ gameStatus: endData.status });
        });
    }

    
    update() {}

    //VYMAZANIE LIFECOINU PO ZOBRATÍ PLAYEROM/NEPRIATEĽOM A ODOSLANIE NA SERVER, LEN V PRIPADE PLAYERA
    disablePlayerLifecoin(player, lifecoin){
        this.physics.lifecoins.killAndHide(lifecoin);
        lifecoin.body.enable = false;
        game.socket.emit('lifecoinTaken');
    }
    disableEnemyLifecoin(player, lifecoin){
        this.physics.lifecoins.killAndHide(lifecoin);
        lifecoin.body.enable = false;
    }
}
