var SliderBox = jutil.Class.extend({
	init:function(container,options){
		this.box = document.getElementById(container);
		this.ul = this.box.querySelector('ul');
		this.li = this.box.getElementsByTagName('li');
		this.ulRange = 0, liRange = 0, liNum = 0; 
		this.currState = this.FSM.on;  //设置当前状态
		this.anim = jutil.animation(this.ul);
		
		var params = {Vertical:true};
		options = jutil.extend(params,options || {});
		
		this.vertical = !!options.Vertical;
		
		for(var i=0,o;o=this.li[i++];){
			if(this.vertical){
				this.ulRange += o.offsetHeight + parseFloat(jutil.currentStyle(o)["marginTop"]) + parseFloat(jutil.currentStyle(o)["marginBottom"]);
			}else{
				this.ulRange += o.offsetWidth + parseFloat(jutil.currentStyle(o)["marginLeft"]) + parseFloat(jutil.currentStyle(o)["marginRight"]);
			}
		}
		
		this.ul.style[this.vertical ? 'height' : 'width'] = this.ulRange + "px";
		this.liRange = this.ulRange / this.li.length;//计算li的宽度（包含外边距）
		this.liNum = (this.box[this.vertical ? 'offsetHeight' : 'offsetWidth'] / this.liRange).toFixed(0); //计算可见区域li的个数
	},
	FSM:{
		off:{
			buttonLeft:function(){
				console.log('动画在运行中，点击无效');
			},
			buttonRight:function(){
				console.log('动画在运行中，点击无效');
			}		
		},
		on:{
			buttonLeft:function(){
				var pos = this.ul[this.vertical ? 'offsetTop' : 'offsetLeft'];
				pos = Math.min(0,pos+this.liRange);
				
				this.currState = this.FSM.off;
				this.anim.play(this.vertical ? {top:pos + 'px'} : {left:pos + 'px'},jutil.bind(this,function(){
					this.currState = this.FSM.on;
				}));
				
			},
			buttonRight:function(){
				var pos = this.ul[this.vertical ? 'offsetTop' : 'offsetLeft'];
				pos = Math.max(-(this.ulRange-this.liRange*this.liNum),pos-this.liRange);
	
				this.currState = this.FSM.off;
				this.anim.play(this.vertical ? {top:pos + 'px'} : {left:pos + 'px'},jutil.bind(this,function(){
					this.currState = this.FSM.on;
				}));
				
			}
		}
	}
});