class GameOverScene extends Phaser.Scene {

    constructor() 
    {
        super('GameOverScene');
    } 

    //DÁTA(status- WIN/LOSE) KTORÉ PRÍDU Z PREDCHÁDZAJÚCEJ SCÉNY
    init(data){
        this.gameStatus = data.gameStatus;
    }

    preload() {
        this.load.audio('win-music', ['audio/win-sound.mp3','audio/win-sound.ogg']);  //Game.ogg kvoli tomu, lebo na firefoxe nejde mp3
        this.load.audio('lose-music', ['audio/lose-sound.mp3','audio/lose-sound.ogg']);  //Game.ogg kvoli tomu, lebo na firefoxe nejde mp3
        this.load.image('winner-background', 'assets/winner-background.jpg');
        this.load.image('loser-background', 'assets/loser-background.jpg');
        this.load.image('menu', 'assets/menu.png');
        this.load.image('menu-hover', 'assets/menu-hover.png');
    }

    create() 
    {
        var buttonMenu;
        //TU SA ZOBRAZÍ V SCÉNE MENU + KONKRÉTNE TLAČIDLO, PLOCHA, VYPÍSANÝ TEXT A HUDBA NA ZÁKLADE TOHO, ČI SME VYHRALI ALEBO PREHRALI
        if (this.gameStatus == 'WIN') {
            this.add.image(0, 0, 'winner-background').setOrigin(0, 0); 
            buttonMenu= this.add.sprite(380, 350, 'menu');
            this.winMusic = this.sound.add('win-music'); 
            this.winMusic.play();  
            this.add.text(230, 70, 'YOU WIN!', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: '60px', fill: 'black', fontStyle: 'bold' }).setShadow(-1, 1, 'rgba(255,255,255,0.8)', 0);
            this.add.text(120, 170, 'YOUR SCORE(WINS-LOSES): '+ game.win +'-'+ game.lose, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: '30px', fill: 'black', fontStyle: 'bold' }).setShadow(-1, 1, 'rgba(255,255,255,0.8)', 0);
        } else {
            this.add.image(0, 0, 'loser-background').setOrigin(0, 0); 
            buttonMenu= this.add.sprite(400, 530, 'menu');
            this.loseMusic = this.sound.add('lose-music'); 
            this.loseMusic.play();
            this.add.text(230, 100, 'YOU LOSE!', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: '60px', fill: 'black', fontStyle: 'bold' }).setShadow(-1, 1, 'rgba(255,255,255,0.8)', 0);
            this.add.text(120, 420, 'YOUR SCORE(WINS-LOSES): '+ game.win +'-'+ game.lose, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: '30px', fill: 'black', fontStyle: 'bold' }).setShadow(-2, 2, 'rgba(255,255,255,0.8)', 0);
        }

        buttonMenu.setInteractive({ useHandCursor: true });
        buttonMenu.on('pointerdown', () => this.scene.start('MenuScene') );
        buttonMenu.on('pointerover', () => buttonMenu.setTexture('menu-hover') );
        buttonMenu.on('pointerout', () => buttonMenu.setTexture('menu') );
    }

    update() {}
}