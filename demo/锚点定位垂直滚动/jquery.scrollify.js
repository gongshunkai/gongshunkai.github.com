(function($){
	$.fn.scrollify = function(options){

		function init(target,opts){

			var arrAnchor = [];


			opts.scrollAnchor && opts.scrollAnchor.each(function(){
				var pos = $(this).offset()[opts.vertical ? 'top' : 'left'];
				arrAnchor.push(pos+opts.offset);
			});

			opts.scrollTab && opts.scrollTab.each(function(i){
				$(this).on('click',function(){
					moveTo(target,opts,i);
				});
			});

			target.attr({anchor:arrAnchor.toString(),pageIndex:'0',pageCount:arrAnchor.length,scrollify:'enabled'});

			$(opts.scrollTarget).on("mousewheel", function(e){
				e.preventDefault();
				e.stopPropagation();
				
				if(e.delta > 0){
					moveDown(target,opts);
				}else{
					moveUp(target,opts);
				}
			});
		};

		function moveUp(target,opts){
			var pageIndex = parseInt(target.attr('pageIndex'));
			moveTo(target,opts,--pageIndex);
		};
		function moveDown(target,opts){
			var pageIndex = parseInt(target.attr('pageIndex'));
			moveTo(target,opts,++pageIndex);
		};
		function moveTo(target,opts,pageIndex){
			if(target.attr('scrollify') == 'enabled'){
				var anchor = target.attr('anchor').split(',');
				pageIndex = Math.max(0,Math.min(anchor.length-1,pageIndex));
				var pos = anchor[pageIndex];
				target.attr('scrollify','disabled');
				opts.beforeLoad && opts.beforeLoad(pageIndex);
				$(opts.scrollTarget).animate(opts.vertical ? {scrollTop:pos} : {scrollLeft:pos},function(){
					target.attr({'pageIndex':pageIndex,'scrollify':'enabled'});
					opts.afterLoad && opts.afterLoad(pageIndex);
					if(pageIndex == anchor.length-1)
						opts.finished && opts.finished(pageIndex);
				});
			}
		};

		var defaults = {
			'beforeLoad' : null,
			'afterLoad' : null,
			'finished' : null,
			'scrollTarget': 'html,body',
			'scrollAnchor': null,
			'scrollTab': null,
			'offset' : 0,
			'vertical' : true	 
		};

		return this.each(function(){

			var opts = $.extend({}, defaults, options);
			init($(this),opts);
		});
	};

})(jQuery);