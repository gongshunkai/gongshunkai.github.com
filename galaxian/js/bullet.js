/*
 * Bullet类
 */
//从引擎的Sprite继承
var Bullet = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
		this.attack = options.attack || 0;
		this.targetID = options.targetID || 0;
		this.os = options.os || null;
		this.bBox = new xengine.ABBox(this.x,this.y,this.w,this.h);
	},
	update:function(){
		this._super();

		var robj = this.owner.rObjs;
		for(var i=0;i<robj.length;i++){
			if(this!==robj[i]&&this.os!==robj[i]&&robj[i].isCalcCollide&&robj[i].groupID==this.targetID){
				//检测是否碰撞		
				if(this.bBox.isCollide(robj[i].bBox)){
					robj[i].onCollide(this);
					this.owner.removeChild(this);
					this.owner.bulletPool.push(this);
					return;
				}
			}
		}
	},
	render:function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.w,this.h);
	},
	offScreenRemove:function(){
		var hw = this.w * 0.5,
			hh = this.h * 0.5;
		if(this.x < -hw || this.x > this.owner.w + hw || this.y < -hh || this.y > this.owner.h + hh){
			this.owner.removeChild(this);
			this.owner.bulletPool.push(this);
		}	
	}
});