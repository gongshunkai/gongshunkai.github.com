/*!
 * jquery.select.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2016-12-26
 *
 */

(function($) {

	$.fn.select = function(options) {

        return this.each(function() {

			var opts = $.extend({}, $.fn.select.defaults, options);

			//设置字段映射
			opts.fields = {
				value:$(this).attr('value-field') || 'id',
				text:$(this).attr('text-field') || 'text',
				children:$(this).attr('children-field') || 'children'
			}

			//绑定事件
			opts.selects.on('change',function(){
				$.fn.select.set($(this),opts);
			});

			//初始化select
			$.fn.select.reSet(opts);

			//启用ajax保留第一个select的菜单项
			opts.async && $.each(opts.dataMenu,function(i,o){
				o[opts.fields.children] = [];
			});
		
        });
    };

    $.fn.select.reSet = function(opts) {
		$.fn.select.setSelect(opts.selects.first(), opts.dataMenu, opts);
		$.fn.select.set(opts.selects.first(), opts);
	};


	$.fn.select.set = function(elem,opts){
		var menu = opts.dataMenu;

		//第一个select不需要处理所以从1开始
		opts.selects.each(function(index){

			if(index==0) return true; //跳过

			var value = opts.selects.eq(index-1).val();

			if(menu.length){
				//获取菜单
				if(value != '0'){
					$.each(menu,function(i,o){
						if(o[opts.fields.value] == value)
							menu = o[opts.fields.children] || [];
					});
				}else{
					menu = [];
				}	
			}

			//设置当前的select菜单一直到最后的select菜单
 			if(index > elem.index('select')){
				$.fn.select.setSelect($(this), menu,opts);
				//ajax获取数据
				opts.async && !menu.length && value != '0' && $.fn.select.async($(this),value,opts);
			}
		});
	};

	$.fn.select.setSelect = function(elem,menu,opts){

		//清空菜单和样式
		elem.empty().removeAttr('disabled').show();

		//设置空值文本
		if(opts.showEmpty) elem.append('<option value="0">' + elem.attr('empty-text') + '</option>');

		//隐藏空值
		if(menu.length <= 0){
			elem.attr({'disabled':'disabled'});
			if(elem.index('select') > opts.visible) elem.hide();
			return;
		}

		//设置菜单
		$.each(menu, function(i,o){
			var op = $('<option value="' + o[opts.fields.value] + '">' + (o[opts.fields.text] ? o[opts.fields.text] : o[opts.fields.value]) + '</option>');
			elem.append(op).val(elem.attr('default-value'));
		});

		//交换默认值
		if(!elem.attr('original-value')){
			elem.attr({
				'original-value':elem.attr('default-value'),
				'original-text':elem.attr('empty-text')
			});
			elem.attr('default-value','0');
		}
	};

	$.fn.select.async = function(elem,value,opts){
		var url = typeof opts.url === 'function' ? opts.url(value) : opts.url;

		var ajaxCallback = function(data){
			opts.afterLoad && opts.afterLoad(elem,value,opts,data);
		};
		var errorCallback = function(data){
			opts.onError && opts.onError(elem,value,opts,data);
		};

		opts.beforeLoad && opts.beforeLoad(elem,value,opts);

		if(opts.postData)
			$.post(url, opts.postData, ajaxCallback, "json").error(errorCallback);
		else
			$.getJSON(url, ajaxCallback).error(errorCallback);
	};

	$.fn.select.defaults = {
		//数据
		dataMenu:null,
		//select集合
		selects:null,
		//空值显示的数量
		visible:0,
		//是否显示空值(位于第一个)
		showEmpty:false,
		//是否启用ajax(为true时下面参数有用)
		async:false,
		//请求地址
		url:null,
		//发送数据
		postData:null,
		//请求前的回调
		beforeLoad:null,
		//请求后的回调
		afterLoad:null,
		//错误的回调
		onError:null
	};

})(jQuery);