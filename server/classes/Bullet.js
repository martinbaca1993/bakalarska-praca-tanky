class Bullet extends Phaser.Physics.Arcade.Image { 

    constructor(scene) 
    {
        super(scene,0,0,'bullet'); 
        //Prelínanie strely
        this.setBlendMode(1);  
        this.scene = scene;
        //Nastavenie rýchlosti strely
        this.speed = Phaser.Math.GetSpeed(300, 1);   
        this.velocity = new Phaser.Geom.Point();
    } 

    //VYKONÁVANIE VÝPOČTU POZÍCIE STRELY A ODOSIELANIE NA SERVER
    update(time, delta)
    { 
        io.in(this.roomNumber).emit('showBullet', { socketId: this.socket, x: this.x, y: this.y } );
        this.x += this.velocity.x * delta;
        this.y += this.velocity.y * delta;

        if (this.y < -30 || this.y > 830 || this.x < -30 || this.x > 830) {
            this.disableBullet();
        }
    }

    //VYSTRELENIE STRELY
    fire(player, direction) 
    {    
        this.scene.physics.add.overlap(this, this.scene.physics.platforms, this.disableBullet, null, this); 
        this.setPosition(player.x, player.y);
        //Nastavenie rýchlosti a smeru vystrelenia guľkys
        this.velocity.setTo(0, -this.speed);
        Phaser.Math.Rotate(this.velocity, direction);
        this.roomNumber = player.roomNumber;
        this.socket = player.socket;
    }

    disableBullet(){
        io.in(this.roomNumber).emit('destroyBullet', { socketId: this.socket } );
        this.destroy(); 
    }

}

