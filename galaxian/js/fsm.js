/*
 * 状态机类
 */
 
var RunState = xengine.State.extend({
	enter:function(){
		this.ctx.owner.dx = 0.2;
		this.ctx.owner.dy = 0;
		this.ctx.owner.x = this.ctx.owner.posX;
		this.ctx.owner.y = this.ctx.owner.posY;
	},
	change:function(){
		if(this.ctx.owner.isAttack()){
			this.ctx.change("goAttack");
		}
		if(this.ctx.owner.isCollide() && this.ctx.owner.lev < 1){	
			this.ctx.change("goDear");
		}
	},
	update:function(){
		this.ctx.owner.dx = isXFlip ? 0.2 : -0.2;
		this.ctx.owner.moveStep();
	}
});
var AttackState = xengine.State.extend({
	timer:new Date(),
	enter:function(){
		this.timer = new Date();
		++this.ctx.owner.zIdx;
		this.ctx.owner.dx = (this.ctx.owner.targetX - this.ctx.owner.x) / 300;
		this.ctx.owner.dy = (this.ctx.owner.targetY - this.ctx.owner.y) / 300;
		
		var self = this;
		setTimeout(function(){
			var b = new Bullet();
			self.ctx.owner.owner.addChild(b);
		
			b.x=self.ctx.owner.x+self.ctx.owner.w*0.5-2.5;
			b.y=self.ctx.owner.y+self.ctx.owner.h;
			b.w=5;
			b.h=15;
			b.dx = 0;
			b.dy = 2;
			b.color=self.ctx.owner.color;
		},500);
	},
	change:function(){
		if(this.ctx.owner.isRestore()){
			this.ctx.change("goRestore");
		}
		if(this.ctx.owner.isCollide() && this.ctx.owner.lev < 1){
			this.ctx.change("goDear");
		}
	},
	update:function(){
		if(xengine.FrameState.curTime-this.timer > 500){
			
		}
		this.ctx.owner.moveStep();
	}
});
var RestoreState = xengine.State.extend({
	enter:function(){
		this.ctx.owner.attack = false;
		this.ctx.owner.y = 0;
		
	},
	change:function(){
		if(this.ctx.owner.isRun()){
			this.ctx.change("goRun");
		}
		if(this.ctx.owner.isCollide() && this.ctx.owner.lev < 1){
			this.ctx.change("goDear");
		}
	},
	update:function(){
		this.ctx.owner.dx = (this.ctx.owner.posX - this.ctx.owner.x) / 150;
		this.ctx.owner.dy = (this.ctx.owner.posY - this.ctx.owner.y) / 150;
		this.ctx.owner.moveStep();
	}
});
var DearState = xengine.State.extend({
	enter:function(){
		this.ctx.owner.owner.removeChild(this.ctx.owner);
	},
	change:function(){
		return;
	},
	update:function(){
		
	}
});