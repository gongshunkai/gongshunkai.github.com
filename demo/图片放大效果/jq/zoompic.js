var ZoomPic = jutil.Class.extend({
	init:function(image,viewer,handle){
		this._image = $(image);
		this._viewer = $(viewer);
		this._handle = $(handle);
		
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
		this._viewer.css('left',this._image.position().left + this._image.width() + 10);
		this._viewer.css('top',this._image.position().top);
	},
	onevent:function(){
		this._image.on('mouseover',jutil.bind(this,function(){
			this._handle.css('width',this.calculate('handle','width'));
			this._handle.css('height',this.calculate('handle','height'));
			this._image.on('mousemove',this.mousemoveFn());
		}));
		this._image.on('mouseout',jutil.bind(this,function(){
			//this._image.unbind('mousemove');
			this._handle.css('visibility','hidden');
			this._viewer.css('visibility','hidden');
		}));
	},
	calculate:function(type,property){
		return this.strategies[type][property].call(this);
	},
	strategies:{
		rate:{ //原始图与缩率图的比率
			width:function(){
				return 	this.maxWidth / this._viewer.width();
			},
			height:function(){
				return 	this.maxHeight / this._viewer.height();
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
		return jutil.bind(this, function(e){
			var x = e.clientX,
				y = e.clientY;		
			
			var handleWidth = this.calculate('handle','width'),
				handleHeight = this.calculate('handle','height'),
				rateWidth = this.calculate('rate','width'),
				rateHeight = this.calculate('rate','height');
			
			var mxLeft = Math.max(x+$(document).scrollLeft()-handleWidth*0.5, this.minLeft),
				mxTop = Math.max(y+$(document).scrollTop()-handleHeight*0.5, this.minTop);
				
			mxLeft = Math.min(this.minWidth-handleWidth+this.minLeft,mxLeft);
			mxTop = Math.min(this.minHeight-handleHeight+this.minTop,mxTop);
			
			this._handle.css('left',mxLeft);
			this._handle.css('top',mxTop);
			
			this._viewer.children().css('left',-(mxLeft-this.minLeft) * rateWidth);
			this._viewer.children().css('top',-(mxTop-this.minTop) * rateHeight);
			
			this._handle.css('visibility','visible');
			this._viewer.css('visibility','visible');
		});	
	}
});

