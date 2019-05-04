var Game = Game || {};

Game.Hanoi = function(game) {};

Game.Hanoi.prototype = 
{
    
    init: function(pieces, speed) {
        
        this._numberPiece = pieces;
        this._speedSolve = speed;
        
    },
    
    
    preload : function() {
        
        this.load.spritesheet('button', 'resources/game/button.png', 80, 20);
        this.load.bitmapFont('nokia', 'resources/fonts/nokia16black.png', 'resources/fonts/nokia16black.xml');

		this.load.spritesheet('tower', 'resources/game/tower.png', 100, 600);
		
        this.load.spritesheet('pieceGreen', 'resources/game/green.png', 60, 300);
		this.load.spritesheet('pieceYellow', 'resources/game/yellow.png', 60, 300);
		this.load.spritesheet('pieceViolet', 'resources/game/violet.png', 60, 300);
		this.load.spritesheet('pieceBlue', 'resources/game/blue.png', 60, 300);
		this.load.spritesheet('pieceRed', 'resources/game/red.png', 60, 300);
		this.load.spritesheet('pieceBrown', 'resources/game/brown.png', 60, 300);
        
        this.load.spritesheet('iconDrop', 'resources/game/iconupdown.png', 512, 339);

    },

    create: function() {
        
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        
        //Configurar física:
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 0;
		
		var box_size = document.getElementById('hanoi-example');
        box_size.style.width = this.game.width + 'px';
        box_size.style.height = this.game.height + 'px';
        
        //Crear botones
        
        var x = 148, y = 540;
        
        this._buttonSolve = this.add.button(x, y, 'button', this.clickSolve, this, 0, 1, 2);
        this._buttonSolve.name = 'Solve';
        this._buttonSolve.scale.set(2, 1.5);
        this._buttonSolve.smoothed = false;

        var text = game.add.bitmapText(x, y + 7, 'nokia', 'Solve', 16);
        text.x += (this._buttonSolve.width / 2) - (text.textWidth / 2);
        
        this._buttonRestart = this.add.button(x + 220, y, 'button', this.restartGame, this, 0, 1, 2);
        this._buttonRestart.name = 'Restart';
        this._buttonRestart.scale.set(2, 1.5);
        this._buttonRestart.smoothed = false;
        
        var text = game.add.bitmapText(x, y + 7, 'nokia', 'Restart', 16);
        text.x += ((this._buttonRestart.width / 2) + 220) - (text.textWidth / 2);
        
        this._buttonRestore = this.add.button(x + 440, y, 'button', this.restoreGame, this, 0, 1, 2);
        this._buttonRestore.name = 'Restore';
        this._buttonRestore.scale.set(2, 1.5);
        this._buttonRestore.smoothed = false;
        
        var text = game.add.bitmapText(x, y + 7, 'nokia', 'Restore', 16);
        text.x += ((this._buttonRestore.width / 2) + 440) - (text.textWidth / 2);
        
        //Crear controles de juego
        
        var style = {
            font : '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        };
        
        this._attemps = 0;
        
        this._stAttemps  = this.add.text(22, 22, 'MOVEMENTS: ' + this._attemps, style);
        this._stAttemps.fixedToCamera = true;
        
        this._stTime  = this.add.text(220, 22, 'TIME: ' + this._attemps, style);
        this._stTime.fixedToCamera = true;
        
        this._stopWatch = new Stopwatch(this._stTime);
        
        var pieceNumber = this.add.text(550, 22, 'PIECES: ' + this._numberPiece, style);
        pieceNumber.fixedToCamera = true;
        
        var dropUp = this.add.image(pieceNumber.x + 125, 26, 'iconDrop');
        dropUp.inputEnabled = true;
        dropUp.events.onInputDown.add(function() 
                                        { 
                                            if ((this._numberPiece + 1) <= settings.MaxPieces)
                                            {
                                                this._numberPiece++;
                                            }
            
                                            this.state.start('Game', true, false, this._numberPiece, this._speedSolve);
            
                                        }, this);
        dropUp.scale.set(0.07, 0.07);
        
        var dropDown = this.add.image(pieceNumber.x + 125, 35, 'iconDrop');
        dropDown.inputEnabled = true;
        dropDown.events.onInputDown.add(function() 
                                        { 
                                            if ((this._numberPiece - 1) >= settings.MinPieces)
                                            {
                                                this._numberPiece--;
                                            }
            
                                            this.state.start('Game', true, false, this._numberPiece, this._speedSolve);
            
                                        }, this);
        dropDown.scale.set(0.07, 0.07);
        dropDown.angle = 180;
        
        var speedSolve = this.add.text(720, 22, 'SPEED: ' + this._speedSolve, style);
        speedSolve.fixedToCamera = true;
        
        dropUp = this.add.image(speedSolve.x + 140, 26, 'iconDrop');
        dropUp.inputEnabled = true;
        dropUp.events.onInputDown.add(function() 
                                        { 
                                            if ((this._speedSolve + settings.IntervalIncrementSpeedSolve) < settings.MaxSpeedSolve) 
                                            {
                                                this._speedSolve+=settings.IntervalIncrementSpeedSolve;
                                            }
            
                                            this.state.start('Game', true, false, this._numberPiece, this._speedSolve);
            
                                        }, this);
        dropUp.scale.set(0.07, 0.07);
        
        dropDown = this.add.image(speedSolve.x + 140, 35, 'iconDrop');
        dropDown.inputEnabled = true;
        dropDown.events.onInputDown.add(function() 
                                        { 
                                            if ((this._speedSolve - settings.IntervalIncrementSpeedSolve) > 1)
                                            {
                                                this._speedSolve-=settings.IntervalIncrementSpeedSolve;
                                            }
            
                                            this.state.start('Game', true, false, this._numberPiece, this._speedSolve);
            
                                        }, this);
        dropDown.scale.set(0.07, 0.07);
        dropDown.angle = 180;
        
        //Crear elementos de juego
		
		//this._numberPiece = 6;
        this.game.stage.backgroundColor = "#4488AA";
        
        this._towers = this.game.add.group();
        this._pieces = this.game.add.group();
        this._solve = [];
		
		for (var i = 0, x = 93; i < 3; i++, x+=320) 
		{
			var tower = this.game.add.sprite(x, 120, 'tower');
			tower.smoothed = false
            this.game.physics.arcade.enable(tower);
            tower.scale.set(0.6, 0.6);
            tower.body.collideWorldBounds = true;
            tower.allowGravity = false;
            tower.body.setSize(20, tower.body.height - 30, 35, 15);
            tower._standar = [];
            // Reconocer que la primera torre tiene las 4 piezas [3, 2, 1, 0]
            tower._pieces = (i == 0) ? Array.from(Array(this._numberPiece).keys()).reverse() : [];
			
			this._towers.add(tower);
		}
        
        //Mapear posiciones
        
		var standar = [];
        var colors = ['pieceGreen', 'pieceYellow', 'pieceViolet', 'pieceBlue', 'pieceRed', 'pieceBrown'];
        
        /*
            pieza 3 ->    --
            pieza 2 ->   ----
            pieza 1 ->  ------
            pieza 0 -> --------
        */
        
        /*
              |        |        |
            tower 0  tower 1  tower 2
        */
        
		for (var i = 0, scaleX = 0.9, positionY = 430, positionX = -10; i < this._numberPiece; i++, scaleX-=0.1, positionY-=33, positionX+=15) 
		{
			var singlePiece;
            
            if (i >= colors.length) 
            {
                singlePiece = this.game.add.sprite(positionX, positionY, colors[Math.floor(Math.random() * colors.length)]);
                singlePiece.tint = Math.random() * 0xffffff;
            }
            else
            {
                singlePiece = this.game.add.sprite(positionX, positionY, colors[i]);
            }
            
			singlePiece.smoothed = false
            this.game.physics.arcade.enable(singlePiece);
			singlePiece.scale.set(scaleX, 0.6);
			singlePiece.inputEnabled = true;
			singlePiece.input.enableDrag(true);
            singlePiece.events.onDragStart.add(this.onDragStart, this);
            singlePiece.events.onDragStop.add(this.onDragStop, this);
			singlePiece.body.collideWorldBounds = true;
            singlePiece.allowGravity = false;
            singlePiece._oldPosition = {x: singlePiece.x, y: singlePiece.y};
            singlePiece._typePiece = i;
            singlePiece._typeTower = 0;
            singlePiece.body.setSize(singlePiece.body.width - 200, singlePiece.body.height, 91, 1);
            
            standar.push({x: singlePiece.x, y: singlePiece.y});
            
			this._pieces.add(singlePiece);
		}
        
        this._towers.forEach(function(item) {
            
            item._standar = JSON.parse(JSON.stringify(standar));
            
            for(var j = 0; j < standar.length; j++) {
                standar[j].x = standar[j].x + 320;
            }
            
        });
        
        this.recursionHanoi(0, 0, 2, 1);
        
        console.log(this._solve);

    },

    update: function() {

    },
    
    render: function() {
        
      //this.game.debug.body(this._pieces.getAt(0));
      //this.game.debug.body(this._pieces.getAt(1));
      //this.game.debug.body(this._pieces.getAt(2));
      //this.game.debug.body(this._pieces.getAt(3));
        
      //this.game.debug.body(this._towers.getAt(0));
        
    },
    
    onDragStart: function(sprite, pointer) {
        
        this._stopWatch.start();
        
        this._buttonSolve.inputEnabled = false;
        
    },
    
    onDragStop: function(sprite, pointer) {
        
        this.validateHanoi(sprite);
        
    },
    
    validateHanoi: function(p) {
      
        if (this.physics.arcade.overlap(p, this._towers, function(piece, tower) {
            
           //console.log(this._towers.getIndex(tower));
            
           if (tower._pieces.length <= 0) {

                this._towers.getAt(piece._typeTower)._pieces.shift(); // Eliminar primera pieza de la torre antigua
                tower._pieces.splice(0, 0, piece._typePiece); // Poner la pieza en la nueva torre
                piece._typeTower = this._towers.getIndex(tower); // Guarda la torre en que se puso la pieza

                // Ubicar pieza en la torre (visualmente)
                piece.x = tower._standar[piece._typePiece].x;
                piece.y = tower._standar[0].y;

                piece._oldPosition = {x: piece.x, y: piece.y}; // Guardar posición actual

                this._attemps++;

                this._stAttemps.setText('MOVEMENTS: ' + this._attemps);

           }else {

               if (tower._pieces[0] < piece._typePiece) {

                    this._towers.getAt(piece._typeTower)._pieces.shift(); // Eliminar primera pieza de la torre antigua
                    tower._pieces.splice(0, 0, piece._typePiece); // Poner la pieza en la nueva torre
                    piece._typeTower = this._towers.getIndex(tower); // Guarda la torre en que se puso la pieza

                    // Ubicar pieza en la torre (visualmente)
                    piece.x = tower._standar[piece._typePiece].x;
                    piece.y = tower._standar[tower._pieces.length - 1].y;

                    piece._oldPosition = {x: piece.x, y: piece.y}; // Guardar posición actual

                    this._attemps++;

                    this._stAttemps.setText('MOVEMENTS: ' + this._attemps);

               } else {

                   //Movimiento incorrecto

                   piece.x = piece._oldPosition.x;
                   piece.y = piece._oldPosition.y;

               }

           }

           // Win?

           if (this.winUser(this._towers.getAt(2)._pieces)) {

                this._stopWatch.stop();

                console.log('Finished!');

                this._buttonRestart.inputEnabled = true;
                this._buttonRestore.inputEnabled = true;

                var style = {
                    font : '15px BitBold',
                    fill: 'white',
                    stroke: 'black',
                    strokeThickness: 2.5
                };

                var stWin  = this.add.text(400, 50, 'WIN!', style);
                stWin.fontSize = '33px';
                stWin.addColor("#ff0000", 0);
                stWin.fixedToCamera = true;
                stWin.alpha = 0;

               this.add.tween(stWin).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 500, true);

               this._pieces.setAll('inputEnabled', false);
           }
            
           //console.log(this._towers.getAt(0)._pieces)
           //console.log(this._towers.getAt(1)._pieces)
           //console.log(this._towers.getAt(2)._pieces)
                
        }, null, this)) {
            
            
            
        } else
        {
            //Volver a la posición anterior en caso de no poner la ficha en una torre
            
            p.x = p._oldPosition.x;
            p.y = p._oldPosition.y;
        }
        
    },
    
    recursionHanoi: function(n, origin, destination, auxiliary) {
        
        if (n == (this._numberPiece - 1)) {
            
           console.log("Move disk " + n + " from tower " + origin + " to tower " + destination);
           this._solve.push({ piece: n, origin: origin, destination: destination});
            
        } else {
            
            this.recursionHanoi(n + 1, origin, auxiliary, destination);
            
            console.log("Move disk " + n + " from tower " + origin + " to tower " + destination);
            this._solve.push({ piece: n, origin: origin, destination: destination});
            
            this.recursionHanoi(n + 1, auxiliary, destination, origin);
        }
        
    },
    
    winUser: function(pieces) {
            
        if (pieces.length < this._numberPiece) return false;

        for(var i = 0, j = (pieces.length - 1); i < pieces.length; i++, j--){

            if (pieces[i] != j) return false;

        }
        
        return true;
    },
    
    clickSolve: function(button) {
        
        this._buttonRestart.inputEnabled = false;
        this._buttonSolve.inputEnabled = false;
        this._buttonRestore.inputEnabled = false;
        
        this._stopWatch.start();
        
        console.log('Solving!');
        
        var timerSolve = this.time.create(false);
        timerSolve.name = 'TimerSolve';
        this._modeSolve = true;
        
        var instructions = this.getInstructions();
        
        timerSolve.loop(this._speedSolve, function() {
            
            var o = instructions.next();
            
            if (o.value) {
            
                var piece = this._pieces.getAt(o.value.piece),
                    tower = this._towers.getAt(o.value.destination);
                
                this._attemps += 1;
                
                this._stAttemps.setText('MOVEMENTS: ' + this._attemps);

                if (tower._pieces.length <= 0) {

                   this._towers.getAt(piece._typeTower)._pieces.shift(); // Eliminar primera pieza de la torre antigua
                   tower._pieces.splice(0, 0, piece._typePiece); // Poner la pieza en la nueva torre
                   piece._typeTower = this._towers.getIndex(tower); // Guarda la torre en que se puso la pieza

                   // Ubicar pieza en la torre (visualmente)
                   //piece.x = tower._standar[piece._typePiece].x;
                   //piece.y = tower._standar[0].y;
                    
                   this.add.tween(piece).to( { x: tower._standar[piece._typePiece].x, y: tower._standar[0].y }, 100, "Quart.easeOut", true);

                   piece._oldPosition = {x: piece.x, y: piece.y}; // Guardar posición actual

               }else {

                   if (tower._pieces[0] < piece._typePiece) {

                      this._towers.getAt(piece._typeTower)._pieces.shift(); // Eliminar primera pieza de la torre antigua
                      tower._pieces.splice(0, 0, piece._typePiece); // Poner la pieza en la nueva torre
                      piece._typeTower = this._towers.getIndex(tower); // Guarda la torre en que se puso la pieza

                      // Ubicar pieza en la torre (visualmente)
                      //piece.x = tower._standar[piece._typePiece].x;
                      //piece.y = tower._standar[tower._pieces.length - 1].y;
                       
                       this.add.tween(piece).to( { x: tower._standar[piece._typePiece].x, y: tower._standar[tower._pieces.length - 1].y }, 100, "Quart.easeOut", true);

                      piece._oldPosition = {x: piece.x, y: piece.y}; // Guardar posición actual

                   } else {

                       piece.x = piece._oldPosition.x;
                       piece.y = piece._oldPosition.y;

                   }
               }
                
            } else {
                
                this._stopWatch.stop();
                
                console.log('Finished!');
                
                this._buttonRestart.inputEnabled = true;
                this._buttonRestore.inputEnabled = true;
                
                var style = {
                    font : '15px BitBold',
                    fill: 'white',
                    stroke: 'black',
                    strokeThickness: 2.5
                };
                
                var stWin  = this.add.text(400, 50, 'WIN!', style);
                stWin.fontSize = '33px';
                stWin.addColor("#ff0000", 0);
                stWin.fixedToCamera = true;
                stWin.alpha = 0;

                this.add.tween(stWin).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 500, true);
                
                timerSolve.stop(false);
                
                this._pieces.setAll('inputEnabled', false);
                
            }
            
            //this.validateHanoi(this._pieces.getAt(o.value.piece));
            
        }, this);

        timerSolve.start();
        
    },
    
    getInstructions: function*() {
        
        for(var i = 0; i < this._solve.length; i++) {

            var piece = this._solve[i].piece,
                origin = this._solve[i].origin,
                destination = this._solve[i].destination;
            
            yield { piece: piece, origin: origin, destination: destination};
        }
        
    },
    
    restartGame: function() {
        
        this.state.start('Game', true, false, this._numberPiece, this._speedSolve);
        
    },
    
    restoreGame: function() {
        
        this.state.start('Game', true, false, settings.MinPieces, settings.InitialSpeedSolve);
        
    }
}

// Configuration!

var settings = 
    { 
        MinPieces: 3,
        MaxPieces: 8, 
        InitialSpeedSolve: 50, 
        MaxSpeedSolve: 10000, 
        IntervalIncrementSpeedSolve: 50 
    };

var game = new Phaser.Game(900, 600, Phaser.AUTO, 'hanoi-example');

game.state.add('Game', Game.Hanoi);

game.state.start('Game', true, false, settings.MinPieces, settings.InitialSpeedSolve);