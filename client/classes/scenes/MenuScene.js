class MenuScene extends Phaser.Scene {

    constructor() 
    {
        super('MenuScene');
    } 

    preload() {
        this.load.image('menu-background', 'assets/menu-background.jpg');
        this.load.image('menu-play', 'assets/play.png');
        this.load.image('menu-play-hover', 'assets/play-hover.png');
    }

    create()
    {
        this.add.image(0, 0, 'menu-background').setOrigin(0, 0);
        
        //PRIDANIE TLAČIDLA PLAY DO SCÉNY A JEHO NASTAVENIE
        var buttonPlay = this.add.sprite(380, 200, 'menu-play');
        buttonPlay.setInteractive({ useHandCursor: true });
        buttonPlay.on('pointerdown', () => this.scene.start('WaitingScene', { socket: game.socket}));
        buttonPlay.on('pointerover', () => buttonPlay.setTexture('menu-play-hover')  );
        buttonPlay.on('pointerout', () => buttonPlay.setTexture('menu-play')  );
    }
    
    update() {}
    
}

