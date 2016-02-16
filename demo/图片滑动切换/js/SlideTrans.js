var SlideTrans = jutil.Class.create();
jutil.extend(SlideTrans.prototype,{
	initialize:function(container, slider, count, options){
		this._slider = document.getElementById(slider);
		this._container = document.getElementById(container);//容器对象
		this._timer = null;//定时器
		this._count = Math.abs(count);//切换数量
		this._target = 0;//目标值
		
		
		this.Index = 0;//当前索引
		
		//设置默认属性
		var params = {Vertical:true,Auto:true,Change:0,Duration:30,Time:10,Pause:3000,onStart:function(){},onFinish:function(){},Tween:jutil.Tween.Quart.easeOut};
		options = jutil.extend(params,options || {});
		
		//是否垂直方向（方向不能改）
		this.Vertical = !!options.Vertical;
		//是否自动
		this.Auto = !!options.Auto;
		//滑动持续时间
		this.Duration = Math.abs(options.Duration);
		//滑动延时
		this.Time = Math.abs(options.Time);
		//停顿时间(Auto为true时有效)
		this.Pause = Math.abs(options.Pause);
		//tween算子
		this.Tween = options.Tween;
		//开始转换时执行
		this.onStart = options.onStart;
		//完成转换时执行
		this.onFinish = options.onFinish;
		
		//样式设置
		var p = jutil.currentStyle(this._container).position;
		p == "relative" || p == "absolute" || (this._container.style.position = "relative");
		this._container.style.overflow = "hidden";
		this._slider.style.position = "absolute";
		
		//改变量
		this.Change = options.Change ? options.Change :
			this._slider[this.Vertical ? "offsetHeight" : "offsetWidth"] / this._count;
			
		this.anim = jutil.animation(this._slider,{runTime:this.Time,easeStep:this.Duration,tween:this.Tween});
	},
	//开始切换
	Run: function(index) {
		//修正index
		index == undefined && (index = this.Index);
		index < 0 && (index = this._count - 1) || index >= this._count && (index = 0);
		//设置参数
		this._target = -Math.abs(this.Change) * (this.Index = index);
		
		this.onStart();
		this.Move();
	},
	//移动
	Move: function() {
		this.anim.play(this.Vertical ? {top:this._target} : {left:this._target},jutil.bind(this,function(){
			if(this.Auto){
				clearTimeout(this._timer);
				this._timer = setTimeout(jutil.bind(this, this.Next), this.Pause);
			}
		}));
	},
	//下一个
	Next: function() {
		this.Run(++this.Index);
	},
	//上一个
	Previous: function() {
		this.Run(--this.Index);
	}
});