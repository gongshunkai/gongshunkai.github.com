/*
 * Text类
 */
//从引擎的RenderObj继承
var Text = xengine.Sprite.extend({
	init:function(){
		this.nowTime = new Date();
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
		this.millisecond = 0;
		this._super();
	},

	render:function(ctx){
		ctx.font = '30px Arial';
		ctx.fillStyle = 'red';
		ctx.fillText('TIME',100,20);
		ctx.fillText(this.hours + ':' + this.minutes + ':' + this.seconds,100,50);
	}
});