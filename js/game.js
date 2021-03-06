// Heavily based on http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var NB_X_BLOC = 20;
var NB_Y_BLOC = 15;

var BLOC_SIZE = 32;
var PLAYER_SIZE = 8;

var SPEED_X =  2; // movement in pixels per second
var MAX_SPEED_X =  1;
var BOUNCE_SPEED_Y =  1;
var REBOUND_MODIFIER = -0.8;
var G = 2;

var MAX_TRAIL_QUEUE = 15;
var TIME_BETWEEN_TRAIL = 15; // 50ms between 2 additions of blocks

var DOG_SIZE = 120;

var MAX_COLLISION_INTERVAL = 0.005;

var BLOCK = {
	NONE : 0,
	WALL : 1,
	DESTROYABLE : 2, 
	EXPLODE : 3,
	ROCKET : 4, 			// There might be 2 kinds of rockets 
	PLAYER_START : 5 			// There might be 2 kinds of rockets 
};

//Create a sound 
// /!\ Does not work in firefox
// dog : http://crackberry.com//ringtone/duck-hunt-dog-laugh-annoying-dog
// explosion : http://www.freesound.org/people/inferno/sounds/18384/
// bounce : http://soundbible.com/1626-Ball-Bounce.html

// var dog_laugh = g_DataCache.getSound("duck-hunt-dog-laugh-ringtone");
// dog_laugh.loop = false;
// var sound_explosion = g_DataCache.getSound("18384__inferno__largex");
// var sound_bounce = g_DataCache.getSound("Ball_Bounce-Popup_Pixels-172648817");

g_DataCache = new DataCache();

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

var level = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,4,3,2,2,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// See https://www.youtube.com/watch?v=NQaCpD5w8vQ for other levels
var level0 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o   s                                  ",
	"o                                      ",
	"o o o o o o o o o o o o o o o o   o o o"
];

var level1 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o   s                                 o",
	"o *                                   o",
	"o o o o o o x x   x x x   x x x x x x o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                               o     o",
	"o                               o     o",
	"o                               o      ",
	"o                               o      ",
	"o                               o o o o"
];

var level2 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o     o                               o",
	"o     o                                ",
	"o     o                                ",
	"o     o                   o o o o o o o",
	"o s   o                 o o o o o o o o",
	"o       o o           o o o o o o o o o",
	"o o o o o o     o o o o o o o o o o o o"
];

var level3 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o s                 o                  ",
	"o                 o o o *              ",
	"o o o o o * * o o o o o o o o o * o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o"
];

var level4 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o                                      ",
	"o                                      ",
	"o                           o o o o o o",
	"o   s                     o o o o o o o",
	"o         o o           o o o o o o o o",
	"o o o o o o o     o o o o o o o o o o o"
];

var level5 = [
	"o o o o o o o o o o o o o o o o o o o o",
	"o                                     o",
	"o                                     o",
	"o                                     o",
	"o   s                                 o",
	"o             x       x               o",
	"o o o o o x x   x x x   x             o",
	"o                                     o",
	"o                                     o",
	"o       * * * * * * * *   x           o",
	"o                         x           o",
	"o                         x           o",
	"o                         x           o",
	"o                         >            ",
	"o                                     o"
];

var levels = [
	level0,
	level1,
	level2,
	level3,
	level4,
  level5
]

// level = level1;


g_DataCache.imageQueue = [
	"bloc1",
	"bloc2",
	"bloc3",
	"bloc4",
	"dog",
	"arrow"
];

g_DataCache.soundQueue = [
	"duck-hunt-dog-laugh-ringtone",
	"18384__inferno__largex",
	"Ball_Bounce-Popup_Pixels-172648817"
];

var dogSprite = new SpriteSheet(1, 2, 200, "dog");
dogSprite.SetState (0);
dogSprite.SetAnimated(true);
dogSprite.Animate();

///////////////////////////////////////////////////////////////////////////////
// Menu state
///////////////////////////////////////////////////////////////////////////////
MenuState = function() {}

MenuState.prototype = {
	activeItem : 0,
	menuItems : [
		"Play",
		"Options",
		"Credit",
	]
}

MenuState.prototype.Update = function (modifier) {
	// The event handling is done in the keypress event
};
	
MenuState.prototype.Draw = function(){
	// Background
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#d0e7f9");
	
	// Display the Title
	g_Screen.drawText ("Recoil", 32,32, "rgb(0, 250, 250)", "26px Helvetica");
	g_Screen.drawText ("Cache : " + g_DataCache.imageQueue.length, 32,64, "rgb(0, 250, 250)", "26px Helvetica");
	
	// Display the menu
	for (i = 0; i < this.menuItems.length; i++)
	{
		var str = this.menuItems[i];
		var col = "red";
		
		if (this.activeItem == i){
			col = "green";
			str = "[ " + this.menuItems[i] + " ]";
		}
		g_Screen.drawCenterText (str, GAME_WIDTH/2, GAME_HEIGHT/2 + 50 * (i), col, "30pt Calibri");
	}
}

MenuState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		if (this.activeItem == 0){
			gameEngine.ChangeState("game");
			gameEngine.effects.push ( new FadeEffect ({color:"rgb(255, 255, 255)", duration:0.3, fadeType:FadeEffect.FADE_OUT}) );
		}
		else if (this.activeItem == 2)
		{
			gameEngine.ChangeState("credit");
			creditState.Init();
			gameEngine.effects.push ( new FadeEffect ({color:"rgb(255, 255, 255)", duration:0.3, fadeType:FadeEffect.FADE_OUT}) );
		}
	}
	if (event.keyCode == KB_UP) { // Player holding up
		// bullet_sound.play();
		this.activeItem = (this.activeItem-1);
		if (this.activeItem < 0)
			this.activeItem = this.menuItems.length-1;
	}
	if (event.keyCode == KB_DOWN) { // Player holding down
		// bullet_sound.play();
		this.activeItem = (this.activeItem + 1) % (this.menuItems.length);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Game state
///////////////////////////////////////////////////////////////////////////////
CreditState = function(){
	this.timer = new Timer();
}

CreditState.prototype = {
	pos : GAME_HEIGHT - 100,
	active:false
}

CreditState.prototype.Init = function (){
	this.active = true;
	this.timer.Start();
}

CreditState.prototype.Update = function (dt) {
	if (KB_ESCAPE in gameEngine.keysDown) {
		gameEngine.ChangeState("menu");
		this.active = false;
	}
}

CreditState.prototype.Draw = function () {
	// g_Screen.drawCenterText ("Yay !", GAME_WIDTH/2, this.pos - this.timer.Elapsed()*0.001*20, "rgb(0, 250, 250)", "24px Helvetica");
	// g_Screen.drawText ("" + this.timer.ChronoString(), 100, 100, "rgb(0, 250, 250)", "24px Helvetica");
}

///////////////////////////////////////////////////////////////////////////////
// Editor state
///////////////////////////////////////////////////////////////////////////////

EditorState = function(){
	this.viewport = new Viewport(gameEngine);
}


EditorState.prototype = {
	currElem : 0
}

EditorState.prototype.Draw = function (modifier) {
	// gameEngine.states['game'].DrawLevel(level);
	//Displays a potential future block if necessary
	if (this.currElem != 0){
		cell = getCell(gameEngine.mouseCursor);
		drawBlock(cell.x*BLOC_SIZE, cell.y*BLOC_SIZE, this.currElem);
	}
}

EditorState.prototype.KeyPress = function(event){
	var c = event.keyCode;

	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		// gameEngine.states['game'].Init();
		gameEngine.ChangeState("game");

		// console.log (JSON.stringify (level));
	}
	// Buttons 0 ... 4 of the keyboard
	if (c >= 48 && c <= 52){
		this.currElem = event.keyCode - 48; 
	}
}

EditorState.prototype.MouseClick = function(event){
	// Add the block to the level if necessary	
	cell = getCell(gameEngine.mouseCursor);
	// console.log(gameEngine.mouseCursor);

	// level[cell.y][cell.x] = this.currElem;
}


///////////////////////////////////////////////////////////////////////////////
// Game object
///////////////////////////////////////////////////////////////////////////////
GameInfo = function(){
	this.levelTimer = new Timer ();
}

var defaultReplay = {
		totalDuration : 0,
		keyFrames : []
	};

GameInfo.prototype = {
	currLevelIndex : 0,
	currDeath : 0,
	totalDeath : 0,
	levelTimer : {},
	currReplay : defaultReplay.clone(),
	replays : [],
	replayers : []
}

g_gameInfo = new GameInfo();

///////////////////////////////////////////////////////////////////////////////
// Death state
///////////////////////////////////////////////////////////////////////////////

DeathState = function(){
	this.dog = new DogEffect ({duration :1.5});
}

DeathState.prototype.Reset = function (){
	this.dog.Reset ();
	dog_laugh.currentTime = 0;
}

DeathState.prototype.Update = function (modifier) {
	this.dog.Update (modifier);
}

DeathState.prototype.Draw = function (modifier) {
	gameEngine.screen.context.save ();
	gameEngine.screen.context.globalAlpha = 0.3;

	gameEngine.states['game'].DrawLevel (gameEngine.states['game'].currLevel);
	gameEngine.screen.context.restore ();

	g_Screen.drawCenterText ("Death", GAME_WIDTH/2, GAME_HEIGHT/2-50, "grey", "24pt Calibri");
	g_Screen.drawCenterText ('x ' + g_gameInfo.currDeath, GAME_WIDTH/2, GAME_HEIGHT/2, "#eee", "18pt Calibri");
	
	this.dog.Draw();
}

DeathState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		gameEngine.states['game'].InitGame();
		gameEngine.ChangeState("game");
		dog_laugh.pause();
		
	}
}

DeathState.prototype.OnEnterState = function(params){
	g_gameInfo.replays.push (g_gameInfo.currReplay.clone ());
	g_gameInfo.currReplay.totalDuration = 0;
	g_gameInfo.currReplay.keyFrames = [];
}


///////////////////////////////////////////////////////////////////////////////
// ExplosionEffect: handles how to display the explosion effect when ones die
///////////////////////////////////////////////////////////////////////////////
var ExplosionEffect = function (params){
	this.color = params.color;
	this.duration = params.duration;
	this.elapsed = 0;
	
	this.done = false;

	this.particles   = [];
	this.nbParticles = params.nbParticles;
	this.ORIENTATION_TOP   = 0;
	this.ORIENTATION_LEFT  = 1;
	this.ORIENTATION_RIGHT = 2;
	
	for (var i = 0; i < params.nbParticles; ++i){
		var currSpeed = {x:0, y:0};
		// if (params.orientation == this.ORIENTATION_TOP){
			var currSize = 1+(Math.random ()*(5-1));
			currSpeed.x = Math.random ()-0.5,
			currSpeed.y = -Math.random ()*0.5;

			currSpeed.x /= (0.2*currSize);
			currSpeed.y /= (0.2*currSize);
		// }
		// else
		// {
		// 	currSpeed.y = Math.random ()-0.5;
		// 	if (params.orientation == this.ORIENTATION_RIGHT)
		// 		currSpeed.x = Math.random ()*0.5;	
		// 	else
		// 		currSpeed.x = -Math.random ()*0.5;	
		// }

		this.particles.push ({
			pos : {
				x: params.pos.x,
				y: params.pos.y
			},
			speed : {
				x : currSpeed.x,
				y : currSpeed.y
			},
			size : currSize
		});
	}		


	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}
		var level = gameEngine.states["game"].currLevel;
		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			var newPos = {
				x : currParticle.pos.x + currParticle.speed.x * dt * 200,
				y : currParticle.pos.y + currParticle.speed.y * dt * 200
			}
			
			var currCell = getCell (currParticle.pos);
			var newCell = getCell (newPos);

			if (hasCollision (level, newCell))  {
				if (newCell.y > currCell.y)
					currParticle.speed.y *= -1;
				if (newCell.x != currCell.x)
					currParticle.speed.x *= -1;
			}
			// Update particle position
			currParticle.pos.x = newPos.x;
			currParticle.pos.y = newPos.y;
			// Add gravity
			currParticle.speed.y += G * dt;
		}
	}
	
	this.Draw = function (ctx){
		ctx.save ();
		ctx.globalAlpha = 1-this.elapsed/this.duration;
		ctx.fillStyle = this.color;

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			ctx.fillRect(currParticle.pos.x,currParticle.pos.y,currParticle.size,currParticle.size);
		}

		ctx.restore ();
	}
}



///////////////////////////////////////////////////////////////////////////////
// BlockDisappearEffect: make 4 blocks slide when a block is destroyed
///////////////////////////////////////////////////////////////////////////////
var BlockDisappearEffect = function (params){
	this.color = params.color;
	this.duration = params.duration;
	this.elapsed = 0;
	
	this.done = false;

	this.particles = [];
	this.nbSubdivisions = params.nbSubdivisions;
	this.nbParticles = this.nbSubdivisions*this.nbSubdivisions;
	this.size = BLOC_SIZE/this.nbSubdivisions;
	this.sprite = new SpriteSheet (this.nbSubdivisions, this.nbSubdivisions);
	this.sprite.SetAnimated(false);
	

	for (var i = 0; i < this.nbSubdivisions; ++i){
		for (var j = 0; j < this.nbSubdivisions; ++j){
			var offset = this.size;
			this.particles.push ({
				pos : {
					x: params.pos.x + i*offset,
					y: params.pos.y + j*offset
				},
				ySpeed : Math.random (),
				id : {
					x : i,
					y : j
				}
			});
		}
	}

	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			var yNewPos = currParticle.pos.y + currParticle.ySpeed * dt * 100
			
			// Update particle position
			currParticle.pos.y = yNewPos;
		}
	}
	
	this.Draw = function (ctx){
		var viewport = gameEngine.states['game'].viewport;
		var image = g_DataCache.getImage ("bloc2");
		ctx.save ();
		ctx.globalAlpha = 1-this.elapsed/this.duration;
		// ctx.fillStyle = this.color;

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			this.sprite.SetState(currParticle.id.y);
			this.sprite.SetAnimation(currParticle.id.x);
			var x = currParticle.pos.x;
			var y = currParticle.pos.y;
			var s = BLOC_SIZE/this.nbSubdivisions;
			viewport.context.drawImage(image, currParticle.id.x*this.size, currParticle.id.y*this.size, s, s, x-viewport.x, y-viewport.y, s, s);

			// ctx.fillRect(currParticle.pos.x,currParticle.pos.y,this.size,this.size);
		}

		ctx.restore ();
	}
}

///////////////////////////////////////////////////////////////////////////////
// DogEffect: handles how to display the dog effect when ones die
///////////////////////////////////////////////////////////////////////////////
var DogEffect = function (params){
	this.duration = params.duration;
	this.elapsed = 0;
	
	this.done = false;

	this.Reset = function (){
		this.elapsed = 0;
		this.done = false;
	}

	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}

		dogSprite.Animate();
	}
	
	this.Draw = function (ctx){
		var ratio = this.elapsed/(this.duration*0.6);
		if (ratio > 1) ratio = 1;
		var ySize = 1.5*DOG_SIZE;

		var yPos = GAME_HEIGHT - (ySize*ratio)
		var xPos = (GAME_WIDTH/2)-(DOG_SIZE)/2;

		dogSprite.Draw(g_DataCache, gameEngine.states['game'].viewport, xPos, yPos, DOG_SIZE, ySize);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Death state
///////////////////////////////////////////////////////////////////////////////

EndOfLevelState = function(){
}

EndOfLevelState.prototype = {
	Replayer : {
		currentTime : 0,
		currentFrameIndex : 0
	}
}

EndOfLevelState.prototype.OnEnterState = function (params){
	g_gameInfo.replays.push (g_gameInfo.currReplay.clone ());
	var defaultReplayer = {
			currentTime : 0,
			currentFrameIndex : 0,
			currPos : {x:0, y:0}
		};
	for (var i = 0; i < g_gameInfo.replays.length; i++){
		g_gameInfo.replayers.push (defaultReplayer.clone());
	}
}

EndOfLevelState.prototype.OnLeaveState = function (params){
	g_gameInfo.replays = [];
	g_gameInfo.replayers = [];
	g_gameInfo.currReplay = defaultReplay.clone();
}

EndOfLevelState.prototype.Update = function (modifier) {
	// Updates the replayers
	for (var i = 0; i < g_gameInfo.replays.length; i++){
		
		var currReplay = g_gameInfo.replays[i];
		var replayer = g_gameInfo.replayers[i];

		while ((currReplay.keyFrames[ replayer.currentFrameIndex ].elapsed + modifier < replayer.currentTime)
			&& (replayer.currentFrameIndex < currReplay.keyFrames.length-1)) {
			replayer.currentFrameIndex++;
		}
		replayer.currPos = currReplay.keyFrames[ replayer.currentFrameIndex ].pos;
		replayer.currentTime += modifier;
	}
}

EndOfLevelState.prototype.Draw = function (modifier) {
	g_Screen.drawCenterText ("End of level \\o/", GAME_WIDTH/2, GAME_HEIGHT/2-50, "grey", "24pt Calibri");
	
	// Quick & dirty display of the level and it's replay
	gameEngine.screen.context.save ();
	gameEngine.screen.context.globalAlpha = 0.3;
	gameEngine.states['game'].DrawLevel (gameEngine.states['game'].currLevel);
	for (var i = 0; i < g_gameInfo.replayers.length; i++){
		g_Screen.drawRect (g_gameInfo.replayers[i].currPos.x-PLAYER_SIZE/2, g_gameInfo.replayers[i].currPos.y-PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE, "white");
	}
	gameEngine.screen.context.restore ();

	g_Screen.drawCenterText (g_gameInfo.currDeath + ' deaths', GAME_WIDTH/2, GAME_HEIGHT/2, "grey", "18pt Calibri");
	g_Screen.drawCenterText ('done in ' + g_gameInfo.levelTimer.ChronoString(), GAME_WIDTH/2, GAME_HEIGHT/2+40, "grey", "18pt Calibri");


}

EndOfLevelState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		g_gameInfo.currLevelIndex++;

		g_gameInfo.totalDeath += g_gameInfo.currDeath;

		g_gameInfo.currDeath = 0;
		gameEngine.states['game'].InitGame();
		gameEngine.ChangeState("game");
	}
}


///////////////////////////////////////////////////////////////////////////////
// Trail class
///////////////////////////////////////////////////////////////////////////////
Trail = function(){

}

Trail.prototype = {
	queue : [],
	timer : {},
}

Trail.prototype.Init = function (){
	this.timer = new Timer ();
	this.timer.Start ();
	this.queue = [];
}

Trail.prototype.AddPos = function(pos){
	if (this.timer.IsElapsed(TIME_BETWEEN_TRAIL)){
		this.timer.Start ();
		this.queue.push({x:pos.x, y:pos.y});
		if (this.queue.length > MAX_TRAIL_QUEUE){
			this.queue.shift ();
		}
	}
}


Trail.prototype.Draw = function (){
	var playerColor = 'rgb(255,255,255)';
	
	if (this.queue.length > 0)
	{
		for (i = 0; i < this.queue.length; ++i)
		{
			currPos = this.queue[i];
			var transpa = i/this.queue.length;
			g_Screen.drawRect (currPos.x - PLAYER_SIZE/2, currPos.y-PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE, playerColor, transpa);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
// Player class
///////////////////////////////////////////////////////////////////////////////
Player = function(){
	this.trail = new Trail ();
}

Player.prototype = {
	pos : {x:0,y:0},
	speed : {x:0,y:0},
	trail : {}
}

Player.prototype.Init = function (){
	this.trail.Init ();
}

Player.prototype.InitFromLevel = function(level){
	var midPos =  BLOC_SIZE/2;

	for (var j = 0; j < NB_Y_BLOC; ++j) {
		for (var i = 0; i < NB_X_BLOC; ++i) {
			if (level[j][i] == BLOCK.PLAYER_START)
			{
				this.pos = {
					x : i*BLOC_SIZE+midPos,
					y : j*BLOC_SIZE+midPos
				}
				level[j][i] = BLOCK.NONE;
			}
		}
	}
	this.speed = {x:0,y:0};	
}

Player.prototype.Draw = function (){
	var playerColor = 'rgb(255,255,255)';
	
	this.trail.Draw ();

	g_Screen.drawRect (this.pos.x-PLAYER_SIZE/2, this.pos.y-PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE, playerColor);
}

///////////////////////////////////////////////////////////////////////////////
// Game state
///////////////////////////////////////////////////////////////////////////////
GameState = function(){
	this.viewport = new Viewport(gameEngine);
	this.InitGame();
}

GameState.prototype = {
	currLevel : [], // affected later based on currLevelIndex
	
	arrow : {},
	elapsedSinceLastCollision:0
}

GameState.prototype.OnEnterState = function (){
	dog_laugh = g_DataCache.getSound("duck-hunt-dog-laugh-ringtone");
	dog_laugh.loop = false;
	sound_explosion = g_DataCache.getSound("18384__inferno__largex");
	sound_bounce = g_DataCache.getSound("Ball_Bounce-Popup_Pixels-172648817");
}

GameState.prototype.InitPlayer =function(){
	this.hero  = new Player ();
	this.hero.Init ();
	this.hero.InitFromLevel(this.currLevel);
}

GameState.prototype.InitLevel = function(){
	g_gameInfo.levelTimer.Start();
	
	for (var mini = 0; mini < NB_Y_BLOC ; ++mini) {
		 if (this.currLevel[mini][NB_X_BLOC-1] == BLOCK.NONE){
		 	break;
		 }
	}
	for (var maxi = NB_Y_BLOC-1; maxi >= 0; --maxi) {
		 if (this.currLevel[maxi][NB_X_BLOC-1] == BLOCK.NONE){
		 	break;
		 }
	}
	
	this.arrow = {
		mini:mini,
		maxi:maxi
	}
}

GameState.prototype.InitGame =function(){
  this.currLevel = [];
  
  for (var r = 0; r < levels[g_gameInfo.currLevelIndex].length; ++r) {
    var row = levels[g_gameInfo.currLevelIndex][r];
    
    this.currLevel[r] = [];
    
    for (var c = 0; c < row.length; c += 2) {
      var block = BLOCK.NONE;
      
      switch (row[c]) {
        case 'o': block = BLOCK.WALL; break;
        case 's': block = BLOCK.PLAYER_START; break;
        case 'x': block = BLOCK.DESTROYABLE; break;
        case '*': block = BLOCK.EXPLODE; break;
        case '>': block = BLOCK.ROCKET; break;
        default:;
      }
      
      this.currLevel[r][c/2] = block;
    }
  }

	this.InitLevel();	
	this.InitPlayer();
	this.elapsedSinceLastCollision = 0;

}

GameState.prototype.KeyPress = function(event){

}

GameState.prototype.UpdateCurrentReplay = function (dt){
	g_gameInfo.currReplay.keyFrames.push ({
		elapsed : g_gameInfo.currReplay.totalDuration,
		dt : dt,
		pos : this.hero.pos.clone()
	});
	g_gameInfo.currReplay.totalDuration += dt;
} 

GameState.prototype.Update = function (modifier) {
	this.dt = modifier;
	this.UpdateCurrentReplay (modifier);

	if (KB_LEFT in gameEngine.keysDown) {
		this.hero.speed.x -= SPEED_X * modifier;
		if (this.hero.speed.x < -MAX_SPEED_X)
			this.hero.speed.x = -MAX_SPEED_X;
	}
	if (KB_RIGHT in gameEngine.keysDown) {
		this.hero.speed.x += SPEED_X * modifier;
		if (this.hero.speed.x > MAX_SPEED_X)
			this.hero.speed.x = MAX_SPEED_X;
	}
	if (KB_ESCAPE in gameEngine.keysDown) {
		gameEngine.ChangeState("menu");
	}

	this.hero.speed.y += G * modifier; // gravity
	
	// Yes, this is hacky. No, I don't care.
	if (
		this.hero.pos.x+this.hero.speed.x+1.5*PLAYER_SIZE > GAME_WIDTH
	) {
		// Reached the end of the level
		if (g_gameInfo.currLevelIndex < levels.length){
			g_gameInfo.levelTimer.Stop();
			gameEngine.ChangeState ("endoflevel");
		}
	}

	this.handleCollisions(this.elapsedSinceLastCollision + this.dt);
	this.elapsedSinceLastCollision = 0;

	if (this.hero.pos.y > GAME_HEIGHT){
		this.die();
	}

	this.hero.pos.x += this.hero.speed.x;
	this.hero.pos.y += this.hero.speed.y;

	this.hero.trail.AddPos (this.hero.pos);
};

// Convert screen coordinates into cell coordinates
function getCell (pt){
	var res = 
	{
		x : Math.floor(pt.x / BLOC_SIZE),
		y : Math.floor(pt.y / BLOC_SIZE)
	}
	return res;
}

function hasCollision (level, cell){
	res = 0;
	if ((cell.x >= 0 && cell.x < NB_X_BLOC)
	&& (cell.y >= 0 && cell.y < NB_Y_BLOC))
	{
		res = level[cell.y][cell.x];
	}

	return res;
}

GameState.prototype.getCollisionInfo = function (){
	var newPos = 
	{
		x : this.hero.pos.x + this.hero.speed.x,
		y : this.hero.pos.y + this.hero.speed.y
	}

	this.hero.cell = getCell (this.hero.pos);
	var newCell = getCell (newPos);

	var NB_SUBDIVISION = BLOC_SIZE;
	var collisionInfo = {
		collisionCell :  {},
		intersectionPoint :  {},
		blockType : BLOCK.NONE
	};

	// If we did not change cell, no new collision
	if (((newCell.x != this.hero.cell.x) || (newCell.y != this.hero.cell.y)) || getCell(this.hero.cell) != BLOCK.NONE)
	{	
		// Todo : check if there if a collision via bounding box

		// Linear search of the first collision point
		var dx = (newPos.x - this.hero.pos.x)/NB_SUBDIVISION;
		var dy = (newPos.y - this.hero.pos.y)/NB_SUBDIVISION;
		for (var i = 0; i < NB_SUBDIVISION; ++i){
			var currPoint = {
				x : this.hero.pos.x + (dx * i),
				y : this.hero.pos.y + (dy * i)
			}

			var currCell = getCell(currPoint);
			var blockType = hasCollision(this.currLevel, currCell);
			
			// Tada ! A collision is found.
			// The collision point is nearby, let's consider it's here
			if (blockType != BLOCK.NONE)
			{
				collisionInfo.collisionCell = currCell;
				collisionInfo.intersectionPoint = currPoint;
				collisionInfo.blockType = blockType;
				// console.log (collisionInfo);
				break;
			}
		}
	}

	return collisionInfo;
}

GameState.prototype.handlePhysics = function (collisionInfo){
	if (collisionInfo.blockType != BLOCK.NONE) {
		if (collisionInfo.collisionCell.x != this.hero.cell.x)
			this.hero.speed.x *= REBOUND_MODIFIER;
		else if (collisionInfo.collisionCell.y > this.hero.cell.y)
		{
			this.hero.speed.y = -BOUNCE_SPEED_Y;
		}			
	}
}

GameState.prototype.handleGameObjects = function (collisionInfo){
	if (collisionInfo.blockType != BLOCK.NONE)
	{
		var currBlock = collisionInfo.collisionCell;
		if (collisionInfo.blockType == BLOCK.EXPLODE){
			this.die ();
			// sound_explosion.play ();
			gameEngine.effects.push ( new ExplosionEffect ({color:"rgb(255, 40, 40)", duration:1, pos:this.hero.pos.clone(), nbParticles:50}) );
		}
		else if (collisionInfo.blockType == BLOCK.DESTROYABLE && collisionInfo.collisionCell.y > this.hero.cell.y )
		{
			this.currLevel[currBlock.y][currBlock.x] = BLOCK.NONE;
			gameEngine.effects.push ( new BlockDisappearEffect ({color:"grey", duration:1, pos:{x:currBlock.x*BLOC_SIZE, y:currBlock.y*BLOC_SIZE}, nbSubdivisions:4}) );
		}
		// attempt at handling bounces on walls
		else if (collisionInfo.blockType == BLOCK.WALL){
			if (KB_RIGHT in gameEngine.keysDown && collisionInfo.collisionCell.x < this.hero.cell.x) {
				this.hero.speed.y = -BOUNCE_SPEED_Y * REBOUND_MODIFIER;
			}
			if (KB_LEFT in gameEngine.keysDown && collisionInfo.collisionCell.x > this.hero.cell.x) {
				this.hero.speed.y = -BOUNCE_SPEED_Y  * REBOUND_MODIFIER;
			}
		}
    else if (collisionInfo.blockType == BLOCK.ROCKET) {
      this.hero.speed.x = MAX_SPEED_X;
      this.hero.speed.y = 0;
      this.hero.pos.y = currBlock.y;
      this.hero.pos.x = currBlock.x + BLOC_SIZE/4;
    }
	}
}

GameState.prototype.handleCollisions = function (dt){
	var collisionInfo = this.getCollisionInfo ();

	this.handlePhysics (collisionInfo);
	this.handleGameObjects (collisionInfo);
}

GameState.prototype.die  = function(){
	gameEngine.effects.push ( new FadeEffect ({color:"rgb(255, 40, 40)", duration:0.3, fadeType:FadeEffect.FADE_IN}) );
	
	g_gameInfo.currDeath++;
	gameEngine.ChangeState("death");
	gameEngine.states["death"].Reset();
	// dog_laugh.play();
}


// Draw everything
GameState.prototype.Draw = function () {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");
	this.DrawLevel(this.currLevel);
	this.DrawPlayer();

};

imageName = {
		1 : "bloc1",
		2 : "bloc2",
		3 : "bloc3",
		4 : "bloc4"
	};

function drawBlock(x,y, blocId){
	gameEngine.states ['game'].viewport.DrawSprite (
					imageName[blocId], 
					x,
					y,
					BLOC_SIZE,
					BLOC_SIZE
				);
}


GameState.prototype.DrawLevel = function (level) {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");
	
	for (x = 0; x < NB_X_BLOC; ++x)
		for (y = 0; y < NB_Y_BLOC; ++y)
		{
			v = level[y][x];
			if (0 != v) {
				xOffset = x*BLOC_SIZE;
				yOffset = y*BLOC_SIZE;
				drawBlock (xOffset, yOffset, v);
			}
			
		}

	// "HUD". Well, sort of
	g_Screen.drawText (
			"Hero : (" 
			+ this.hero.pos.x.toFixed (1)
			+ ', '
			+ this.hero.pos.y.toFixed (1)
			+ ')', 
			32,
			32,
			"rgb(0, 250, 250)", 
			"18px Helvetica"
		);

	var ySize = 6;
	var xSize = 8;
	this.viewport.DrawSprite (
					'arrow', 
					BLOC_SIZE*(NB_X_BLOC-1) + (xSize/BLOC_SIZE)*BLOC_SIZE,
					BLOC_SIZE*(this.arrow.maxi)-ySize/2,
					xSize,
					ySize
				);
};

GameState.prototype.DrawPlayer = function () {
	var playerColor = "white";
	var MULTIPLIER = 1000;
	// console.log (this.dt*MULTIPLIER);
	this.hero.Draw ();
	g_Screen.drawLine (this.hero.pos, {x:this.hero.pos.x+this.hero.speed.x*this.dt*MULTIPLIER, y:this.hero.pos.y+this.hero.speed.y*this.dt*MULTIPLIER}, 'red');
};

///////////////////////////////////////////////////////////////////////////////
// Our application
// Initialization of the global variables (the different states + the engine)
// and execution of the game
///////////////////////////////////////////////////////////////////////////////
var gameEngine = new K2DEngine({
	width: GAME_WIDTH,
	height : GAME_HEIGHT,
	datacache:g_DataCache,
	stateAfterLoading : "menu"
});

var g_Screen = new Screen (gameEngine);

var menuState = new MenuState();
var gameState = new GameState();
var creditState = new CreditState();
var editorState = new EditorState();
var deathState = new DeathState();
var endOfLevelState = new EndOfLevelState();

gameEngine.states = 
	{
		menu  : menuState,
		game  : gameState,
		credit: creditState,
		editor: editorState,
		death : deathState,
		endoflevel : endOfLevelState
	};

gameEngine.Init();
