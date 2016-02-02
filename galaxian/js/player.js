/*
 * Player类
 */
//从引擎的Sprite继承
var Player = Shooter.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
		this.life = options.life || 0;
		this.groupID = 0;
		this.targetID = 1;
		this.updateState();
	},
	render:function(ctx){
		ctx.beginPath();
		ctx.translate(this.x,this.y);
		ctx.scale(this.scaleX,this.scaleY);
		ctx.moveTo(0,-27.5);
		ctx.lineTo(-55,22.5);
		ctx.lineTo(-35,42.5);
		ctx.lineTo(-13,22.5);
		ctx.lineTo(13,22.5);
		ctx.lineTo(35,42.5);
		ctx.lineTo(55,22.5);
		ctx.fillStyle = this.color;
		ctx.fill();
	},
	//更新自由移动状态
	updateState:function(){
		var freeState = this.sCtx.get("free");
		var dState = this.sCtx.get("die");
		freeState.update = function(){
			var player  = this.ctx.owner;
			//发射子弹	
			player.createBullet();
			//检测是否碰撞到敌机
			var robj = player.owner.rObjs;
			for(var i=0;i<robj.length;i++){
				if(player.isCalcCollide&&robj[i].isCalcCollide&&(robj[i].targetID==player.groupID)){
					//检测是否碰撞
					if(player.bBox.isCollide(robj[i].bBox)){
						player.onCollide(robj[i]);
						break;
					}
				}
			}
		};
		//修改死亡状态
		dState.enter = function(){
			var o = this.ctx.owner;
			if(--o.life>0){
				o.color = 'red';
			}else{
				o.owner.removeChild(o);
			}
			this.hCount = 5;
		};
		dState.update = function(){
			if(--this.hCount<1){
				this.ctx.owner.color = 'white';
				this.ctx.owner.sCtx.change("free");
			}
		};
	},
	onCollide:function(obj){
		obj.sCtx && obj.sCtx.change("die");
		this.sCtx.change("die");
	}
});