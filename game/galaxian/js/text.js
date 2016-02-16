/*
 * Text类
 */
//从引擎的Sprite继承
var Text = xengine.Sprite.extend({
	init:function(options){
		options || (options = {});
		this._super(options);
	},
	render:function(ctx){
		ctx.translate(this.x,this.y);
		ctx.font = '20px Arial';
		ctx.fillStyle = 'red';
		ctx.fillText('Life:' + this.owner.player.life,-170,0);
		ctx.fillText('Level:' + this.owner.level,-40,0);
		ctx.fillText('Score:' + this.owner.score,100,0);
	}
});