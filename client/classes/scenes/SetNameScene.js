class SetNameScene extends Phaser.Scene {

    constructor() 
    {
        super('SetNameScene');
    } 

    preload() {
        this.load.image('menu-background', 'assets/menu-background.jpg');
    }

    create()
    {
        this.add.image(0, 0, 'menu-background').setOrigin(0, 0);

        //VYTVORENIE INPUT TEXTU PRE VLOŽENIE MENA
        this.add.text(140, 180, ' ENTER NAME:', { fontSize: '35px', fill: '#372009', backgroundColor: '#cc7a25',  fontStyle: 'bold' });
        var inputText = this.add.text(430, 180, '', { fontSize: '35px', fill: '#fff214', backgroundColor: 'black',  fontStyle: 'bold' });

        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8 && inputText.text.length > 0) {
                inputText.text = inputText.text.substr(0, inputText.text.length - 1);
            } else if ( inputText.text.length != 10 && (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90) || (event.keyCode >= 96 && event.keyCode < 106)) ) {
                inputText.text += event.key;
            } 
        });

        //TLAČIDLO ULOŽ MENO
        var buttonSaveName = this.add.text(230, 400, ' SAVE NAME ', { fontSize: '45px', fill: '#372009', backgroundColor: '#cc7a25', fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontStyle: 'bold' });
        buttonSaveName.setInteractive({ useHandCursor: true });
        buttonSaveName.on('pointerover', () => buttonSaveName.setColor('#fff214')  );
        buttonSaveName.on('pointerout', () => buttonSaveName.setColor('#372009')  );
        buttonSaveName.on('pointerdown', () => {
            if (inputText.text.trim() != '') {
                inputText.setText(inputText.text.trim());
                game.socket.emit('createPlayer', { name: inputText.text });
            } else {
                inputText.setText(inputText.text.trim());
            }
        });
        
        //ÚSPEŠNÉ ULOŽENIE MENA NA SERVERY
        var self = this;
        game.socket.on('startMenuScene', function () {
            game.player = inputText.text;
            game.win = 7;
            game.lose = 0;
            game.socket.removeListener('startMenuScene');
            self.scene.start('MenuScene');
        });

        //NEÚSPEŠNÉ ULOŽENIE MENA NA SERVERY
        var warningNameInUse = self.add.text(180, 250, ' THE NAME IS ALREADY IN USE. Try again. ', { fontSize: '18px', fill: '#ff0000', backgroundColor: 'white', fontStyle: 'bold' });
        warningNameInUse.setPadding(0,5);
        warningNameInUse.visible = false;
        
        game.socket.on('nameAlreadyInUse', function () {
            if (warningNameInUse.visible) {
                warningNameInUse.visible = false;
                self.time.delayedCall(350, function() { warningNameInUse.visible = true; });
            } else {
                warningNameInUse.visible = true;
            }
        });
    }
    
    update() {}
}

