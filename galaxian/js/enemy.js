﻿/*
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
		this.posDx = options.posDx || 0;
		this.speed = options.speed || 0;
		this.color = options.color || 'black';
		this.sCtx = new xengine.StateContext(this);
		this.addState();
		this.updateState(this);
		this.sCtx.change("free");
	},
	addState:function(){
		this._super();
		this.sCtx.add(new AttackState("attack", this.sCtx));
		this.sCtx.add(new ReturnState("return", this.sCtx));
	},
	render:function(ctx){
		ctx.beginPath();
		ctx.translate(this.x,this.y);
		ctx.scale(this.scaleX,this.scaleY);
		ctx.moveTo(-30,-60);
		ctx.lineTo(-50,-40);
		ctx.lineTo(-18,0);
		ctx.lineTo(-40,30);
		ctx.lineTo(-20,50);
		ctx.lineTo(0,20);
		ctx.lineTo(20,50);
		ctx.lineTo(40,30);
		ctx.lineTo(17,0);
		ctx.lineTo(50,-40);
		ctx.lineTo(30,-60);
		ctx.lineTo(0,-20);
		ctx.fillStyle = this.color;
		ctx.fill();
	},
	isAttack:function(){
		return this.owner.isAttack && !MathUtil.randInt(0,this.owner.rObjs.length);
	},
	isReturn:function(){
		var hw = this.w * 0.5,
			hh = this.h * 0.5;
		return this.x < -hw || this.x > this.owner.w + hw || this.y < -hh || this.y > this.owner.h + hh;
	},
	isFree:function(){
		return this.x >= this.posX-this.w*0.5 && this.x <= this.posX+this.w*0.5 && this.y >= this.posY-this.h*0.5 && this.y <= this.posY+this.h*0.5;
	},
	moveStep:function(){
		this._super();
		this.posX += this.owner.isXFlip ? this.posDx : -this.posDx;
	},
	//被子弹击中事件
	onCollide:function(bullet){
		this._super(bullet);
	},
	//更新自由移动状态
	updateState:function(e){
		var freeState = this.sCtx.get("free");
		var dState = this.sCtx.get("die");
		freeState.enter = function(){
			e.dx = e.posDx;
			e.dy = 0;
			e.x = e.posX;
			e.y = e.posY;
			this.hCount = 50;
		};
		freeState.change = function(){
			if(--this.hCount < 1){
				if(e.isAttack()){
					e.sCtx.change("attack");
				}else{
					this.hCount = 50;
				}
			}
		};
		freeState.update = function(){
			e.dx = e.owner.isXFlip ? e.posDx : -e.posDx;
			e.moveStep();
		};
		//修改死亡状态
		dState.enter = function(){
			e.owner.removeChild(e);
			++e.owner.score;
			--cfg.enemyNum;
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
		if(this.x<this.w*2||this.x>w-this.w*2){
			this.owner.isXFlip = !this.owner.isXFlip;
			this.dx = -this.dx;
			var eCache = [];
			var obj = this.owner.rObjs;
			for(var i=0,o;o=obj[i++];){
				if(o.groupID==1){
					eCache.push(o.posX);
				}
			}
			if(this.owner.isXFlip){
				this.x = Math.max.apply(Math,eCache);
			}else{
				this.x = Math.min.apply(Math,eCache);
			}
		}
		this.moveStep();
	},
	render:function(ctx){
		ctx.translate(this.x,this.y);
		var hw = this.w * 0.5,
			hh = this.h * 0.5;
		ctx.fillStyle = this.color;
		ctx.fillRect(-hw,-hh,this.w,this.h);
	}
});

//定义进攻状态类
var AttackState = xengine.State.extend({
	enter:function(){
		++this.ctx.owner.zIdx;
		this.ctx.owner.dx = (this.ctx.owner.owner.player.x - this.ctx.owner.x) / this.ctx.owner.speed;
		this.ctx.owner.dy = (this.ctx.owner.owner.player.y - this.ctx.owner.y) / this.ctx.owner.speed;
	},
	change:function(){
		if(this.ctx.owner.isReturn()){
			this.ctx.change("return");
		}
	},
	update:function(){
		//发射子弹
		this.ctx.owner.createBullet();
		this.ctx.owner.moveStep();
	}
});

//定义返回状态类
var ReturnState = xengine.State.extend({
	enter:function(){
		this.ctx.owner.y = 0;	
	},
	change:function(){
		if(this.ctx.owner.isFree()){
			this.ctx.change("free");
		}
	},
	update:function(){
		this.ctx.owner.dx = (this.ctx.owner.posX - this.ctx.owner.x) / (this.ctx.owner.speed * 0.5);
		this.ctx.owner.dy = (this.ctx.owner.posY - this.ctx.owner.y) / (this.ctx.owner.speed * 0.5);
		this.ctx.owner.moveStep();
	}
});