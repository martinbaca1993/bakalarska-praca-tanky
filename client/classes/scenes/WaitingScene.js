class WaitingScene extends Phaser.Scene {

    constructor() 
    {
        super('WaitingScene');
    } 

    preload() {
        this.load.image('menu-quit', 'assets/quit.png');
        this.load.image('menu-quit-hover', 'assets/quit-hover.png');
    }

    create() 
    {
        var self = this;
        
        //VYTVORENIE TLAČIDLA EXIT DO SCÉNY
        var buttonExit = this.add.sprite(380, 300, 'menu-quit');
        buttonExit.setInteractive({ useHandCursor: true });
        buttonExit.on('pointerdown', function() {  
            game.socket.removeListener('startGame');
            game.socket.emit('endSearching');
            self.scene.start('MenuScene');
        });
        buttonExit.on('pointerover', () => buttonExit.setTexture('menu-quit-hover')  );
        buttonExit.on('pointerout', () => buttonExit.setTexture('menu-quit')  );
        
        this.add.text(280, 200, 'SEARCHING FOR PLAYER...', { fontSize: '16px', fill: 'white' });
        
        //ODOSLANIE NA SERVER ŽE VYHĽADÁVAME HRU
        game.socket.emit('searchingForGame');
        //ČAKÁME KÝM PRÍDE ZO SERVERA, ŽE MOŽME ODŠTARTOVAŤ HRU
        game.socket.on('startGame', function (waitingPlayers) {
            game.socket.removeListener('startGame');
            self.scene.start('GameScene', { players: waitingPlayers });
        });
    }

    update() {}
}