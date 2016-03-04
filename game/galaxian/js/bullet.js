/*
 * Bullet类
 */
//从引擎的Sprite继承
var Bullet = xengine.Sprite.extend({
	init:function(options){
		var params = {color:'black',attack:1,targetID:1,os:null};
		options = xengine.$.extend(params, options || {});

		this._super(options);
		this.color = options.color;
		this.attack = Math.max(1,options.attack);
		this.targetID = options.targetID;
		this.os = options.os;
		this.bBox = new xengine.ABBox(this.x,this.y,this.w*0.5,this.h*0.5);
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
		ctx.translate(this.x,this.y);
		var hw = 0.5 * this.w,
			hh = 0.5 * this.h;
		ctx.fillStyle = this.color;
		ctx.fillRect(-hw,-hh,this.w,this.h);
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