/*********************** 工具条类 *******************************/

var ToolBar = function(){
	this.init.apply(this,arguments);
};

$.extend(ToolBar.prototype,{
	init:function(mediator){

		//中介者对象
		this.mediator = mediator;

		//按钮元素集合
		this.buttons = [];
	},
	injectCommand:function(){

		var mediator = this.mediator,
			buttons = this.buttons,
			name = [].shift.call(arguments),
			args = [].slice.call(arguments),
			plugin = mediator.opts.plugins[name];

		if(plugin){

			//初始化标签的属性映射关系对象
			plugin.nodeInfo && plugin.nodeInfo.attributes && plugin.nodeInfo.attributes.forEach(function(attr){
				mediator.nodeInfo.attributes[attr] = 1;
			});
			
			var toolbarButtonCommand = plugin.toolbarButtonCommand || function(){};
			var pluginFactoryCommand = typeof plugin.pluginFactoryCommand === 'function' ? plugin.pluginFactoryCommand(mediator) : function(){};
			var factory = new pluginFactoryCommand();

			//插件有对话框则添加通用方法
			if(plugin.dialog){
				$.extend(factory,{
					repos:function(){
						var x = this.node.position().left,
							y = this.node.position().top + this.node.height() - mediator.editable.scrollTop();

						this.dialog.position(x,y);
					}
				});
			}

			//保存按钮的容器元素
			mediator.plugins[name] = $.extend(factory,{
				target:buttons[buttons.length-1]
			});
			
			//组装参数 mediator,name,[args]
			toolbarButtonCommand.apply(plugin,[mediator,name].concat(args));
		}
	},
	addButton:function(name){

		var mediator = this.mediator,
			buttons = this.buttons,
			plugin = mediator.opts.plugins[name];

		if(plugin){

			var toolbarButtonData = typeof plugin.toolbarButtonData === 'function' ? plugin.toolbarButtonData(mediator) : plugin.toolbarButtonData;
			
			//toolbarButtonData允许用户自定义创建按钮，也支持按规则创建按钮
			var target = toolbarButtonData instanceof jQuery ? toolbarButtonData : (function(){

				var target = $('<li title="' + toolbarButtonData.title + '"><button type="button" unselectable="on" onselectstart="return false" class="btn btn-default"' + (toolbarButtonData.commandName ? ' data-command-name="' + toolbarButtonData.commandName.underlineName() + '"' : '') + '><i class="' + toolbarButtonData.icon + '"></i></button></li>');
				
				if(toolbarButtonData.menu){

					var ul = $('<ul class="dropdown-menu ' + name.underlineName() + '-list"></ul>');

					toolbarButtonData.menu.forEach(function(item){
						ul.append('<li><a href="javascript:;"' + (item.valueArgument ? ' data-value-argument="' + item.valueArgument + '"' : '') + '>' + item.nodeText + '</a></li>');
					});

					target
					.addClass('dropdown')
					.append(ul)
					.find('button').on('click',function(e){

						e.stopPropagation();

						var node = $(this).parent();

						//删除兄弟节点的样式
						node.siblings().each(function(){
							$(this).hasClass('open') && $(this).removeClass('open');
						});

						node.toggleClass('open');
					});
				}

				return target;

			})();

			buttons.push(target);
		}
	},
	//添加取消菜单的事件行为
	addEscBehaviour:function(){

		var editwrap = this.mediator.editwrap,
			buttons = this.buttons;

		editwrap.on('click',fn);
	
		editwrap.on('keydown',function(e){
			if(e.keyCode == 27) fn();
		});

		function fn(){
			buttons.forEach(function(el){
				el.hasClass('dropdown') && el.hasClass('open') && el.removeClass('open');
			});
		};

	},
	//销毁
	destroy:function(){
		this.buttons.length = 0;
	}

});