var cfg = {
	"player":{"w":110,"h":70,"scale":0.4,"tags":[[0,-15,"b3","cb0",10]],"bBox":[15,10]},
	"enemy":{"w":100,"h":120,"scale":0.2,"freeSpeed":2,"attackSpeed":50,"tags":[[0,15,"b3","cb0",15]],"bBox":[10,10]},
	"bullet":{"w":5,"h":15,"speed":10},
	"enemyNum":0,
	"life":3,
	"maxLev":2,
	"level":1,
	"score":0,
	"lev1":[     
		[0,0,0,2,2,0,0,2,2,0,0,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[1,1,1,1,1,1,1,1,1,1,1,1],
		[0,0,1,1,1,1,1,1,1,1,0,0]
	],
	"lev2":[     
		[0,0,0,3,3,0,0,3,3,0,0,0],
		[0,1,1,2,2,1,1,2,2,1,1,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[1,1,1,1,1,1,1,1,1,1,1,1],
		[0,1,1,1,1,0,0,1,1,1,1,0]
	]
};

var Scene = xengine.Scene.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.loadGame();
	},
	//加载游戏
	loadGame:function(){
		this.enemyNum = cfg.enemyNum;
		this.level = cfg.level;
		this.score = cfg.score;
		this.player = null;
		this.layer = null;
		this.menu = null;
		this.restart = null;
		this.bulletPool = [];
		this.isAttack = true;
		this.isXFlip = true;
		this.initFn();
		this.createPlayer();
		this.createEnemy();
		this.createText();
		this.resize();
	},
	initFn:function(){
		this.cbFn = {
			"cb0":this.createBullet,
			"cb1":this.createCirBullet
		};		  
	},
	//创建玩家
	createPlayer:function(){
		var pcfg = cfg.player;
		this.player = new Player({
			scaleX:pcfg.scale,
			scaleY:pcfg.scale,
			w:pcfg.w*pcfg.scale,
			h:pcfg.h*pcfg.scale,
			color:'white',
			life:cfg.life,
			bSpeed:-cfg.bullet.speed,
			tags:pcfg.tags,
			bBox:pcfg.bBox
		});
		this.player.moveTo((this.w-pcfg.w*pcfg.scale/1.5) * 0.5,this.h-pcfg.h*pcfg.scale*2.5);
		this.addChild(this.player);
	},
	//创建敌人
	createEnemy:function(){
		//获取当前级别
		var level = this.level,
			lev = cfg["lev" + level],
			ecfg = cfg.enemy;

		var eOffX = 3;
		var eOffY = 80;
		for (var i = 0; i < lev.length; i++) {
			var eColor = ColorUtil.rgb(MathUtil.randInt(100,255),MathUtil.randInt(100,255),MathUtil.randInt(100,255));
			for (var j = 0; j < lev[i].length; j++) {
				var eData = lev[i][j];
				if (eData > 0) {
					var enemy = new Enemy({
						hp:eData,
						scaleX:ecfg.scale,
						scaleY:ecfg.scale,
						w:ecfg.w*ecfg.scale,
						h:ecfg.h*ecfg.scale,
						color:eColor,
						bSpeed:cfg.bullet.speed,
						tags:ecfg.tags,
						bBox:ecfg.bBox,
						posDx:ecfg.freeSpeed,
						speed:ecfg.attackSpeed
					});
					enemy.moveTo(eOffX*j + j*enemy.w + (this.w-(enemy.w+eOffX)*lev[i].length) * 0.5, eOffY+i*enemy.h);
					enemy.posX = enemy.x;
					enemy.posY = enemy.y;
					++this.enemyNum;
					this.addChild(enemy);
				}
			}
		}
		
		this.layer = new Layer({
			x:(ecfg.w*ecfg.scale+eOffX*2)*lev[0].length,
			y:300,
			w:ecfg.w*ecfg.scale,
			h:ecfg.h*ecfg.scale,
			dx:ecfg.freeSpeed,
			color:'white',
			isVisible:false
		});
		this.addChild(this.layer);
	},
	//创建子弹
	createBullet:function(options){
		var bcfg = cfg.bullet;				 
		var bul = this.bulletPool.shift() || new Bullet(options);
		this.addChild(bul);

		bul.w=bcfg.w;
		bul.h=bcfg.h;
		bul.moveTo(options.x || 0,options.y || 0);
		bul.dx = options.dx || 0;
		bul.dy = options.dy || 0;
	},
	createText:function(){
		var text = new Text({
			x:this.w*0.5,
			y:30		
		});
		this.addChild(text);
	},
	//创建菜单
	createMenu:function(){
		this.menu = new Menu({
			w:this.w,
			h:200,
			x:this.w*0.5,
			y:this.h*0.5,
			color:'rgba(0,0,0,0.8)',
			zIdx:20
		});
		this.addChild(this.menu);
		this.restart = new Restart({
			w:40,
			h:40,
			x:200,
			y:300,
			r:20,
			color:'white',
			zIdx:21
		});
		this.addChild(this.restart);
	}
});