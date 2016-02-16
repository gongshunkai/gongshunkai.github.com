var Flow = jutil.Class.create();
jutil.extend(Flow.prototype,{
	initialize:function(container,arrLigne){
		this.arrDiv = [];
		this.cache = [];
		this.container = document.getElementById(container);
		this.scroll = jutil.scrollTo({vertical:false});		
		
		for(var i=0,id;id=arrLigne[i++];){
			this.arrDiv.push(document.getElementById(id));
		}
	},
	getMinDiv:function(){
		var tmpObj = {},
			arrTmp = [];
		for(var i=0,element;element=this.arrDiv[i++];){
			tmpObj[element["offsetWidth"]] = element;
			arrTmp.push(element["offsetWidth"]);
		}
		return tmpObj[Math.min.apply(Math,arrTmp)];
	},
	add:function(options){
		var reda = document.createElement('div'),
			self = this;
		
		reda.className = "reda";
		reda.innerHTML = '<a href="' + options.url + '"><img src="' + options.img + '"><div class="datas"><h3>' + options.title + '</h3><p>' + options.desc + '</p></div></a><div class="sharing"></div>';

		var a = reda.querySelector('a'),
			img = reda.querySelector('img'),
			datas = reda.querySelector('div.datas'),
			sharing = reda.querySelector('div.sharing');
		var anim = [jutil.animation(img),jutil.animation(sharing)];
		
		jutil.addEvent(img, "load", jutil.bindAsEventListener(img,function(){
			var div = self.getMinDiv();
			div.appendChild(reda);
			
			//图片加载到页面后才能获取它的值
			this.style.width = "auto";
			this.style.width = this["offsetWidth"] + "px";
			reda.style.width = this["offsetWidth"] + "px";
			div.style.width = div["offsetWidth"] + this["offsetWidth"] + "px";	
		}));
		
		
	
		jutil.addEvent(reda, "mouseover", function() {
			anim[0].play({top:-15});
			anim[1].play({top:img["offsetHeight"]-60});
		});
		jutil.addEvent(reda, "mouseout", function() {
			anim[0].play({top:0});
			anim[1].play({top:img["offsetHeight"]});
		});

		this.cache.push(function(){
			img.style.top = "0px";
			img.style.width = "auto";
			img.style.width = img["offsetWidth"] + "px";
			sharing.style.top = img["offsetHeight"] + "px";
			reda.style.width = img.width + "px";
			reda.parentNode.style.width = reda.parentNode["offsetWidth"] + img.width + "px";			
		});
	},
	resize:function(){	
		for(var i=0,element;element=this.arrDiv[i++];){
			element.style.width = "0px";
		}
		for(var i=0,fn;fn=this.cache[i++];){
			fn();
		}
	},
	wheelCtrl:function(e){
		e.preventDefault();
		e.stopPropagation();	
		var pageScroll = jutil.getPageScroll();
		this.scroll.play(200 * e.delta + pageScroll.x);		
	}
});