class WaitingScene extends Phaser.Scene {

    constructor() 
    {
        super('WaitingScene');
    } 

    //DÁTA KTORÉ PRÍDU Z PREDCHÁDZAJÚCEJ SCÉNY
    init(data){
        this.socket = data.socket;
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
            self.socket.off('startGame');
            self.socket.emit('endSearching');
            self.scene.start('MenuScene');
        });
        buttonExit.on('pointerover', () => buttonExit.setTexture('menu-quit-hover')  );
        buttonExit.on('pointerout', () => buttonExit.setTexture('menu-quit')  );
        
        this.add.text(280, 200, 'VYHĽADÁVA SA PROTIHRÁČ...', { fontSize: '16px', fill: 'white' });
        
        //ODOSLANIE NA SERVER ŽE VYHĽADÁVAME HRU
        this.socket.emit('searchingForGame');
        //ČAKÁME KÝM PRÍDE ZO SERVERA, ŽE MOŽME ODŠTARTOVAŤ HRU
        this.socket.on('startGame', function (waitingPlayers) {
            self.scene.start('GameScene', {socket: this, players: waitingPlayers});
        });
    }

    update() {}
}