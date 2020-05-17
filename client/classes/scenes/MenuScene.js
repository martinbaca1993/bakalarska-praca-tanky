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
        var self = this;
        this.add.image(0, 0, 'menu-background').setOrigin(0, 0);
        
        //PRIDANIE TLAČIDLA PLAY DO SCÉNY A JEHO NASTAVENIE
        var buttonPlay = this.add.sprite(400, 200, 'menu-play');
        buttonPlay.setInteractive({ useHandCursor: true });
        buttonPlay.on('pointerdown', function() {
            game.socket.removeAllListeners();
            self.scene.start('WaitingScene');
        });
        buttonPlay.on('pointerover', () => buttonPlay.setTexture('menu-play-hover')  );
        buttonPlay.on('pointerout', () => buttonPlay.setTexture('menu-play')  );

        //VÝPIS SKÓRE A MENA
        var scoreText = this.add.text(130, 420, 'SCORE(WINS/LOSES): '+(game.win-game.lose)+'('+game.win +'/'+game.lose+')', { fontSize: '35px', fill: 'white', fontStyle: 'bold' });
        this.add.text(130, 450, 'NAME: '+game.player, { fontSize: '35px', fill: 'white', fontStyle: 'bold' });

        //TLAČIDLO ULOŽ SKÓRE
        var buttonSaveScore = this.add.text(140, 490, ' Save Score ', { fontSize: '30px', fill: '#372009', backgroundColor: '#cc7a25', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontStyle: 'bold' });
        buttonSaveScore.setInteractive({ useHandCursor: true });
        buttonSaveScore.on('pointerdown', () => game.socket.emit('saveScore'));
        buttonSaveScore.on('pointerover', () => buttonSaveScore.setColor('#fff214') );
        buttonSaveScore.on('pointerout', () => buttonSaveScore.setColor('#372009') );

        //TLAČIDLO UKÁŽ HIGHSCORE TABUĽKU
        var buttonShowHighscore = this.add.text(370, 490, ' Highscore Table ', { fontSize: '30px', fill: '#372009', backgroundColor: '#cc7a25', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontStyle: 'bold' });
        buttonShowHighscore.setInteractive({ useHandCursor: true });
        buttonShowHighscore.on('pointerdown', () => game.socket.emit('getHighscoreData'));
        buttonShowHighscore.on('pointerover', () => buttonShowHighscore.setColor('#fff214') );
        buttonShowHighscore.on('pointerout', () => buttonShowHighscore.setColor('#372009') );

        //NEÚSPEŠNÉ ULOŽENIE SKÓRE NA SERVERY(Príliš malé)
        var warningLowScore = this.add.text(140, 540, '', { fontSize: '20px', fill: 'red', backgroundColor: 'white', fontStyle: 'bold' });
        warningLowScore.visible = false;
        game.socket.on('smallScore', function (data) {
            if(succesfullSavedScore.visible)
                    succesfullSavedScore.visible = false;
            if (warningLowScore.visible) {
                warningLowScore.visible = false;
                self.time.delayedCall(200, function() { warningLowScore.visible = true; });
            } else {
                warningLowScore.setText(' LOW SCORE! You have to earn more than '+data.lowestScore+'.');
                warningLowScore.visible = true;
            }
        });

        //ÚSPEŠNÉ ULOŽENIE SKÓRE NA SERVERY
        var succesfullSavedScore = this.add.text(270, 540, 'Úspešné uloženie skóre.', { fontSize: '20px', fill: 'red', backgroundColor: 'white', fontStyle: 'bold' });
        succesfullSavedScore.visible = false;
        game.socket.on('scoreSaved', function (data) {
            game.win = 0;
            game.lose = 0;
            
            scoreText.visible = false;
            scoreText.setText('SCORE(WINS/LOSES): '+(game.win-game.lose)+'('+game.win +'/'+game.lose+')');
            self.time.delayedCall(200, function() { scoreText.visible = true; });
            
            if(warningLowScore.visible)
                warningLowScore.visible = false;

            if (succesfullSavedScore.visible) {
                succesfullSavedScore.visible = false;
                self.time.delayedCall(200, function() { succesfullSavedScore.visible = true; });
            } else {
                succesfullSavedScore.visible = true;
            }
        });

        game.socket.on('startHighscoreScene', function (data) {
            game.socket.removeAllListeners();
            self.scene.start('HighscoreScene', data);
        });
    }
    
    update() {}
}

