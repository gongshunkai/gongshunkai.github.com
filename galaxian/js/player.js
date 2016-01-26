/*
 * Player类
 */
//从引擎的Sprite继承
var Player = Shooter.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
		this.hp = options.hp || 1;
		this.life = options.life || 1;
		this.groupID = 0;
		this.targetID = 1;
		this.updateState();
	},
	render:function(ctx){
		ctx.beginPath();
		ctx.translate(this.x,this.y);
		ctx.scale(this.scaleX,this.scaleY);
		ctx.moveTo(55,0);
		ctx.lineTo(0,50);
		ctx.lineTo(20,70);
		ctx.lineTo(42,50);
		ctx.lineTo(68,50);
		ctx.lineTo(90,70);
		ctx.lineTo(110,50);
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
				if(player.isCalcCollide&&robj[i].isCalcCollide&&(robj[i].targetID==player.groupID||robj[i].groupID==2)){
					//检测是否碰撞
					if(player.bBox.isCollide(robj[i].bBox)){
						player.onCollide(robj[i]);
						robj[i].onCollide(player);
						break;
					}
				}
			}
		};
		//修改死亡状态
		dState.enter = function(){
			var o = this.ctx.owner;
			if(--o.life>0){
				o.isVisible = false;
				o.owner.createBoom(o.x,o.y,function(){
					o.sCtx.change("free");
				});
			}else{
				o.owner.isOver = true;
			}
		};
	}
});