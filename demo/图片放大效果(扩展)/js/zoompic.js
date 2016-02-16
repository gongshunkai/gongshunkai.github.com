var ZoomPic = jutil.Class.extend({
	init:function(image,viewer,handle){
		this._image = document.getElementById(image);
		this._viewer = document.getElementById(viewer);
		this._handle = document.getElementById(handle);
		
		this.minLeft = 0;      //缩率图X轴坐标
		this.minTop = 0;       //缩率图Y轴坐标
		this.minWidth = 0;     //缩率图的宽度
		this.minHeight = 0;    //缩率图的高度
		this.maxWidth = 0;     //原始图的宽度
		this.maxHeight = 0;    //原始图的高度
		
		this.setPos();
		this.onevent();
	},
	setPos:function(){
		this._viewer.style.left = (this._image.offsetLeft + this._image.offsetWidth + 10) + "px";
		this._viewer.style.top = this._image.offsetTop + "px";
	},
	onevent:function(){	
		jutil.addEvent(this._image,"mouseover",jutil.bindAsEventListener(this, function(){
			this._handle.style.width = this.calculate('handle','width') + "px";
			this._handle.style.height = this.calculate('handle','height') + "px";
			jutil.addEvent(this._image,"mousemove",this.mousemoveFn());
		}));	
		jutil.addEvent(this._image,"mouseout",jutil.bindAsEventListener(this, function(){
			//jutil.removeEvent(this._image,"mousemove",this.mousemoveFn);
			this._handle.style.visibility = 'hidden';
			this._viewer.style.visibility = 'hidden';
		}));	
	},
	calculate:function(type,property){
		return this.strategies[type][property].call(this);
	},
	strategies:{
		rate:{ //原始图与缩率图的比率
			width:function(){
				return 	this.maxWidth / this._viewer.offsetWidth;
			},
			height:function(){
				return 	this.maxHeight / this._viewer.offsetHeight;
			}
		},
		handle:{ //手柄的宽高
			width:function(){
				return 	this.minWidth / this.calculate('rate','width');
			},
			height:function(){
				return this.minHeight / this.calculate('rate','height');
			}
		}
	},
	mousemoveFn:function(){
		return jutil.bindAsEventListener(this, function(e){
			var x = e.clientX,
				y = e.clientY;		
			
			var handleWidth = this.calculate('handle','width'),
				handleHeight = this.calculate('handle','height'),
				rateWidth = this.calculate('rate','width'),
				rateHeight = this.calculate('rate','height');
			
			var pageScroll = jutil.getPageScroll();
			
			var mxLeft = Math.max(x+pageScroll.x-handleWidth*0.5, this.minLeft),
				mxTop = Math.max(y+pageScroll.y-handleHeight*0.5, this.minTop);
				
			mxLeft = Math.min(this.minWidth-handleWidth+this.minLeft,mxLeft);
			mxTop = Math.min(this.minHeight-handleHeight+this.minTop,mxTop);
			
			this._handle.style.left = mxLeft + "px";
			this._handle.style.top = mxTop + "px";
			
			this._viewer.children[0].style.left =  -(mxLeft-this.minLeft) * rateWidth + "px";
			this._viewer.children[0].style.top = -(mxTop-this.minTop) * rateHeight + "px";
			
			this._handle.style.visibility = 'visible';
			this._viewer.style.visibility = 'visible';
		});	
	}
});

