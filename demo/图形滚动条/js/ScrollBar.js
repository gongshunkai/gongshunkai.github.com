//滚动条高度计算公式：滚动条轨道高度 * 可见区域高度 / 内容区域高度
//内容区域与滚动条轨道的比例：(内容区域高度 - 可见区域高度) / (滚动条轨道高度 - 滚动条高度)
var ScrollBar = jutil.Class.create();
jutil.extend(ScrollBar.prototype,{
	initialize: function(container,track,handle,options) {
	
	this.Container = document.getElementById(container);
	this.Track = document.getElementById(track);
	this.Handle = document.getElementById(handle);
	
	this.timer = null;
	this.auto = true;//是否自动
	this.curPos = 0;//记录对象的位置

	//设置默认属性
	var params = {WheelSpeed:5,Vertical:true,RunTime:10,RunStep:5,Ease:true,EaseStep:30,Tween:jutil.Tween.Quart.easeOut,HandleHeight:30,onMove:function(){}};
	options = jutil.extend(params,options || {});
	
	//鼠标滚轮速度,越大越快(0则取消鼠标滚轮控制)
	this.WheelSpeed = Math.max(0, options.WheelSpeed);
	//是否垂直滑动
	this.Vertical = !!options.Vertical;
	//自动滑移的延时时间,越大越慢
	this.RunTime = Math.max(1, options.RunTime);
	//自动滑移每次滑动的百分比
	this.RunStep = Math.max(1, options.RunStep);
	//是否缓动
	this.Ease = !!options.Ease;
	//缓动等级,越大越慢
	this.EaseStep = Math.max(1, options.EaseStep);
	//tween算子
	this.Tween = options.Tween;
	//滚动条高度
	this.HandleHeight = Math.max(10,options.HandleHeight);
	//滑动时执行
	this.onMove = options.onMove;

	this.track_height = this.Track.offsetHeight;
	this.Handle.style.height = (this.HandleHeight >= this.track_height ? 0 : this.HandleHeight) + "px";
	this.handle_height = this.Handle.offsetHeight;
	
	jutil.drag(this.Handle,{ limit:true,mxContainer:this.Track,lockX:true,onMove:jutil.bind(this,function(){
		this.GetPos(this.Handle.offsetTop);
	})});
	jutil.addEvent(this.Track, "mousedown", jutil.bindAsEventListener(this, function(e){ this.ClickCtrl(e);}));
	this.addAnim();
  },
  addAnim:function(){
	  this.anim = [
	  	jutil.animation(this.Container,{runTime:this.RunTime,ease:this.Ease,easeStep:this.EaseStep,tween:this.Tween}),
		jutil.animation(this.Handle,{runTime:this.RunTime,ease:this.Ease,easeStep:this.EaseStep,tween:this.Tween})
	  ];
  },
  ClickCtrl:function(e){
	  if(e.clientY - this.Track.offsetTop < this.Handle.offsetTop || e.clientY - this.Track.offsetTop > this.Handle.offsetTop + this.handle_height){
	  	this.ScrollBy(e.clientY - this.Track.offsetTop > this.Handle.offsetTop ? this.handle_height : -this.handle_height);
	  }
  },
  WheelCtrl:function(e){
	  e.preventDefault();
	  e.stopPropagation();
		
	  this.ScrollBy(this.WheelSpeed * e.delta);	 
  },
  Moving:function(){ 
	  if(this.auto){
		  clearTimeout(this.timer);
		  this.ScrollBy(this.RunStep);
		  setTimeout(jutil.bind(this,this.Moving),this.RunTime);
	  }
  },
  GetPos:function(num){
	  var top = Math.max(num,0);
	  var bottom = Math.min(top,this.track_height - this.handle_height);
	  var pos = Math.min(top,bottom);	  

	  this.curPos = pos;
	  this.onMove();
	  
	  return pos;
  },
  GetValue:function(totleHeight,viewHeight){
	  var ratio = Math.max((totleHeight - viewHeight) / (this.track_height - this.handle_height),0);
	  return -(ratio * this.curPos) + "px";
  },
  ScrollTo:function(num){ 
	  var pos = this.GetPos(num);
	  this.anim[1].play(this.Vertical ? {"top":pos} : {"left":pos});  
  },
  ScrollBy:function(num){
	  var pos = this.GetPos(this.curPos += num);
	  this.anim[1].play(this.Vertical ? {"top":pos} : {"left":pos});
  }
});