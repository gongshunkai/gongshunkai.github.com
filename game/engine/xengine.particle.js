/*!
 * xengine.particle plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏粒子效果类
 */
(function(root,xengine){
	xengine.$.extend(xengine, {
		//粒子发生器
		Emit:xengine.Class.extend({
			init:function(options,scene,sprite){
				var params = {speed:100,times:-1,lifeRange:[500,800],sSize:1,eSize:1,timeRange:999999,maxNum:200,pos:[0,0],v:[0,0],vRange:[0,0],a:[0,0],aRange:[0,0],ang:0,angRange:0};
				options = xengine.$.extend(params, options || {});

				//喷射间隔时间
				this.speed = Math.max(1,options.speed);
				//喷射次数,<0表示无限
				this.times = parseInt(options.times);
				//设定生命周期
				this.lifeRange = options.lifeRange;
				this.sSize = Math.max(1,options.sSize);
				this.eSize = Math.max(1,options.eSize);
				this.timeRange = parseInt(options.timeRange);
				this.maxNum = Math.max(1,options.maxNum);
				this.pos =  options.pos;
				this.v = options.v;
				this.vRange = options.vRange;
				this.a = options.a;
				this.aRange = options.aRange;
				this.ang = parseInt(options.ang);
				this.angRange =parseInt(options.angRange);
				this.scene = scene;
				this.sprite = sprite;
				this.startTime = xengine.FrameState.curTime;
			},
			createParticle:function(){
				for(var i=0;i<this.maxNum;i++){
					var o = this.sprite;
					this.scene.addChild(o);
					o.life = xengine.fn.MathUtil.randInt(this.lifeRange[0],this.lifeRange[1]);
					o.sSize = this.sSize;
					o.eSize = this.eSize;
					o.x = this.pos[0];
					o.y = this.pos[1];
					o.vx = this.a[0]+xengine.fn.MathUtil.randRange(this.aRange[0]);
					o.vy = this.a[1]+xengine.fn.MathUtil.randRange(this.aRange[1]);
					o.dx = this.v[0]+xengine.fn.MathUtil.randRange(this.vRange[0]);
					o.dy = this.v[1]+xengine.fn.MathUtil.randRange(this.vRange[1]);
					o.deg = this.ang+xengine.fn.MathUtil.randRange(this.angRange);
					o.start();
				}
			},
			//发射
			jet:function(){
				this.startTime = xengine.FrameState.curTime;
				this.createParticle();
			},
			//可放在游戏循环中更新
			update:function(){
				if((this.times!=0)&&(xengine.FrameState.curTime-this.startTime>this.speed)){
					this.jet();
				}
				if(this.times>0)--this.times;
			}
		}),
		//从引擎的Sprite继承
		Particle:xengine.Sprite.extend({
			init:function(options){
				//生命毫秒
				this.life = 500;
				//年龄
				this.age = 0 ;
				//开始时间
				this.sTime = 0 ;
				//初始大小
				this.sSize = 1;
				//结束大小
				this.eSize = 1;
				//是否激活
				this.active = false;
				this._super(options);
				this.isVisible = this.active;
			},
			start:function(){
				this.sTime = xengine.FrameState.curTime;
				this.active = this.isVisible = true;
			},
			stop:function(){
				this.active = this.isVisible = false;
				this.age = 0;
			},
			update:function(){
				if(this.active){
					this.age = xengine.FrameState.curTime - this.sTime;
					if(this.age>=this.life){
						this.owner.removeChild(this);
						return ;
					}
					this._super();
				}
			}
		})
	});
})(this,xengine);
