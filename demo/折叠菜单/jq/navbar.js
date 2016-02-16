var NavBar = jutil.Class.create();
jutil.extend(NavBar.prototype,{
  initialize: function(container, options) {
    this.container = $(container);
	this.nodeTitle = this.container.find('.title');
	this.nodeSection = this.container.find('.section');

	this.index = 0;//当前索引
	this.oh = [];//原始高度
	this.currState = [];  //设置当前状态
	this.anim = []; //设置动画
	
	this.icon = {
		arrowUp:"arrow-up.png",
		arrowDown:"arrow-down.png"
	};
	
	//设置默认属性
	var params = {EaseStep:15,Path:"images/"};
	options = jutil.extend(params,options || {});
	
	//滑动持续时间
	this.EaseStep = Math.abs(options.EaseStep);
	//图标地址
	this.Path = options.Path;
	
	for(var n in this.icon){ this.icon[n] = this.Path + this.icon[n]; }
  },
  addAnim:function(o1,o2){
	  this.anim.push([jutil.animation(o1,{easeStep:this.EaseStep}),jutil.animation(o2,{easeStep:this.EaseStep})]);
  },
  Run: function(){
	  this.currState[this.index].buttonWasPressed.call(this);
  },
  FSM:{
	expand:{
		buttonWasPressed:function(){
			var o = this.nodeTitle.eq(this.index);
			o.find('img').attr('src',this.icon.arrowDown);
			o.attr('title','expand');
			
			this.anim[this.index][0].play({height:0});
			this.anim[this.index][1].play({top:-this.oh[this.index],opacity:0});
			this.currState[this.index] = this.FSM.collapse;
		}
	},
	collapse:{
		buttonWasPressed:function(){
			var o = this.nodeTitle.eq(this.index);
			o.find('img').attr('src',this.icon.arrowUp);
			o.attr('title','collapse');
		
			this.anim[this.index][0].play({height:this.oh[this.index]});
			this.anim[this.index][1].play({top:0,opacity:1});
			this.currState[this.index] = this.FSM.expand;
		}
	}
  }
});