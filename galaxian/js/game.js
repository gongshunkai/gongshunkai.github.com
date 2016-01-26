var cfg = {
	"player":{"w":110,"h":70,"scale":0.4,"tags":[[19,-15,"b3","cb0",90]],"bBox":[17,24]},
	"enemy":{"w":100,"h":120,"scale":0.2,"speed":0.2,"tags":[[10,20,"b3","cb0",100]],"bBox":[17,24]},
	"bullet":{"w":5,"h":15,"speed":2},
	"enemyNum":0,
	"life":1,
	"hp":1,
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
		this.bulletPool = [];
		this.isXFlip = true;
		this.initFn();
		this.createPlayer();
		this.createEnemy();
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
			life:cfg.life,
			hp:cfg.hp,
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
						bSpeed:cfg.bullet.speed,
						tags:ecfg.tags,
						bBox:ecfg.bBox
					});
					enemy.moveTo(eOffX*j + j*enemy.w + (this.w-(enemy.w+eOffX)*lev[i].length) * 0.5, eOffY+i*enemy.h);
					enemy.posX = enemy.x;
					enemy.posY = enemy.y;
					++cfg.enemyNum;
					this.addChild(enemy);
				}
			}
		}
		
		var layer = new Layer({
			x:(ecfg.w*ecfg.scale+eOffX*2)*lev[0].length,
			y:300,
			w:ecfg.w*ecfg.scale,
			h:ecfg.h*ecfg.scale,
			dx:ecfg.speed,
			color:'white'
		});
		this.addChild(layer);
	},
	//创建子弹
	createBullet:function(options){
		options || (options = {});
		var bcfg = cfg.bullet;				 
		var bul = this.bulletPool.shift() || new Bullet();
		this.addChild(bul);

		bul.w=bcfg.w;
		bul.h=bcfg.h;
		bul.moveTo(options.x || 0,options.y || 0);
		bul.dx = options.dx || 0;
		bul.dy = options.dy || 0;
		bul.color=options.color || 'black';
	}
});





/*var Galaxian = xengine.Class.extend({
	init:function(){
		var Scene = xengine.Scene.extend({
			init:function(options){
				options || (options = {});
				this._super(options);
				
				var pcfg = cfg.player;
				var player = new Player({
					scaleX:pcfg.scale,
					scaleY:pcfg.scale,
					w:pcfg.w*pcfg.scale,
					h:pcfg.h*pcfg.scale,
					color:'white',
					life:cfg.life,
					hp:cfg.hp
				});
				player.moveTo((sc.w-pcfg.w*pcfg.scale) * 0.5,sc.h-pcfg.h*pcfg.scale*0.5);
				
				this.addChild(player);
				_player = player;
			}
		});
		var sc = new Scene({w:400,h:500});
		xengine.director.runScene(sc);
	},
	loadLevel:function(sc){
		 var self = this

		//根据配置数据创建敌人
        function createEnemy(sc) {
			//获取当前级别
            var lev = self.cfg.level,
                cfg = self.cfg["lev" + lev],
                ecfg = self.cfg.enemy;
	
			var eOffX = 3;
            var eOffY = 80;
            for (var i = 0; i < cfg.length; i++) {
				var eColor = ColorUtil.rgb(MathUtil.randInt(100,255),MathUtil.randInt(100,255),MathUtil.randInt(100,255));
                for (var j = 0; j < cfg[i].length; j++) {
                    var eData = cfg[i][j];
                    if (eData > 0) {
                        var enemy = new Enemy({
							hp:eData,
							scaleX:ecfg.scale,
							scaleY:ecfg.scale,
							w:ecfg.w*ecfg.scale,
							h:ecfg.h*ecfg.scale,
							color:eColor
						});
                        enemy.moveTo(eOffX*j + j*enemy.w + (sc.w-(enemy.w+eOffX)*cfg[i].length) * 0.5, eOffY+i*enemy.h);
						enemy.posX = enemy.x;
						enemy.posY = enemy.y;
                        ++self.cfg.enemyNum;
						sc.addChild(enemy);
                    }
                }
            }
			
			var layer = new Layer({
				x:(ecfg.w*ecfg.scale+eOffX*2)*cfg[0].length,
				y:300,
				w:ecfg.w*ecfg.scale,
				h:ecfg.h*ecfg.scale,
				color:'white'
			});
			sc.addChild(layer);
        }

		//创建敌人
        createEnemy(sc);
		//复位游戏
        //this.resetGame();
	},
	//创建子弹
	createBullet:function(x,y,bClass,param){
		var bul = new Bullet(
							 
							 
							 
		var bul = cache.shift() || new Bullet();
		sc.addChild(b);
		
		b.x=player.x+player.w*0.5-2.5;
		b.y=player.y-player.h;
		b.w=5;
		b.h=15;
		b.dx = 0;
		b.dy = -3;
		b.color='white';
		cache.push(b);
		
		
		
		
		bul.moveTo(x,y);
		bul.dx = param.dx;
		bul.dy = param.dy;
	}
});*/