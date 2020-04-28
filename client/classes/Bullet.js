class Bullet extends Phaser.Physics.Arcade.Image { 

    constructor(scene) 
    {
        super(scene, -20, -20, 'bullet');
        this.visible = false;
    }

    update(time, delta) {}
    
    //VYMAZANIE GUĽKY
    disableBullet() {
        this.destroy(); 
    }
}