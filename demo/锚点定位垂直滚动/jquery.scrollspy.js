/*!
 * jquery.scrollspy.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2017-7-26
 *
 */

(function($){

	$.fn.scrollspy = function(){

		var args = [].shift.call(arguments);

		return this.each(function(){
			$.fn.scrollspy.init($(this),args);
		});
	};

	$.fn.scrollspy.init = function(self,args){
		
		//设置开关
		self.data('enabled.scrollspy',true);

		//配置参数
		var opts = $.extend({},$.fn.scrollspy.defaults,{
			target:self.attr('data-target'),
			offset:parseInt(self.attr('data-offset') || 0)
		});

		//保存锚点缓存
		$.fn.scrollspy.saveAnchorCache(self,opts);

		//注册3个事件
		if(args !== 'refresh'){
			$.fn.scrollspy.regClick(self,opts);
			$.fn.scrollspy.regScroll(self,opts);
			$.fn.scrollspy.loadImage(self,opts);
		}
	
	};

	$.fn.scrollspy.regScroll = function(self,opts){

		var links = $(opts.target).find('a'),

			//区分窗口滚动条还是元素滚动条
			target = $.fn.scrollspy.isBody(self) ? $(window) : self;

		var oldScrollFn = self.data('callback.scrollspy') || function(){};

		var newScrollFn = (function(){
			
			//记录上一次的锚点缓存索引值
			var $oldIndex = -1;

			return function(){

				//获取锚点缓存数据
				var data = self.data('cache.scrollspy');

				//记录新的锚点缓存索引值
				var $newIndex = 0, 
					oldLink,newLink,anchor;

				//遍历锚点位置缓存列表
				$.each(data,function(i){

					//兼容scrollTop
					var scrollTop = $.fn.scrollspy.isBody(self) ? $(document).scrollTop() : target.scrollTop();

					if(scrollTop >= data[i]){
						$newIndex = i;
					}
				});

				//尽可能的减少DOM操作
				if($oldIndex != $newIndex){

					oldLink = links.eq($oldIndex);
					newLink = links.eq($newIndex);

					//渲染元素
					$.fn.scrollspy.renderElement(oldLink,newLink);

					//获取被激活的锚点名称
					anchor = newLink.attr('href');

					//每当一个新条目被激活后都将由滚动监听插件触发此事件。
					$(anchor).trigger('activate.scrollspy');

				}
				
				//更新旧的锚点缓存索引值
				$oldIndex = $newIndex;
			};

		})();

		//避免重复绑定事件
		target.off('scroll',oldScrollFn).on('scroll',newScrollFn);
		
		//更新数据
		self.data('callback.scrollspy',newScrollFn);

	};

	$.fn.scrollspy.regClick = function(self,opts){

		$(opts.target).find('a').on('click',function(){

			//获取锚点缓存数据
			var data = self.data('cache.scrollspy');

			//获取索引
			var index = $(this).parent('li').index();

			//移动到锚点的位置
			$.fn.scrollspy.moveTo(self,data[index]);

			//取消a标签的默认行为
			return false;
		});

	};

	$.fn.scrollspy.saveAnchorCache = function(self,opts){

		var anchorCache = [];

		$(opts.target).find('a').each(function(){

			//获取锚点名称
			var anchor = $(this).attr('href'),

				//获取锚点位置
				top = $(anchor)[$.fn.scrollspy.isBody(self) ? 'offset' : 'position']().top,

				//锚点位置+偏移值
				pos = top + opts.offset;

			//加入锚缓存
			anchorCache.push(pos);

		});

		self.data('cache.scrollspy',anchorCache);
	};

	$.fn.scrollspy.loadImage = function(self,opts){
		self.find('img').on('load',function(){
			$.fn.scrollspy.saveAnchorCache(self,opts);
		});
	};

	$.fn.scrollspy.renderElement = function(oldLink,newLink){

		$.each([
			{
				element:oldLink,
				name:'removeClass'
			},
			{
				element:newLink,
				name:'addClass'
			}
		],function(index,item){
			item.element.parent('li')[item.name]('active');
		});
	};

	$.fn.scrollspy.moveTo = function(self,top){

		if(self.data('enabled.scrollspy')){

			self.data('enabled.scrollspy',false);

			//区分窗口滚动条还是元素滚动条
			var target = $.fn.scrollspy.isBody(self) ? $('html,body') : self;

			//兼容问题：+1px
			target.animate({scrollTop:top+1},function(){

				self.data('enabled.scrollspy',true);

			});
		}
	};

	$.fn.scrollspy.isBody = function(self){
		return self.get(0).tagName === 'BODY';
	}

	$.fn.scrollspy.defaults = {
		target:null,
		offset:0
	};

})(jQuery);