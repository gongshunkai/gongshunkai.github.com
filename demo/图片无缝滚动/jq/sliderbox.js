var SliderBox = jutil.Class.extend({
	init:function(container,options){
		this.box = $(container);
		this.ul = this.box.find('ul');
		this.li = this.box.find('li');
		this.ulRange = 0, liRange = 0, liNum = 0; 
		this.currState = this.FSM.on;  //设置当前状态
		this.anim = jutil.animation(this.ul);
		
		var params = {Vertical:true};
		options = jutil.extend(params,options || {});
		
		this.vertical = !!options.Vertical;
		
		$.each(this.li, jutil.bind(this,function(i){
			if(this.vertical){
				this.ulRange += this.li.eq(i).outerHeight(true);
			}else{
				this.ulRange += this.li.eq(i).outerWidth(true);
			}
		}));
		
		this.ul.css(this.vertical ? 'height' : 'width',this.ulRange);
		this.liRange = this.ulRange / this.li.length;//计算li的宽度（包含外边距）
		this.liNum = ((this.vertical ? this.box.height() : this.box.width()) / this.liRange).toFixed(0); //计算可见区域li的个数
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
				var pos = this.ul.position()[this.vertical ? 'top' : 'left'];
				pos = Math.min(0,pos+this.liRange);
				
				this.currState = this.FSM.off;
				this.anim.play(this.vertical ? {top:pos + 'px'} : {left:pos + 'px'},jutil.bind(this,function(){
					this.currState = this.FSM.on;
				}));
				
			},
			buttonRight:function(){
				var pos = this.ul.position()[this.vertical ? 'top' : 'left'];
				pos = Math.max(-(this.ulRange-this.liRange*this.liNum),pos-this.liRange);
	
				this.currState = this.FSM.off;
				this.anim.play(this.vertical ? {top:pos + 'px'} : {left:pos + 'px'},jutil.bind(this,function(){
					this.currState = this.FSM.on;
				}));
				
			}
		}
	}
});