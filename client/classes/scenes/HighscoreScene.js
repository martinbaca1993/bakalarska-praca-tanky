class HighscoreScene extends Phaser.Scene {

    constructor() 
    {
        super('HighscoreScene');
    } 

    //DÁTA(status- WIN/LOSE) KTORÉ PRÍDU Z PREDCHÁDZAJÚCEJ SCÉNY
    init(data){
        this.highscores = data;
    }

    preload() {
    }

    create()
    {
        var self = this;
        var highscores = this.highscores.split('\n');
        var y = 100;
        var n = 1;
        //VÝPIS HIGHSCORE TABUĽKY
        highscores.forEach(function(item) {
              var row = item.split('/');
              self.add.text(30, y, n+')', { fontSize: '35px', fill: '#cc7a25', fontStyle: 'bold' });
              self.add.text(120, y, row[0], { fontSize: '35px', fill: 'white', fontStyle: 'bold' });
              self.add.text(390, y, row[1]+'/'+row[2], { fontSize: '35px', fill: 'white', fontStyle: 'bold' });
              self.add.text(670, y, row[1]-row[2], { fontSize: '35px', fill: 'white', fontStyle: 'bold' });
              n++;
              y += 40;
        });
        
        this.add.text(120, 40, 'NAME', { fontSize: '40px', fill: '#cc7a25', fontStyle: 'bold' });
        this.add.text(340, 40, 'WIN/LOSE', { fontSize: '40px', fill: '#cc7a25', fontStyle: 'bold' });
        this.add.text(630, 40, 'SCORE', { fontSize: '40px', fill: '#cc7a25', fontStyle: 'bold' });

        //TLAČIDLO BACK SKÓRE
        var buttonBack = this.add.text(360, 520, ' BACK ', { fontSize: '35px', fill: '#372009', backgroundColor: '#cc7a25', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontStyle: 'bold' });
        buttonBack.setInteractive({ useHandCursor: true });
        buttonBack.on('pointerdown', () => self.scene.start('MenuScene') );
        buttonBack.on('pointerover', () => buttonBack.setColor('#fff214') );
        buttonBack.on('pointerout', () => buttonBack.setColor('#372009') );
    }
    
    update() {}
}

