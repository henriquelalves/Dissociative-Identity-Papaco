// Var declaration ----------------------------------------------
window.requestAnimationFrame = function() {
	return window.requestAnimationFrame ||
		 window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame || 
		function(f) {
			window.setTimeout(f,1e3/30);
		}
}();

var sw = 62;
var sh = 62;
var tickLimit = 5;
var velocity = 2.5;
var highscore = false;
var best_score;

 //best score from cookie
if($.cookie('best_score') == undefined) best_score = 0;
else best_score = $.cookie('best_score');

var id;
var idRunning = [];
var idAbility = [];
var imgKobold;
var imgBat;
var imgOrc;
var imgArrow;
var imgFireball;
var imgLifeOrb;
var imgExpOrb;
var imgBackground;
var imgHUDFrame;
var c;
var ctx;

var sndIntro;
var sndMenuVoice;
var sndGameover;

var sndPacifist;
var sndMage;
var sndPunk;
var sndRanger;
var sndWarrior;

var sndGocart;
var sndOroboros;

var fishermanLogo;
var backgroundMenu;
var backgroundCredits;
var backgroundGameover;
var bonus;


// Resource manager -------------------------------------------------
resourceManager = function(){
	var imageSources = [];
	var imageObjects = [];
	var soundSources = [];
	var soundObjects = [];
	var that = this;
	return {
		addImageSource: function (src){
			imageSources.push(src);
			return this;
		},
		loadImages: function(cB){
			var callback = cB;
			var count = imageSources.length;
			var iS = imageSources;
			for (var i = 0; i<imageSources.length;i++){
				imageObjects[i] = new Image();
				imageObjects[i].src = imageSources[i];
				imageObjects[i].onload = function (){
					count--;
					console.log('Loaded image "' + iS[i-1] + '" : ' + i + " of " + iS.length);
					if (count === 0){
						callback();
					}
				};
			};	
		},
		getImageObject : function(src){
			for (var i = 0; i<imageObjects.length; i++){
				if (imageSources[i] === src){
					return imageObjects[i];
				}
			}
			return undefined;
		},
		addSoundSource: function (src){
			soundSources.push(src);
			return this;
		},
		loadSounds: function(cB){
			var callback = cB;
			var count = soundSources.length;
			if (count === 0) callback();
			for (var i = 0; i<soundSources.length;i++){
				var sS = soundSources;
				var onLoad = function (){
					console.log('Loaded sound "' + sS[i-1] + '" : ' + i + " of " + sS.length);
					count--;
					if (count === 0){
						callback();
					}
				};
				soundObjects[i] = new Audio();
				soundObjects[i].addEventListener('canplaythrough',onLoad,false);
				soundObjects[i].src = soundSources[i];
			}
		},
		getSoundObject : function(src){
			for (var i = 0; i<soundObjects.length; i++){
				if (soundSources[i] === src){
					return soundObjects[i];
				}
			}
			return undefined;
		}
	};
}();

// Pressed thingy -------------------------------------------
var pressed={};
window.onkeydown=function(e){
     e = e || window.event;
     pressed[e.keyCode] = true;
}
window.onkeyup=function(e){
     e = e || window.event;
     delete pressed[e.keyCode];
}

// Player Identities Names ---------------------------------
id = ["warrior","ranger","punk","pacifist","mage"];

// Player ------------------------------------------------
var Player = {
	cX: 10,
	cY: 100,
	vX: 0,
	vY: 0,
	score: 0,
	usingAbility: 0,
	breakdownLevel: 0,
	timetochange: 0,
	timeinc: 0.2,
	cId: "warrior",
	nextId: id[1],
	cFrame: 0,
	tick: 0,
	reset: function(){
		Player.cX= 10;
		Player.cY= 100;
		Player.vX= 0;
		Player.vY= 0;
		Player.score= 0;
		Player.usingAbility= 0;
		Player.breakdownLevel= 0;
		Player.timetochange= 0;
		Player.timeinc= 0.2;
		Player.cId= "warrior";
		Player.nextId= id[1];
		Player.cFrame= 0;
		Player.tick= 0;
	},
	draw: function(){
		if(!Player.usingAbility){
			ctx.drawImage(idRunning[Player.cId], Player.cFrame*sw, 0, sw, sh, Player.cX, Player.cY, sw, sh);
		} else {
			ctx.drawImage(idAbility[Player.cId], Player.cFrame*sw, 0, sw, sh, Player.cX, Player.cY, sw, sh);
		}
	},
	move: function(){
		if(pressed[87] && Player.cY > 32){
			
			Player.vY = -velocity;
		} else if (pressed[83] && Player.cY < canvas.height-sh) {
			Player.vY = velocity;
		} else {
			Player.vY = 0;
		}
		if(pressed[65] && Player.cX > 0){
			Player.vX = -velocity;
			if(Player.cId === "ranger")
				Player.breakdownLevel += 0.3;
		} else if (pressed[68] && Player.cX < canvas.width-sw) {
			if(Player.cId === "ranger")
				Player.breakdownLevel += 0.3;
			Player.vX = velocity;
		} else {
			Player.vX = 0;
		}
		if(pressed[32] && Player.usingAbility === 0){
			Player.usingAbility = 1;
			Player.cFrame = 0;
			if(Player.cId === "ranger"){
				var a = arrow();
				a.init();
				Spawner.shots.push(a);
				Spawner.numShots += 1;
			} else if(Player.cId === "mage"){
				var f = fireball();
				f.init();
				Spawner.shots.push(f);
				Spawner.numShots += 1;
			} 
		}
	},
	update: function(){
		Player.draw();
		Player.move();
		
		Player.cX += Player.vX;
		Player.cY += Player.vY;
		
		Player.timetochange += Player.timeinc;
		if (Player.timetochange > 100){
			var newId = Math.floor(Math.random()*5);
			Player.cId = Player.nextId;
			if(Player.cId === "warrior")
				sndWarrior.play();
			if(Player.cId === "pacifist")
				sndPacifist.play();
			if(Player.cId === "ranger")
				sndRanger.play();
			if(Player.cId === "mage")
				sndMage.play();
			if(Player.cId === "punk")
				sndPunk.play();
			Player.nextId = id[newId];
			Player.timetochange = 0;
		}
		
		Player.tick += 1;
		if (Player.tick === tickLimit){
			Player.tick = 0;
			Player.cFrame += 1;
			if (!Player.usingAbility){
				if (Player.cFrame > (idRunning[Player.cId].width/sw)-1){
					Player.cFrame = 0;
				}
			} else {
				if (Player.cFrame > (idAbility[Player.cId].width/sw)-1){
					Player.cFrame = 0;
					Player.usingAbility = 0;
				}
			}
		}
	}
}

// Background -----------------------------------------------------------
var Background = {
	vx: 0,
	W: 0,
	H: 0,
	init: function(cW, cH){
		Background.W = cW;
		Background.H = cH;
	},
	draw: function(){
		ctx.drawImage(imgBackground, Background.vx, 0);
		ctx.drawImage(imgBackground, imgBackground.width-Math.abs(Background.vx), 0);
		if (Math.abs(Background.vx) > imgBackground.width) {
			Background.vx = -2;
		}
		Background.vx -= 2;
	},
}

// HUD --------------------------------------------------------------
var HUD = {
	portraits: [],
	push_portrait: function(name, url){
		HUD.portraits[name] = new Image();
		HUD.portraits[name].src = url;
	},
	draw: function(){
		if(HUD.portraits[Player.cId]){
			ctx.drawImage(HUD.portraits[Player.cId], 0, 0, HUD.portraits[Player.cId].width, HUD.portraits[Player.cId].height, 0, 0, 64, 32);
		}
		ctx.drawImage(imgHUDFrame, 0, 0);
		ctx.fillStyle="rgba(255,0,0,0.6)";
		ctx.fillRect(65,2,(Player.breakdownLevel/100)*254,28);
		ctx.fillStyle="#dd2222";
		ctx.fillRect(0,253,(Player.timetochange/100)*384,3);
		ctx.fillStyle="#000000";
		ctx.font="16px Small Fonts";
		ctx.fillText(Player.score,324,26);
		ctx.fillStyle="#ff1111";
		ctx.font="16px Small Fonts";
		if(Player.cId === "warrior"){
			ctx.fillText("kill all enemies!", 220,canvas.height-10);
		} else if (Player.cId === "punk"){
			ctx.fillText("dont get the orbs!", 220,canvas.height-10);
		} else if (Player.cId === "pacifist"){
			ctx.fillText("cant attack lol", 220,canvas.height-10);
		} else if (Player.cId === "mage"){
			ctx.fillText("get all the orbs!", 220,canvas.height-10);
		} else if (Player.cId === "ranger"){
			ctx.fillText("dont move sideways!", 220,canvas.height-10);
		}
	},
}

// Kobold Enemy ----------------------------------------------------
var kobold = function () {
    var x;
	var y;
	var vel;
	var tick = 0;
	var cFrame = 0;
    return {
		init: function() {
			x = canvas.width;
			y = (Math.floor((Math.random()*6))*32)+32;
			vel = Math.floor((Math.random()*3)+1);
		},
        draw: function() {
			if (x < canvas.width && x > -sw)
				ctx.drawImage(imgKobold, cFrame*sw, 0, sw, sh, x, y, sw, sh);
        },
        update: function() {
			this.draw();
            x -= vel;
			tick += 0.5;
			if (tick === tickLimit){
				tick = 0;
				cFrame += 1;
				if (cFrame > (imgKobold.width/sw)-1){
					cFrame = 0;
				}
			}
        },
		isDead: function() {
			if (x < -sw){
				if (Player.cId === "warrior")
					Player.breakdownLevel += 5;
				return true;
			}
			else if ((Math.abs((Player.cX) - (x)) * 2 < (sw/2 + sw)) && (Math.abs((Player.cY + sw/2) - (y + sw/2)) * 2 < (sw + sw))){
				var e = explosion();
				e.init(x,y);
				Spawner.enemies.push(e);
				Spawner.numEnemies += 1;
				if (Player.usingAbility && (Player.cId === "warrior"  || Player.cId === "punk")){
					Player.score+=1;
					var snd = resourceManager.getSoundObject("sounds/zoado4.wav");
						snd.play();
					return true;
				} else {
					Player.breakdownLevel += 10;
					var snd = resourceManager.getSoundObject("sounds/zoado4.wav");
						snd.play();
					return true;
				}
			} else {
				var i;
				for (i = 0; i < Spawner.numShots; i += 1){
					if ((Math.abs((Spawner.shots[i].getx() + sw/4) - (x + sw/2)) * 2 < (sw/4 + sw)) && (Math.abs((Spawner.shots[i].gety() + sw/4) - (y + sw/2)) * 2 < (sw/4 + sw))){
						Spawner.shots.splice(i,1);
						Spawner.numShots -= 1;
						Player.score+=1;
						var e = explosion();
						e.init(x,y);
						Spawner.enemies.push(e);
						Spawner.numEnemies += 1;
						
						var snd = resourceManager.getSoundObject("sounds/zoado4.wav");
						snd.play();
						return true;
					}
				}
			}
		},
    };
};

// Explosion ---------------------------------------------------------------
var explosion = function () {
    var x;
	var y;
	var velx;
	var tick = 0;
	var cFrame = 0;
    return {
		init: function(ox, oy) {
			x = ox;
			y = oy;
			velx = 1;
		},
        draw: function() {
			if (x < canvas.width && x > -sw && y < canvas.height && y > -sh)
				ctx.drawImage(imgExplosion, cFrame*sw, 0, sw, sh, x, y, sw, sh);
        },
        update: function() {
			this.draw();
            x -= velx;
			tick += 1.5;
			if (tick >= tickLimit){
				tick = 0;
				cFrame += 1;
			}
        },
		isDead: function() {
			if (x < -sw){
				return true;
			}
			else if (cFrame > (imgExplosion.width/sw)-1){
				return true;
			}
		},
    };
};

// Bat Enemy -------------------------------------------------------------
var bat = function () {
    var x;
	var y;
	var velx;
	var vely;
	var tick = 0;
	var cFrame = 0;
    return {
		init: function() {
			x = canvas.width;
			y = (Math.floor((Math.random()*6))*32)+32;
			velx = Math.floor((Math.random()*3)+1);
			vely = Math.floor((Math.random()*3)-1);
		},
        draw: function() {
			if (x < canvas.width && x > -sw && y < canvas.height && y > -sh)
				ctx.drawImage(imgBat, cFrame*sw/2, 0, sw/2, sh/2, x, y, sw/2, sh/2);
        },
        update: function() {
			this.draw();
            x -= velx;
			y += 2*Math.sin(vely);
			vely += 0.02;
			tick += 1;
			if (tick === tickLimit){
				tick = 0;
				cFrame += 1;
				if (cFrame > (imgBat.width/sw)-1){
					cFrame = 0;
				}
			}
        },
		isDead: function() {
			if (x < -sw){
				if (Player.cId === "warrior"){
					Player.breakdownLevel += 5;
				}
				return true;
			}
			else if ((Math.abs((Player.cX + sw/2) - (x + sw/4)) * 2 < (sw/4 + sw/2)) && (Math.abs((Player.cY + sw/2) - (y + sw/4)) * 2 < (sw/4 + sw/2))){
				var e = explosion();
				e.init(x,y-30);
				Spawner.enemies.push(e);
				Spawner.numEnemies += 1;
				if (Player.usingAbility && (Player.cId === "warrior"  || Player.cId === "punk")){
					Player.score+=2;
					var snd = resourceManager.getSoundObject("sounds/zoado3.wav");
						snd.play();
					return true;
				} else {
					Player.breakdownLevel += 5;
					var snd = resourceManager.getSoundObject("sounds/zoado3.wav");
						snd.play();
					return true;
				}
			} else {
				var i;
				for (i = 0; i < Spawner.numShots; i += 1){
					if ((Math.abs((Spawner.shots[i].getx() + sw/4) - (x + sw/4)) * 2 < (sw/4 + sw/2)) && (Math.abs((Spawner.shots[i].gety() + sw/4) - (y + sw/4)) * 2 < (sw/4 + sw/2))){
						Spawner.shots.splice(i,1);
						Spawner.numShots -= 1;
						Player.score+=2;
						
						var e = explosion();
						e.init(x,y);
						Spawner.enemies.push(e);
						Spawner.numEnemies += 1;
						
						var snd = resourceManager.getSoundObject("sounds/zoado3.wav");
						snd.play();
						
						return true;
					}
				}
			}
		},
    };
};

// Orc enemy ----------------------------------------------------------
var orc = function () {
    var x;
	var y;
	var velx;
	var tick = 0;
	var cFrame = 0;
    return {
		init: function() {
			x = canvas.width;
			y = (Math.floor((Math.random()*6))*32)+32;
			velx = 1;
		},
        draw: function() {
			if (x < canvas.width && x > -sw)
				ctx.drawImage(imgOrc, cFrame*sw, 0, sw, sh, x, y, sw, sh);
        },
        update: function() {
			var rand = Math.floor(Math.random()*150);
			if(rand === 1){
				var f = enemyFireball();
				f.init(x, y);
				Spawner.enemies.push(f);
				Spawner.numEnemies += 1;
			}
			this.draw();
            x -= velx;
			tick += 1;
			if (tick === tickLimit){
				tick = 0;
				cFrame += 1;
				if (cFrame > (imgOrc.width/sw)-1){
					cFrame = 0;
				}
			}
        },
		isDead: function() {
			if (x < -sw){
				if (Player.cId === "warrior"){
					Player.breakdownLevel += 5;
				}
				return true;
			}
			else if ((Math.abs((Player.cX + sw/2) - (x + sw/2)) * 2 < (sw/4 + sw)) && (Math.abs((Player.cY + sw/2) - (y + sw/2)) * 2 < (sw/2 + sw))){
				var e = explosion();
				e.init(x,y);
				Spawner.enemies.push(e);
				Spawner.numEnemies += 1;
				if (Player.usingAbility && (Player.cId === "warrior" || Player.cId === "punk")){
					Player.score+=3;
					var snd = resourceManager.getSoundObject("sounds/zoado1.wav");
						snd.play();
					return true;
				} else {
					Player.breakdownLevel += 15;
					var snd = resourceManager.getSoundObject("sounds/zoado1.wav");
						snd.play();
					return true;
				}
			} else {
				var i;
				for (i = 0; i < Spawner.numShots; i += 1){
					if ((Math.abs((Spawner.shots[i].getx() + sw/4) - (x + sw/2)) * 2 < (sw/4 + sw)) && (Math.abs((Spawner.shots[i].gety() + sw/4) - (y + sw/2)) * 2 < (sw/4 + sw))){
						Spawner.shots.splice(i,1);
						Spawner.numShots -= 1;
						Player.score+=3;
						
						var e = explosion();
						e.init(x,y);
						Spawner.enemies.push(e);
						Spawner.numEnemies += 1;
						
						var snd = resourceManager.getSoundObject("sounds/zoado1.wav");
						snd.play();
						return true;
					}
				}
			}
		},
    };
};

// Orc projectile ----------------------------------------------------------
var enemyFireball = function () {
    var x;
	var y;
	var velx;
    return {
		init: function(ox, oy) {
			x = ox-16;
			y = oy+16;
			velx = 4;
		},
        draw: function() {
			if (x < canvas.width && x > -sw)
				ctx.drawImage(imgFireball, x, y);
        },
        update: function() {
			this.draw();
            x -= velx;
        },
		isDead: function() {
			if (x < -sw){
				return true;
			}
			else if ((Math.abs((Player.cX + sw/2) - (x + sw/2)) * 2 < (sw/4 + sw)) && (Math.abs((Player.cY + sw/2) - (y + sw/2)) * 2 < (sw/4 + sw))){
				Player.breakdownLevel += 15;
				return true;
			} 
		},
    };
};

// Arrow ------------------------------------------------------------
var arrow = function () {
    var x;
	var y;
	var velx;
    return {
		init: function() {
			x = Player.cX + sw/2;
			y = Player.cY + sw/2;
			velx = 5;
		},
        draw: function() {
			if (x < canvas.width && x > -sw && y < canvas.height && y > -sh)
				ctx.drawImage(imgArrow, x, y);
        },
        update: function() {
			this.draw();
            x += velx;
        },
		getx: function() {
			return x;
		},
		gety: function() {
			return y;
		},
		isDead: function() {
			if (x > canvas.width)
				return true;
		},
    };
};

// Fireball ------------------------------------------------------------
var fireball = function () {
    var x;
	var y;
	var velx;
	var vely;
    return {
		init: function() {
			x = Player.cX + sw/2;
			y = Player.cY + sw/2;
			velx = 3;
			vely = Math.floor((Math.random()*3)-1);
		},
        draw: function() {
			if (x < canvas.width && x > -sw && y < canvas.height && y > -sh)
				ctx.drawImage(imgColdball, x, y);
        },
        update: function() {
			this.draw();
            x += velx;
			y += 2*Math.sin(vely);
			vely += 0.02;
        },
		getx: function() {
			return x;
		},
		gety: function() {
			return y;
		},
		isDead: function() {
			if (x > canvas.width)
				return true;
		},
    };
};

// Orbs ---------------------------------------------------------------
var lifeOrb = function () {
    var x;
	var y;
	var velx;
    return {
		init: function() {
			x = canvas.width;
			y = (Math.floor((Math.random()*6)+1)*32)+32;
			velx = Math.floor((Math.random()*2)+2);
		},
        draw: function() {
			if (x < canvas.width && x > -sw)
				ctx.drawImage(imgLifeOrb, x, y);
        },
        update: function() {
			this.draw();
            x -= velx;
        },
		isDead: function() {
			if (x < -sw){
				if (Player.cId === "mage")
					Player.breakdownLevel += 10;
				return true;
			}
			else if ((Math.abs((Player.cX + sw/2) - (x + sw/4)) * 2 < (sw/2 + sw/2)) && (Math.abs((Player.cY + sw/2) - (y + sw/4)) * 2 < (sw/2 + sw/2))){
				if (Player.breakdownLevel > 5){
					Player.breakdownLevel -= 5;
				}
                if(Player.cId !== "punk")
                    Player.score += 10;
				if (Player.cId === "punk")
					Player.breakdownLevel += 10;
				return true;
				
			}
		},
    };
};

// Spawner ----------------------------------------------------------
var Spawner= {
	enemies: [],
	shots: [],
	numShots: 0,
	numEnemies: 0,
	timerLimit: 80,
	tick: 0,
	ring: 0,
	reset: function(){
		Spawner.timerLimit = 80;
		Spawner.tick = 0;
		Spawner.ring = 0;
		var i;
		for (i = 0; i < Spawner.numShots; i){
			Spawner.shots.splice(i,1);
			Spawner.numShots -= 1;
		}
		for (i = 0; i < Spawner.numEnemies; i){
			Spawner.enemies.splice(i,1);
			Spawner.numEnemies -= 1;
		}
	},
	createKobold: function(){
		var k = kobold();
		k.init();
		Spawner.enemies.push(k);
		Spawner.numEnemies += 1;
	},
	createBat: function(){
		var b = bat();
		b.init();
		Spawner.enemies.push(b);
		Spawner.numEnemies +=1;
	},
	createOrc: function(){
		var o = orc();
		o.init();
		Spawner.enemies.push(o);
		Spawner.numEnemies +=1;
	},
	createLifeOrb: function(){
		var lo = lifeOrb();
		lo.init();
		Spawner.enemies.push(lo);
		Spawner.numEnemies +=1;
	},
	update: function(){
		var i;
		for(i = 0; i < Spawner.numEnemies; i += 1){
			if(Spawner.enemies[i].isDead()){
				Spawner.enemies.splice(i,1);
				Spawner.numEnemies -= 1;
				i--;
				continue;
			}
			Spawner.enemies[i].update();
		}
		for(i = 0; i < Spawner.numShots; i += 1){
			if(Spawner.shots[i].isDead()) {
				Spawner.shots.splice(i,1);
				Spawner.numShots -= 1;
				i--;
				continue;
			}
			Spawner.shots[i].update();
		}
		
		Spawner.timer();
		
		if (Spawner.ring === 1){
			Spawner.ring = 0;
			var rand = Math.floor(Math.random()*6);
			if (rand === 0 || rand === 1)
				Spawner.createKobold();
			else if (rand === 2 || rand === 3)
				Spawner.createBat();
			else if (rand === 4)
				Spawner.createOrc();
			else if (rand === 5)
				Spawner.createLifeOrb();
		}
	},
	timer: function(){
		Spawner.tick += 1;
		if (Spawner.tick === Spawner.timerLimit){
			Spawner.ring = 1;
			Spawner.tick = 0;
		}
	}
}

var onLoad = function(){
	// Variable setup
	idRunning["warrior"] = resourceManager.getImageObject("images/warriorSheet.png");
	idRunning["ranger"] = resourceManager.getImageObject("images/rangerSheet.png");
	idRunning["punk"] = resourceManager.getImageObject("images/punkSheet.png");
	idRunning["pacifist"] = resourceManager.getImageObject("images/hippieSheet.png");
	idRunning["mage"] = resourceManager.getImageObject("images/mageSheet.png");
	imgKobold = resourceManager.getImageObject("images/koboldSheet.png");
	imgBat = resourceManager.getImageObject("images/batSheet.png");
	imgOrc = resourceManager.getImageObject("images/orcSheet.png");
	imgArrow = resourceManager.getImageObject("images/arrow.png");
	imgFireball = resourceManager.getImageObject("images/fireball.png");
	imgColdball = resourceManager.getImageObject("images/coldball.png");
	imgLifeOrb = resourceManager.getImageObject("images/lifeorb.png");
	imgExplosion = resourceManager.getImageObject("images/explosionSheet.png");
	idAbility["warrior"] = resourceManager.getImageObject("images/warriorAttack.png");
	idAbility["ranger"] = resourceManager.getImageObject("images/rangerSheet.png");
	idAbility["punk"] = resourceManager.getImageObject("images/punkAttack.png");
	idAbility["pacifist"] = resourceManager.getImageObject("images/hippieSheet.png");
	idAbility["mage"] = resourceManager.getImageObject("images/mageSheet.png");
	imgBackground = resourceManager.getImageObject("images/background.png");
	imgHUDFrame = resourceManager.getImageObject("images/hud_framw.png");
	
	sndIntro = resourceManager.getSoundObject("sounds/intro.wav");
	sndMenuVoice = resourceManager.getSoundObject("sounds/menuVoice.wav");
	sndGameover = resourceManager.getSoundObject("sounds/gameover.wav");
	
	sndPacifist = resourceManager.getSoundObject("sounds/hippie.wav");
	sndMage = resourceManager.getSoundObject("sounds/mage.wav");
	sndPunk = resourceManager.getSoundObject("sounds/punk.wav");
	sndRanger = resourceManager.getSoundObject("sounds/ranger.wav");
	sndWarrior = resourceManager.getSoundObject("sounds/warrior.wav");
	
	sndGocart = resourceManager.getSoundObject("sounds/gocart.mp3");
	sndOroboros = resourceManager.getSoundObject("sounds/ouroboros.mp3");
	
	sndGocart.volume = 0.08;
	sndOroboros.volume = 0.2;
	
	sndOroboros.loop = true;
	sndGocart.loop = true;
	
	fisherman = resourceManager.getImageObject("images/fisherman.png");
	backgroundMenu = resourceManager.getImageObject("images/backgroundMenu.png");
	backgroundCredits = resourceManager.getImageObject("images/backgroundCredits.png");
	backgroundGameover = resourceManager.getImageObject("images/backgroundGameover.png");
	bonus = resourceManager.getImageObject("images/bonus.png");

	//console.log(menuVoice);
	// Portraits
	HUD.push_portrait("pacifist","images/hippie_thumb.png");
	HUD.push_portrait("ranger","images/papaco_thumb.png");
	HUD.push_portrait("warrior","images/warrior_thumb.png");
	HUD.push_portrait("punk","images/punk_thumb.png");
	HUD.push_portrait("mage","images/mage_thumb.png");
	
	var currentRoom = -1; // -1 Entrance / 0 Home / 1 Game / 2 Credits / 3 GameOver
	var gameTick = 0;
	var room_score;
	
	
	(function renderGame() {
		window.requestAnimationFrame(renderGame);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		
		if (currentRoom === -1){
			if (gameTick === 0)
				sndIntro.play();
			gameTick++;
			if (gameTick <= 120){
				ctx.globalAlpha = gameTick/120;
				ctx.drawImage(fisherman, 120, 70);
			} else if (gameTick > 120 && gameTick < 270){
				ctx.drawImage(fisherman,120,70);
			}
			
			if (gameTick === 350){
				currentRoom = 0;
				gameTick = 0;
			}
		}
		
		else if (currentRoom === 0){
			if(gameTick === 0){
				gameTick += 1;
				sndMenuVoice.play();
			}
			if (sndMenuVoice.ended === true){
				sndOroboros.play();
			}
			
			ctx.drawImage(backgroundMenu,0,0);
            
            var score_text = "Best Score: " + best_score;
            ctx.fillStyle = "white";
            ctx.font = "10pt Small Fonts";
            ctx.fillText(score_text, 250, 190);
        
			if(pressed[13]){
				gameTick = 0;
				currentRoom = 1;
				sndOroboros.pause();
			} else if(pressed[67]){
				currentRoom = 2;
			}
		}
		
		else if (currentRoom === 1){
			gameTick += 1;
			
			if(gameTick === 2){
				sndGocart.play();
                highscore = false;
			}
			
			if (gameTick === 900){
				Spawner.timerLimit -= 20;
				Player.timeinc += 0.1;
			}
			if (gameTick === 1800){
				Spawner.timerLimit -= 20;
				Player.timeinc += 0.1;
			}
			Background.draw();
			Player.update();
			Spawner.update();
			HUD.draw();
			
			if (Player.breakdownLevel >= 100){
				sndGocart.pause();
				gameTick = 0;
				currentRoom = 3;
			}
		}
		
		else if (currentRoom === 2){
			ctx.drawImage(backgroundCredits,0,0);
			if(pressed[32]){
				currentRoom = 0;
			}
		}
		
		else if (currentRoom === 3){
            //save best score
            if(Player.score > parseInt(best_score)) {
                $.removeCookie('best_score');
                $.cookie('best_score', Player.score, { expires: 7 });
                best_score = Player.score;
                highscore = true;
            }
            
			if (gameTick === 0){
				sndGameover.play();
				console.log(Player.score);
				room_score = Player.score;
				Player.reset();
				Spawner.reset();
			}
			ctx.drawImage(backgroundGameover,0,0);
			
			ctx.fillStyle="#11aa11";
			ctx.font="56px Small Fonts";
			ctx.fillText(room_score, 160,120);
            
            if(highscore) {
                ctx.fillStyle="#11aa11";
                ctx.font="25px Small Fonts";
                ctx.fillText("New Best Score!", 160,155);
            }
			
			if (gameTick > 900){
				ctx.globalAlpha = (gameTick-900)/300;
				ctx.drawImage(bonus,0,0);
			} 
			if(pressed[13] && gameTick > 300){
				gameTick = 0;
				currentRoom = 1;
			}
			else if (pressed[32] && gameTick > 300){
				gameTick = 0;
				currentRoom = 0;
			}
			
			gameTick += 1;
		}
		
	}());
}
// ----------------------------------------------------------
// INIT and UPDATE ------------------------------
var init = function(){
	c=document.getElementById("canvas");
	ctx=c.getContext("2d");
	
	ctx.fillStyle="#000000";
	ctx.font="8px Small Fonts";
	ctx.fillText("loading, please wait", 30, 30);
	
	resourceManager.addImageSource("images/lifeorb.png");
	resourceManager.addImageSource("images/fireball.png");
	resourceManager.addImageSource("images/coldball.png");
	resourceManager.addImageSource("images/orcSheet.png");
	resourceManager.addImageSource("images/arrow.png");
	resourceManager.addImageSource("images/background.png");
	resourceManager.addImageSource("images/hud_framw.png");
	resourceManager.addImageSource("images/hippieSheet.png");
	resourceManager.addImageSource("images/punkSheet.png");
	resourceManager.addImageSource("images/warriorSheet.png");
	resourceManager.addImageSource("images/warriorAttack.png");
	resourceManager.addImageSource("images/rangerSheet.png");
	resourceManager.addImageSource("images/mageSheet.png");
	resourceManager.addImageSource("images/punkAttack.png");
	resourceManager.addImageSource("images/batSheet.png");
	resourceManager.addImageSource("images/koboldSheet.png");
	resourceManager.addImageSource("images/explosionSheet.png");
	resourceManager.addImageSource("images/bonus.png");
	
	resourceManager.addSoundSource("sounds/intro.wav");
	resourceManager.addSoundSource("sounds/menuVoice.wav");
	resourceManager.addSoundSource("sounds/gameover.wav");
	resourceManager.addSoundSource("sounds/hippie.wav");
	resourceManager.addSoundSource("sounds/mage.wav");
	resourceManager.addSoundSource("sounds/punk.wav");
	resourceManager.addSoundSource("sounds/ranger.wav");
	resourceManager.addSoundSource("sounds/warrior.wav");
	resourceManager.addSoundSource("sounds/zoado1.wav");
	resourceManager.addSoundSource("sounds/zoado2.wav");
	resourceManager.addSoundSource("sounds/zoado3.wav");
	resourceManager.addSoundSource("sounds/zoado4.wav");
	resourceManager.addSoundSource("sounds/gocart.mp3");
	resourceManager.addSoundSource("sounds/ouroboros.mp3");
	
	resourceManager.addImageSource("images/fisherman.png");
	resourceManager.addImageSource("images/backgroundMenu.png");
	resourceManager.addImageSource("images/backgroundCredits.png");
	resourceManager.addImageSource("images/backgroundGameover.png");

	
	resourceManager.loadImages(function(){resourceManager.loadSounds(onLoad)});
}