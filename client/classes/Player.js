class Player extends Phaser.Physics.Arcade.Sprite {
    
    constructor(scene, x, y) 
    {
        super(scene, x, y, 'tank'); 
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        
        this.life = 100;
    }
  
    update(time, delta) {}
    
    //PRIDANIE NA HRACIU PLOCHU VÝPIS ŽIVOTA
    addLifeText(x, y, who){
        var colorOfText;
        if (who == 'YOUR') 
            colorOfText = '#10e63e';
        else
            colorOfText = '#e30707';
        
        this.scoreText = this.scene.add.text(x, y, who+' LIFE: ' + this.life, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold', color: colorOfText }); 
    }
} 

