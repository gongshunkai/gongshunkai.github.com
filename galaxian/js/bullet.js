/*
 * Bullet类
 */
//从引擎的Sprite继承
var Bullet = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
		this.attack = options.attack || 1;
		this.targetID = options.targetID || 1;
		this.os = options.os || null;
		this.bBox = new xengine.ABBox(this.x,this.y,this.w*0.5,this.h*0.5);
	},
	update:function(){
		//this.move(this.dx,this.dy);
		//this.offScreenRemove();

		/*for(var i=0;i<cache2.length;i++){
		 if((cache2[i].r / this.r > this.r && parseInt(this.r) > 0) && MathUtil.isInRect(this.x,this.y,this.x+this.w,this.y+this.h,cache2[i].x,cache2[i].y,cache2[i].x+cache2[i].w,cache2[i].y+cache2[i].h)){
		 this.owner.removeChild(this);
		 cache.splice(0,1);
		 cache2[i].owner.removeChild(cache2[i]);
		 cache2.splice(i,1);
		 }
		 }*/



		this._super();
		
		//this.offScreenRemove();
		
		//targets
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
		this._super();
		this.owner.bulletPool.push(this);
	}
});