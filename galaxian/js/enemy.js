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
		this.posDx = options.posDx || 0;
		this.color = options.color || 'black';
		this.attackCount = 0;
		this.sCtx = new xengine.StateContext(this);
		this.addState();
		this.updateState(this);
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
		if(this.owner.isAttack && this.attackCount++ == 50){
			this.attackCount = 0;
			return !MathUtil.randInt(0,this.owner.rObjs.length);
		}
		return false;
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
		};
		freeState.change = function(){
			if(e.isAttack()){
				e.sCtx.change("attack");
			}
		};
		freeState.update = function(){
			e.dx = e.owner.isXFlip ? e.posDx : -e.posDx;
			//移动
			e.moveStep();
		};
		//修改死亡状态
		dState.enter = function(){
			e.owner.removeChild(e);
			cfg.enemyNum--;
			cfg.score++;
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
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.w,this.h);
	}
});

//定义进攻状态类
var AttackState = xengine.State.extend({
	enter:function(){
		++this.ctx.owner.zIdx;
		this.ctx.owner.dx = (this.ctx.owner.owner.player.x + this.ctx.owner.w*0.5 - this.ctx.owner.x) / Math.abs(this.ctx.owner.posDx * 30);
		this.ctx.owner.dy = (this.ctx.owner.owner.player.y - this.ctx.owner.y) / Math.abs(this.ctx.owner.posDx * 30);
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
		this.ctx.owner.dx = (this.ctx.owner.posX - this.ctx.owner.x) / Math.abs(this.ctx.owner.posDx * 10);
		this.ctx.owner.dy = (this.ctx.owner.posY - this.ctx.owner.y) / Math.abs(this.ctx.owner.posDx * 10);
		this.ctx.owner.moveStep();
	}
});