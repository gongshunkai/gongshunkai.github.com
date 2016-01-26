/*
 * Enemy类
 */
//从引擎的Sprite继承
var Enemy = Shooter.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.hp = options.hp || 1;
		this.posX = options.posX || 0;
		this.posY = options.posY || 0;
		this.targetX = options.targetX || 0;
		this.targetY = options.targetY || 0;
		this.color = options.color || 'black';
		this.sCtx = new xengine.StateContext(this);
		this.addState();
		this.updateState();
		this.sCtx.change("free");
	},
	addState:function(){
		this._super();
		this.sCtx.add(new AttackState("attack", this.sCtx));
		this.sCtx.add(new RestoreState("restore", this.sCtx));
	},
	render:function(ctx){
		ctx.beginPath();
		ctx.translate(this.x,this.y);
		ctx.scale(this.scaleX,this.scaleY);
		ctx.moveTo(20,0);
		ctx.lineTo(0,20);
		ctx.lineTo(32,60);
		ctx.lineTo(10,90);
		ctx.lineTo(30,110);
		ctx.lineTo(50,80);
		ctx.lineTo(70,110);
		ctx.lineTo(90,90);
		ctx.lineTo(67,60);
		ctx.lineTo(100,20);
		ctx.lineTo(80,0);
		ctx.lineTo(50,40);
		ctx.fillStyle = this.color;
		ctx.fill();
	},
	isAttack:function(){
		return this.attack;
	},
	isRestore:function(){
		var hw = this.w * 0.5,
			hh = this.h * 0.5;
		return this.x < -hw || this.x > this.owner.w + hw || this.y < -hh || this.y > this.owner.h + hh
	},
	isRun:function(){
		var x = parseInt(this.x);
		var y = parseInt(this.y);
		return x*1.5 >= this.posX && x+this.w*-1.5 <= this.posX+this.w && y*1.5 >= this.posY && y+this.h*-1.5 <= this.posY+this.h;
	},
	isCollide:function(){
		/*for(var i=0;i<cache.length;i++){
			if(MathUtil.isInRect(this.x,this.y,this.x+this.w,this.y+this.h,cache[i].x,cache[i].y,cache[i].x+cache[i].w,cache[i].y+cache[i].h)){
				cache[i].owner.removeChild(cache[i]);
				cache.splice(i,1);
				--this.lev;
				return true;
			}
		}
		if(MathUtil.isInRect(this.x,this.y,this.x+this.w,this.y+this.h,_player.x,_player.y,_player.x+_player.w,_player.y+_player.h)){
			_player.owner.removeChild(_player);
			return true;
		}
		return false;*/
	},
	moveStep:function(){
		
		this._super();
		this.posX += this.dx;
	},
	//被子弹击中事件
	onCollide:function(bullet){
		/*if(this.getAnim("hurt")!=null){
			this.setCAnim("hurt");
			this.hCount = 5;
		}
		this._super(bullet);*/
	},
	//更新自由移动状态
	updateState:function(){
		var freeState = this.sCtx.get("free");
		var dState = this.sCtx.get("die");
		freeState.enter = function(){
			var e = this.ctx.owner;
			e.dx = 0.2;
			e.dy = 0;
			e.x = e.posX;
			e.y = e.posY;
		};
		freeState.update = function(){
			var e = this.ctx.owner;
			e.dx = e.owner.isXFlip ? 0.2 : -0.2;
			//移动
			e.moveStep();
		};
		//修改死亡状态
		dState.enter = function(){
			var o = this.ctx.owner;
			//加分
			if(o.groupID == 1){
				cfg.score+=o.score;
			}		  
			var ox = o.x,oy = o.y;
			//创建爆破效果
			o.owner.createBoom(o.x,o.y,function(){
				//死亡后奖励
				if(o.gCfg.rw!=null){
					var rw = o.owner.createRObj(Reward.ClassName,[ShootGame.cfg.sDef[o.gCfg.rw]]);
					rw.moveTo(ox,oy);
				}
			});
			o.owner.removeRObj(o);
		};
	}
});

/*
 * Layer类
 */
//从引擎的Sprite继承
var Layer = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
	},
	update:function(){
		var w = this.owner.w;
		//到达边界改变速度方向
		if(this.x<this.w||this.x>w-this.w*2){
			this.owner.isXFlip = !this.owner.isXFlip;
			this.dx = -this.dx;
			var eCache = [];
			var obj = this.owner.rObjs;
			for(var i=0,o;o=obj[i++];){
				if(o.groupID!=1){ continue; }
				eCache.push(o.posX);
			}
			if(this.owner.isXFlip){
				this.x = Math.min.apply(Math,eCache);
			}else{
				this.x = Math.max.apply(Math,eCache);
			}
		}
		this.moveStep();
	},
	render:function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.w,this.h);
	}
});

//定义进攻状态类
var AttackState = xengine.State.extend({
	timer:new Date(),
	enter:function(){
		++this.ctx.owner.zIdx;
		this.ctx.owner.dx = (this.ctx.owner.targetX - this.ctx.owner.x) / 300;
		this.ctx.owner.dy = (this.ctx.owner.targetY - this.ctx.owner.y) / 300;
	},
	change:function(){
		if(this.ctx.owner.isRestore()){
			this.ctx.change("restore");
		}
		if(this.ctx.owner.isCollide() && this.ctx.owner.lev < 1){
			this.ctx.change("die");
		}
	},
	update:function(){
		//发射子弹
		this.ctx.owner.createBullet();
		this.ctx.owner.moveStep();
	}
});

//定义返回队列状态类
var RestoreState = xengine.State.extend({
	enter:function(){
		this.ctx.owner.attack = false;
		this.ctx.owner.y = 0;	
	},
	change:function(){
		if(this.ctx.owner.isRun()){
			this.ctx.change("free");
		}
		if(this.ctx.owner.isCollide() && this.ctx.owner.lev < 1){
			this.ctx.change("die");
		}
	},
	update:function(){
		this.ctx.owner.dx = (this.ctx.owner.posX - this.ctx.owner.x) / 150;
		this.ctx.owner.dy = (this.ctx.owner.posY - this.ctx.owner.y) / 150;
		this.ctx.owner.moveStep();
	}
});