var Flow = jutil.Class.create();
jutil.extend(Flow.prototype,{
	initialize:function(container,arrLigne){
		this.arrDiv = [];
		this.cache = [];
		this.container = $(container);
		this.scroll = jutil.scrollTo({vertical:false});		
		
		for(var i=0,id;id=arrLigne[i++];){
			this.arrDiv.push($(id));
		}
	},
	getMinDiv:function(){
		var tmpObj = {},
			arrTmp = [];
		for(var i=0,element;element=this.arrDiv[i++];){
			tmpObj[element.outerWidth()] = element;
			arrTmp.push(element.outerWidth());
		}
		return tmpObj[Math.min.apply(Math,arrTmp)];
	},
	add:function(options){
		var reda = $('<div></div>'),
			self = this;
		
		reda.attr('class','reda');
		reda.html('<a href="' + options.url + '"><img src="' + options.img + '"><div class="datas"><h3>' + options.title + '</h3><p>' + options.desc + '</p></div></a><div class="sharing"></div>');

		var a = reda.find('a'),
			img = reda.find('img'),
			datas = reda.find('div.datas'),
			sharing = reda.find('div.sharing');
		var anim = [jutil.animation(img),jutil.animation(sharing)];
		
		img.on("load",function(){
			var div = self.getMinDiv();
			div.append(reda);
			
			//图片加载到页面后才能获取它的值
			$(this).css('width','auto');
			$(this).css('width',$(this).outerWidth());
			reda.css('width',$(this).outerWidth());
			div.css('width',div.outerWidth() + $(this).outerWidth());	
		});
		
		
	
		reda.on("mouseover", function() {
			anim[0].play({top:-15});
			anim[1].play({top:img.outerHeight()-60});
		});
		reda.on("mouseout", function() {
			anim[0].play({top:0});
			anim[1].play({top:img.outerHeight()});
		});

		this.cache.push(function(){
			img.css('top','0px');
			img.css('width','auto');
			img.css('width',img.outerWidth());
			sharing.css('top',img.outerHeight());
			reda.css('width',img.outerWidth());
			reda.parent().css('width',reda.parent().outerWidth() + img.outerWidth());			
		});
	},
	resize:function(){	
		for(var i=0,element;element=this.arrDiv[i++];){
			element.css('width','0px');
		}
		for(var i=0,fn;fn=this.cache[i++];){
			fn();
		}
	},
	wheelCtrl:function(e){
		e.preventDefault();
		e.stopPropagation();
		this.scroll.play(200 * e.delta + $(window).scrollLeft());		
	}
});