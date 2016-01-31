/*
 * Menu类
 */
//从引擎的Sprite继承
var Menu = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
	},
	render:function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.w,this.h);
		ctx.font = '30px Arial';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('Score:' + cfg.score,200,200);
		ctx.fillText('Game Over',200,250);
		
	}
});

var Restart = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
		this.color = options.color || 'black';
		this.r = options.r || 0;
	},
	render:function(ctx){
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.r,0,360*Math.PI/180,true);
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.r*0.5,0,280*Math.PI/180,false);
		ctx.stroke();
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.moveTo(198,284);
		ctx.lineTo(205,291);
		ctx.lineTo(197,296);
		ctx.fill();
	/*	ctx.translate(this.x,this.y);
		var hw = 0,
			hh = 0;
		ctx.fillStyle = 'white';
		ctx.beginPath();
		ctx.arc(-hw,-hh,this.r,0,360*Math.PI/180,true);
		ctx.fill();*/
	}
});