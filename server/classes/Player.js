class Player extends Phaser.Physics.Arcade.Image {
    
    constructor(scene, x, y) 
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
    }
  
    update(time, delta) {}

    //VYSTRELENIE GUĽKY
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

    //AK TRAFÍM NEPRIATEĽA
    enemyHitByBullet(bullet, enemy) {
        enemy.life -= 10;
        bullet.disableBullet();
        io.in(this.roomNumber).emit('enemyHitByBullet', { socketOfShooter: this.socket, enemyLife: enemy.life } );
    }
    
    //POHYB HRÁČA DEPREDU/DOZADU
    moveStraight(){
        this.scene.physics.velocityFromRotation(this.rotation, 80, this.body.velocity);
    }

    moveBack(){
        this.scene.physics.velocityFromRotation(this.rotation, -80, this.body.velocity);
    }

    //ROTÁCIA HRÁČA DOĽAVA/DOPRAVA
    moveLeft(){
        this.setAngularVelocity(-80);
    }

    moveRight(){
        this.setAngularVelocity(80);
    }

    //ZASTAVENIE POHYBU HRÁČA
    stopMoving(){
        this.setAcceleration(0);
        this.setVelocity(0,0);
    }
    //ZASTAVENIE ROTÁCIE HRÁČA
    stopRotation(){
        this.setAngularVelocity(0);
    }
} 

