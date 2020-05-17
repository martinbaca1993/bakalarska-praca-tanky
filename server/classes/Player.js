class Player extends Phaser.Physics.Arcade.Image {
    
    constructor(scene, x, y, socketId, roomNumber) 
    {
        super(scene, x, y, 'tank');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;

        //VYTVORENIE ZÁSOBNÍKA SO STRELOU
        this.zasobnik = scene.physics.add.group({
            classType: Bullet,
            maxSize: 1, 
            runChildUpdate: true
        });

        //POTLAČENIE OBJEKTU SPOSOBÍ LEN MALÉ POSUNUTIE DRUHÉHO(ODRAZENIE)
        this.setDrag(500);
        this.setAngularDrag(500);

        this.life = 100;
        this.speed = 80;
        
        this.wasMoving = false;
        this.movementStraight = false;
        this.movementBack = false;
        this.movementLeft = false;
        this.movementRight = false;

        this.socketID = socketId;
        this.numberOfRoom = roomNumber;
    }

    preUpdate(){
        if( (this.movementLeft || this.movementRight) || this.body.angularVelocity != 0 ){
            this.doRotation();
            this.wasMoving = true;
        } else {
            this.wasMoving = false;
        }
        if( (this.movementStraight || this.movementBack) || (this.body.acceleration.x != 0 || this.body.acceleration.y != 0 || this.body.velocity.x != 0 || this.body.velocity.y != 0) ) {
            this.doMovement();
            this.wasMoving = true;
        } 

        if (this.wasMoving) {
            this.sendPosition();
            //console.log(game.loop.actualFps);
        }
    }

    ////////VYSTRELENIE GUĽKY
    fire(roomNumber, socket, enemy) {
        //Nastavenie socketu a číslo miestnosti pre ďalšie použitie
        this.socket = socket;
        this.roomNumber = roomNumber;
        var bullet = this.zasobnik.get();
        if (bullet) {
            bullet.fire(this, this.rotation-300);
            this.scene.physics.add.overlap(bullet, enemy, this.enemyHitByBullet, null, bullet); //DO enemyHitByBullet idu rovno ako parametre prve 2 objekty  
        }
    }

    ////////AK TRAFÍM NEPRIATEĽA
    enemyHitByBullet(bullet, enemy) {
        enemy.life -= 10;
        bullet.disableBullet();
        if (enemy.life == 0) {
            var mySocket;
            var enemySocket;
            var playersSocket = io.sockets.adapter.rooms[enemy.numberOfRoom].sockets;
            Object.keys(playersSocket).forEach(function (socketId) {
                if (enemy.socketID == socketId) {
                    enemySocket = io.sockets.connected[socketId];
                } else {
                    mySocket = io.sockets.connected[socketId];
                }
            });
            mySocket.win++;
            enemySocket.lose++;
            mySocket.emit('gameEnd', { status: 'WIN' } );
            enemySocket.emit('gameEnd', { status: 'LOSE' } );
        } else {
            io.in(this.roomNumber).emit('enemyHitByBullet', { socketOfShooter: this.socket, enemyLife: enemy.life } );
        }
    }
    
    ////////POHYB HRÁČA DEPREDU/DOZADU
    moveStraight() {
        this.movementStraight = true;
    }
    moveBack(){
        this.movementBack = true;
    }
    ///////ZASTAVENIE POHYBU HRÁČA
    stopMoving() {
        this.movementStraight = false;
        this.movementBack = false;
    }
    doMovement(){
        if(this.movementStraight) {
            this.scene.physics.velocityFromRotation(this.rotation, this.speed, this.body.velocity);
        } else if(this.movementBack) {
            this.scene.physics.velocityFromRotation(this.rotation, -this.speed, this.body.velocity);
        } else {
            this.setAcceleration(0);
            this.setVelocity(0,0); 
        }
    }

    /////////ROTÁCIA HRÁČA DOĽAVA/DOPRAVA
    moveLeft(){
        this.movementLeft = true;
    }
    moveRight(){
        this.movementRight = true;
    }
    /////////ZASTAVENIE ROTÁCIE HRÁČA
    stopRotation(){
        this.movementLeft = false;
        this.movementRight = false;
    }
    doRotation(){
        if(this.movementLeft) {
            this.setAngularVelocity(-80);
        } else if(this.movementRight) {
            this.setAngularVelocity(80);
        } else {
            this.setAngularVelocity(0);
        }
    }

    sendPosition(){
        var self = this;
        var playersSocket = io.sockets.adapter.rooms[this.numberOfRoom].sockets;
        Object.keys(playersSocket).forEach(function (socketId) {
            if (socketId == self.socketId) {
                io.in(self.numberOfRoom).emit('playerMoved', { 
                    x: self.x, 
                    y: self.y, 
                    rotation: self.rotation, 
                    inputKeyboard: {up: self.movementStraight, down: self.movementBack, left: self.movementLeft, right: self.movementRight}, 
                    socketId: self.socketId}); 
            } else {
                io.in(self.numberOfRoom).emit('playerMoved', {
                    x: self.x, 
                    y: self.y, 
                    rotation: self.rotation, 
                    inputKeyboard: {up: false, down: false, left: false, right: false}, 
                    socketId: self.socketId});
            }
        });
    }
} 

