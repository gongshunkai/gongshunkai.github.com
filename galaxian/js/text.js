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
		ctx.font = '20px Arial';
		ctx.fillStyle = 'red';
		ctx.fillText('Life:' + this.owner.player.life,20,30);
		ctx.fillText('Level:' + cfg.level,160,30);
		ctx.fillText('Score:' + cfg.score,300,30);
	}
});