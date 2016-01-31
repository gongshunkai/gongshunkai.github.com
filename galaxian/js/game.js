var cfg = {
	"player":{"w":110,"h":70,"scale":0.4,"tags":[[19,-15,"b3","cb0",15]],"bBox":[0,0]},
	"enemy":{"w":100,"h":120,"scale":0.2,"speed":2,"tags":[[10,20,"b3","cb0",15]],"bBox":[0,0]},
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
		this.createMenu();
		this.resize();
	},
	initFn:function(){
		this.cbFn = {
			"cb0":this.createBullet,
			"cb1":this.createCirBullet
		};		  
	},
	createPlayer:function(){
		var pcfg = cfg.player;
		this.player = new Player({
			scaleX:pcfg.scale,
			scaleY:pcfg.scale,
			w:pcfg.w*pcfg.scale,
			h:pcfg.h*pcfg.scale,
			color:'white',
			isVisible:true,
			life:cfg.life,
			bSpeed:-cfg.bullet.speed,
			tags:pcfg.tags,
			bBox:pcfg.bBox
		});
		this.player.moveTo((this.w-pcfg.w*pcfg.scale) * 0.5,this.h-pcfg.h*pcfg.scale*2);		
		this.addChild(this.player);
	},
	createEnemy:function(){
		//获取当前级别
		var level = cfg.level,
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
						isVisible:true,
						bSpeed:cfg.bullet.speed,
						tags:ecfg.tags,
						bBox:ecfg.bBox,
						posDx:ecfg.speed
					});
					enemy.moveTo(eOffX*j + j*enemy.w + (this.w-(enemy.w+eOffX)*lev[i].length) * 0.5, eOffY+i*enemy.h);
					enemy.posX = enemy.x;
					enemy.posY = enemy.y;
					++cfg.enemyNum;
					this.addChild(enemy);
				}
			}
		}
		
		this.layer = new Layer({
			x:(ecfg.w*ecfg.scale+eOffX*2)*lev[0].length,
			y:300,
			w:ecfg.w*ecfg.scale,
			h:ecfg.h*ecfg.scale,
			dx:ecfg.speed,
			color:'white'
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
		bul.isVisible = true;
	},
	createText:function(){
		var text = new Text({
			isVisible:true			
		});
		this.addChild(text);
	},
	createMenu:function(){
		this.menu = new Menu({
			w:this.w,
			h:200,
			x:0,
			y:this.h*0.5-200*0.5,
			color:'rgba(0,0,0,0.8)',
			zIdx:20,
			isVisible:false
		});
		this.addChild(this.menu);
		this.restart = new Restart({
			w:40,
			h:40,
			x:200,
			y:300,
			r:20,
			color:'white',
			zIdx:21,
			isVisible:false
		});
		this.addChild(this.restart);
	}
});