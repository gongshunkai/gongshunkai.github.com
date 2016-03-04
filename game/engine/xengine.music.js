/*!
 * xengine.music plugin
 * By xiangfeng
 * Please contact to xiangfenglf@163.com if you hava any question
 * xengine 游戏音乐类
 */
(function(root,xengine){
	xengine.$.extend(xengine, {
		Music:xengine.Class.extend({
			init:function(){
				//associate html Element
				this.hE = null;
				this.autoPlay = false;
				this.isLooped = true;
				this.time = 0;
				this.eType = "music";
				//index in pool ,if it is from pool;
				this.poolIdx = -1;
				// released to pool
				this.isReleased = true;
			},
			play:function(immeFlag,looped,time){
				var lp = !!looped,
					f = !!immeFlag;
				if(f){
					this.stop();
				}
				try{
					if(lp){
						this.hE.loop="loop";
					}
					this.hE.play();
				}
				catch (err){}
			},
			setStartTime:function(time){
				this.hE.currentTime = time;
			},
			pause:function(){
				this.hE.pause();
			},
			stop:function(){
				try{
					this.pause();
					this.setStartTime(0);
				}
				catch (err){}
			},
			reset:function(){
				this.stop();
			},
			loadFromFile:function(fileURL){
				if(!this.isLoaded){
					var hE = xengine.$("<audio></audio>")[0];
					hE.src=fileURL;
					this.hE = hE;
					this.src = fileURL;
					this.isLoaded = true;
				}
			}
		})
	});
})(this,xengine);
