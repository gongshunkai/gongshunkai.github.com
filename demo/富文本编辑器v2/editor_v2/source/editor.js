/*!
 * editor.js 2.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2018-11-6
 *
 */


var Editor = function(target,options){

	var editwrap, toolbar, editable, codable, dialog;

	//中介者对象
	var mediator = new Editor.Mediator();

	//编辑器唯一标识
	var uniqid = getTimeTick();

	var init = function(context){

		//参数配置项
		var opts = $.extend({},Editor.defaults,options);

		//字符串映射成数组
		if(typeof opts.toolbarButtons === 'string'){
			if(opts.toolbarButtons === 'full'){
				for(var name in opts.plugins) toolbarButtonSetting.full.push(name);
			}
			opts.toolbarButtons = toolbarButtonSetting[opts.toolbarButtons] || [];
		}

		//扩展插件
		opts.plugins = $.extend({},opts.plugins,plugins);

		//创建编辑器
		editable = $('<div class="editor-table" contenteditable="true"></div>');
		//创建textarea
		codable = $('<textarea class="code-table"></textarea>');

		//绑定事件
		//如果是文本框用onchange,oninput,onpropertychange都可以实时监控值发生变化，但是div设置了属性contenteditable（可编辑文档）就不管用了。
		editable
		.on('input blur keyup paste copy cut mouseup',function(){
			context.trigger('valuechanged');
		})
		.on('click',function(e){
			mediator.userSelectionCommand(e.target);
		})
		.on('keyup',function(e){
			if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13){
				mediator.userSelectionCommand();
			}
		});

		//给textarea绑定事件
		codable
		.on('change input propertychange',function(){
			context.setSource($(this).val());
		});

		//实例化工具条类
		toolbar = new ToolBar(mediator);

		//扩展中介者对象
		$.extend(mediator,{
			uniqid:uniqid,
			editor:context,
			target:context.target,
			opts:opts,
			plugins:{},
			nodeInfo:{
				//标签映射关系对象
				tags:{},
				//标签的属性映射关系对象
				attributes:{}
			},
			codable:codable,
			editable:editable,
			//鼠标点击通过e.target传值，按键(光标)通过操作range获取节点
			userSelectionCommand:function(node){

				userSelection.save(node);

				var self = this,
					nodeInfo = selectParentsInfo(this.nodeInfo,editwrap);

				this.opts.toolbarButtons.forEach(function(name){
					var plugin = self.opts.plugins[name];

					if(plugin){

						var userSelectionCommand = plugin.userSelectionCommand || function(){};

						if(plugin.nodeInfo && plugin.nodeInfo.tags){

							for(var i=0,index=0,tags=plugin.nodeInfo.tags;i<tags.length;i++){
								if((index=nodeInfo.tagNames.indexOf(tags[i])) >= 0){
									userSelectionCommand(self,nodeInfo.elements[index],name);
									break;
								}else{
									userSelectionCommand(self,null,name);
								}
							}
						}

						else if(plugin.nodeInfo && plugin.nodeInfo.attributes){
							var value = nodeInfo.attributes[plugin.nodeInfo.attributes[0]];
							userSelectionCommand(self,value,name);
						}	

						else{
							userSelectionCommand(self,nodeInfo,name);
						}
					}
					
				});
			},
			//检查光标是否在当前编辑器中
			selectInEditor:function(){
				//根据用户的光标选择获取当前文本节点的父级元素
				var parentElement = userSelection.parentElement();
				//获取编辑器的容器元素
				var wrap = $(parentElement).parents('.editor-wrap');
				//获取该元素保存的uniqid
				var id = wrap.data('uniqid');
				return uniqid === id;
			},
			execCommand:function(aCommandName, aShowDefaultUI, aValueArgument){
				if(this.selectInEditor())
					document.execCommand(aCommandName, aShowDefaultUI, aValueArgument);
			},
			pasteHTML:function(str){
				if(this.selectInEditor())
					userSelection.pasteHTML(str);
			}
		});

		context.on('initialized',function(){

			//保存编辑器容器元素
			editwrap = dialog.target;

			//保存唯一标识
			editwrap.data('uniqid',uniqid);

			//扩展中介者对象
			$.extend(mediator,{
				editwrap:editwrap
			});

			//工具条添加键盘ESC事件
			toolbar.addEscBehaviour();

			//设置编辑器焦点
			editable.focus();

			//保存range
			userSelection.save();

			//插入一个p标签
			insertParagraph(editable);


			//编辑器值发生变化时检测，如果编辑器没有P标签则插入一个
			context.on('valuechanged',function(){
				userSelection.save();
				insertParagraph(editable)
			});

			//禁用图像和其他对象的大小可调整大小手柄
			enableControlSelect(editable);

		});

		//添加按钮和指令
		opts.toolbarButtons.forEach(function(name){
			toolbar.addButton(name);
			toolbar.injectCommand(name);
		});

		//创建对话框
		dialog = new Dialog({
			width:'100%',
			height:opts.height,
			fullHeight:false,
			appendTo:context.target,
			appendMode:'after',
			absolute:false,
			keyEsc:false,
			skinClassName:opts.skinClassName,
			onShown:function(){
				context.trigger('initialized');
			}
		});

		//把保存在工具条的按钮添加到对话框头部
		toolbar.buttons.forEach(function(button){
			dialog.addButton(button);
		});

		//显示对话框
		dialog.show({
			contents:function(content){
				content.append(editable);
				content.append(codable);
			}
		});


		//隐藏源目标元素
		context.target.addClass('hide');

	};

	function Public(){
		this.target = typeof target === 'string' ? $('#' + target) : target;
		init(this);
	};

	//暴露给外部使用的公共方法
	Public.prototype = {
		on:function(){
			this.target.on.apply(this.target,arguments);
		},
		off:function(){
			this.target.off.apply(this.target,arguments);
		},
		trigger:function(){
			this.target.trigger.apply(this.target,arguments);
		},
		//获取源码
		getSource:function(){
			return editable.html();
		},

		//设置源码
		setSource:function(source){

			editable.html(source);

			//当编辑器内容改变时触发
			this.trigger('valuechanged');
		},

		//切换全屏
		toggleFullScreen:function(model){
			if(model === true){
				$(document.documentElement).addClass('full-fix');
				ditwrap.addClass('full-fix');
			}else{
				$(document.documentElement).toggleClass('full-fix');
				editwrap.toggleClass('full-fix');
			}
		},

		//显示源码
		showSource:function(){

			editwrap.addClass('source-mode');

			codable.val(this.getSource());

			toolbar.buttons.forEach(function(wrap){

				var btn = wrap.find('button');

				btn && btn.attr('data-command-name') !== 'full-screen' && 
					btn.attr('data-command-name') !== 'code-view' && 
						btn.attr('disabled','disabled');

			});
		},

		//隐藏源码
		hideSource:function(){

			editwrap.removeClass('source-mode');

			this.setSource(codable.val());

			enableControlSelect(editable);

			toolbar.buttons.forEach(function(wrap){

				var btn = wrap.find('button');

				btn && btn.attr('data-command-name') !== 'full-screen' && 
					btn.attr('data-command-name') !== 'code-view' && 
						btn.removeAttr('disabled');

			});
		},

		//是否源码模式
		hasSource:function(){
			return editwrap.hasClass('source-mode');
		},

		//切换源码
		toggleSource:function(model){
			if(!this.hasSource() || model === true)
				this.showSource();
			else
				this.hideSource();
		},

		//销毁编辑器
		destroy:function(){
			toolbar.destroy();
			dialog.destory();
			mediator = null;
			this.target.removeClass('hide').off('initialized').off('valuechanged');	
		}
	};

	return new Public;
};


//默认参数配置项
Editor.defaults = {
	height:200,
	toolbarButtons:[],
	skinClassName:null,
	plugins:{},
	defaultImage:'images/image.png',
	loadingImage:'images/loading.gif',
	upload:false,
	/*imageUpload:{
		url: '',
	    params: null,
	    fileKey: 'upload_file',
	    connectionCount: 3
	},
	imageButton:['upload','external']*/
};

//中介者
Editor.Mediator = function(){};

//对话框
Editor.dialog = function(options){
	return new Dialog(options);
};

//工具条
Editor.toolbar = function(options){
	return new ToolBar(options);
};


//工具条按钮配置对象
var toolbarButtonSetting = {
	full:['bold','italic','underline','strikeThrough','fontFamily','fontSize','formatBlock','color','align','orderedList','unorderedList','quote','indent','outdent','table','link','image','video','insertHR','selectAll','removeFormat','undo','redo','fullScreen','help','codeView'],
	simple:['bold','italic','underline','strikeThrough','fontFamily','fontSize','align','orderedList','unorderedList','link','image','undo','redo','help'],
	mini:['bold','italic','underline','align','link','image','undo','redo']
};

//插件
var plugins = {};

//
$.extend(plugins,{
	fontFamily:{
		nodeInfo:{
			attributes:['face']
		},
		toolbarButtonData:{
			icon:'fa fa-font',
			title:'字体',
			commandName:'fontName',
			menu:[
				{'valueArgument':'SimSun','nodeText':'<span style="font-family:SimSun">宋体</span>'},
				{'valueArgument':'FangSong_GB2312','nodeText':'<span style="font-family:FangSong_GB2312">仿宋体</span>'},
				{'valueArgument':'SimHei','nodeText':'<span style="font-family:SimHei">黑体</span>'},
				{'valueArgument':'KaiTi_GB2312','nodeText':'<span style="font-family:KaiTi_GB2312">楷体</span>'},
				{'valueArgument':'Microsoft YaHei','nodeText':'<span style="font-family:Microsoft YaHei">微软雅黑</span>'},
				{'valueArgument':'Arial','nodeText':'<span style="font-family:Arial">Arial</span>'},
				{'valueArgument':'Georgia','nodeText':'<span style="font-family:Georgia">Georgia</span>'},
				{'valueArgument':'Impact','nodeText':'<span style="font-family:Impact">Impact</span>'},
				{'valueArgument':'Tahoma','nodeText':'<span style="font-family:Tahoma">Tahoma</span>'},
				{'valueArgument':'Times New Roman','nodeText':'<span style="font-family:Times New Roman">Times New Roman</span>'},
				{'valueArgument':'Verdana','nodeText':'<span style="font-family:Verdana">Verdana</span>'}
			],
		}
	},
	fontSize:{
		nodeInfo:{
			attributes:['size']
		},
		toolbarButtonData:{
			icon:'fa fa-text-height',
			title:'字体大小',
			commandName:'fontSize',
			menu:[
				{'valueArgument':'5','nodeText':'超大字体'},
				{'valueArgument':'4','nodeText':'大号字体'},
				{'valueArgument':'3','nodeText':'正常大小'},
				{'valueArgument':'2','nodeText':'小号字体'},
				{'valueArgument':'1','nodeText':'超小字体'}
			],
		}
	},
	formatBlock:{
		toolbarButtonData:{
			icon:'fa fa-paragraph',
			title:'段落标签',
			commandName:'formatBlock',
			menu:[
				{'valueArgument':'<H1>','nodeText':'<h1>标题1</h1>'},
				{'valueArgument':'<H2>','nodeText':'<h2>标题1</h2>'},
				{'valueArgument':'<H3>','nodeText':'<h3>标题1</h3>'},
				{'valueArgument':'<H4>','nodeText':'<h4>标题1</h4>'},
				{'valueArgument':'<H5>','nodeText':'<h5>标题1</h5>'},
				{'valueArgument':'<H6>','nodeText':'<h6>标题1</h6>'}
			],
		},
		userSelectionCommand:function(mediator,nodeInfo){
			mediator.plugins.formatBlock.target.find('ul.dropdown-menu li').each(function(){

				var a = $(this).find('a');

				var valueArgument = a.attr('data-value-argument');

				if(nodeInfo.tagNames.indexOf(valueArgument.replace('<','').replace('>','')) >= 0){
					$(this).addClass('active');
				}else{
					$(this).removeClass('active');
				}
			});
		}
	},
	color:{
		nodeInfo:{
			attributes:['color']
		},
		toolbarButtonData:{
			icon:'fa fa-tint',
			title:'颜色',
			commandName:'foreColor',
			menu:[
				{'valueArgument':'#e33737','nodeText':'<span style="background:#e33737"></span>'},
				{'valueArgument':'#e28b41','nodeText':'<span style="background:#e28b41"></span>'},
				{'valueArgument':'#c8a732','nodeText':'<span style="background:#c8a732"></span>'},
				{'valueArgument':'#209361','nodeText':'<span style="background:#209361"></span>'},
				{'valueArgument':'#418caf','nodeText':'<span style="background:#418caf"></span>'},
				{'valueArgument':'#aa8773','nodeText':'<span style="background:#aa8773"></span>'},
				{'valueArgument':'#999999','nodeText':'<span style="background:#999999"></span>'},
				{'valueArgument':'#000000','nodeText':'<span style="background:#000000"></span>'}
			],
		}
	},
	bold:{
		nodeInfo:{
			tags:['B','STRONG'/*only IE*/]
		},
		toolbarButtonData:{
			icon:'fa fa-bold',
			title:'加粗',
			commandName:'bold'
		}
	},
	italic:{
		nodeInfo:{
			tags:['I','EM'/*only IE*/]
		},
		toolbarButtonData:{
			icon:'fa fa-italic',
			title:'斜体',
			commandName:'italic'
		}
	},
	underline:{
		nodeInfo:{
			tags:['U']
		},
		toolbarButtonData:{
			icon:'fa fa-underline',
			title:'下划线',
			commandName:'underline'
		}
	},
	strikeThrough:{
		nodeInfo:{
			tags:['STRIKE']
		},
		toolbarButtonData:{
			icon:'fa fa-strikethrough',
			title:'删除线',
			commandName:'strikeThrough'
		}
	},
	insertHR:{
		toolbarButtonData:{
			icon:'fa fa-minus',
			title:'水平线',
			commandName:'insertHorizontalRule'
		}
	},
	selectAll:{
		toolbarButtonData:{
			icon:'fa fa-mouse-pointer',
			title:'全选',
			commandName:'selectAll'
		}
	},
	removeFormat:{
		toolbarButtonData:{
			icon:'fa fa-eraser',
			title:'去除所有格式',
			commandName:'removeFormat'
		}
	},
	undo:{
		toolbarButtonData:{
			icon:'fa fa-undo',
			title:'撤销',
			commandName:'undo'
		}
	},
	redo:{
		toolbarButtonData:{
			icon:'fa fa-repeat',
			title:'重做',
			commandName:'redo'
		}
	}
});


//
$.extend(plugins,{
	align:{
		nodeInfo:{
			attributes:['align']
		},
		toolbarButtonData:{
			icon:'fa fa-align-center',
			title:'对齐',
			menu:[
				{'valueArgument':'left','nodeText':'<i class="fa fa-align-left"></i>'},
				{'valueArgument':'center','nodeText':'<i class="fa fa-align-center"></i>'},
				{'valueArgument':'right','nodeText':'<i class="fa fa-align-right"></i>'},
				{'valueArgument':'justify','nodeText':'<i class="fa fa-align-justify"></i>'}
			],
		},
		toolbarButtonCommand:function(mediator){
			var target = mediator.plugins.align.target;
			var menu = target.find('ul.dropdown-menu');

			['justifyLeft','justifyCenter','justifyRight','justifyFull'].forEach(function(v,i){
				menu.find('a').eq(i).on('click',function(){
					mediator.execCommand(v);
				});
			});
		}
	},
	indent:{
		toolbarButtonData:{
			icon:'fa fa-indent',
			title:'增加缩进'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.indent.target.on('click',function(){

				var element = userSelection.parentElement();

				var parent = $(element);

				$(element).parentsUntil(mediator.editable).each(function(){
					parent = $(this);
				});

				if(parent.get(0).tagName === 'HTML')
					return;

				var marginLeft = parseInt(parent.css('margin-left'));

				parent.css('margin-left',Math.max(0,marginLeft + 20));
			});
		}
	},
	outdent:{
		toolbarButtonData:{
			icon:'fa fa-dedent',
			title:'减少缩进'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.outdent.target.on('click',function(){

				var element = userSelection.parentElement();

				var parent = $(element);

				$(element).parentsUntil(mediator.editable).each(function(){
					parent = $(this);
				});

				if(parent.get(0).tagName === 'HTML')
					return;

				var marginLeft = parseInt(parent.css('margin-left'));

				parent.css('margin-left',Math.max(0,marginLeft - 20));
			});
		}
	},
	orderedList:{
		nodeInfo:{
			tags:['OL']
		},
		toolbarButtonData:{
			icon:'fa fa-list-ol',
			title:'数字列表'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.orderedList.target.on('click',function(){
				$(this).toggleClass('active');
				$(this).parent().siblings().find('button[data-command-name="unordered-list"]').removeClass('active');
				mediator.execCommand('insertOrderedList',false);
			});	
		}
	},
	unorderedList:{
		nodeInfo:{
			tags:['UL']
		},
		toolbarButtonData:{
			icon:'fa fa-list-ul',
			title:'符号列表'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.unorderedList.target.on('click',function(){
				$(this).toggleClass('active');
				$(this).parent().siblings().find('button[data-command-name="ordered-list"]').removeClass('active');
				mediator.execCommand('insertUnorderedList',false);
			});	
		}
	},
	quote:{
		nodeInfo:{
			tags:['BLOCKQUOTE']
		},
		toolbarButtonData:{
			icon:'fa fa-quote-left',
			title:'引用',
			commandName:'blockquote'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.quote.target.on('click',function(){
				if($(this).hasClass('active')){
					$(this).removeClass('active');
					mediator.execCommand('outdent',false);
				}else{
					$(this).addClass('active');
					mediator.execCommand('indent',false);
				}
			});
		}
	}
});

$.extend(plugins,{
	fullScreen:{
		toolbarButtonData:{
			icon:'fa fa-expand',
			title:'全屏编辑',
			commandName:'fullScreen'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.fullScreen.target.on('click',function(){
				mediator.editor.toggleFullScreen();
			});
		}
	},
	codeView:{
		toolbarButtonData:{
			icon:'fa fa-code',
			title:'可视化编辑',
			commandName:'codeView'
		},
		toolbarButtonCommand:function(mediator){
			mediator.plugins.codeView.target.on('click',function(){
				mediator.editor.toggleSource();
			});
		}
	}
});




plugins.bold.toolbarButtonCommand = 
	plugins.italic.toolbarButtonCommand = 
		plugins.underline.toolbarButtonCommand = 
			plugins.strikeThrough.toolbarButtonCommand = 
				function(mediator,name){
					var plugin = mediator.plugins[name];
					var target = plugin.target;
					target.on('click',function(){
						var button = target.find('button');
						button.toggleClass('active');
						mediator.execCommand(button.attr('data-command-name').camelCase());
					});
				}

plugins.insertHR.toolbarButtonCommand = 
	plugins.selectAll.toolbarButtonCommand = 
		plugins.removeFormat.toolbarButtonCommand = 
			plugins.undo.toolbarButtonCommand = 
				plugins.redo.toolbarButtonCommand = 
					function(mediator,name){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						target.on('click',function(){
							var button = target.find('button');
							mediator.execCommand(button.attr('data-command-name').camelCase());
						});
					}


plugins.fontFamily.toolbarButtonCommand = 
	plugins.fontSize.toolbarButtonCommand = 
		plugins.formatBlock.toolbarButtonCommand = 
			plugins.color.toolbarButtonCommand = 
				function(mediator,name){
					var plugin = mediator.plugins[name];
					var target = plugin.target;
					var button = target.find('button');
					var menu = target.find('ul.dropdown-menu');
					menu.find('a').each(function(){
						$(this).on('click',function(){
							mediator.execCommand(button.attr('data-command-name').camelCase(),false,$(this).attr('data-value-argument'));
						});
					});
				}



plugins.bold.userSelectionCommand = 
	plugins.italic.userSelectionCommand = 
		plugins.underline.userSelectionCommand = 
			plugins.strikeThrough.userSelectionCommand = 
				plugins.orderedList.userSelectionCommand = 
					plugins.unorderedList.userSelectionCommand = 
						plugins.quote.userSelectionCommand = 
							function(mediator,mode,name){
								var plugin = mediator.plugins[name];
								if(mode)
									plugin.target.find('button').addClass('active');
								else
									plugin.target.find('button').removeClass('active');
							}


plugins.fontFamily.userSelectionCommand = 
	plugins.fontSize.userSelectionCommand = 
		plugins.color.userSelectionCommand = 
			plugins.align.userSelectionCommand = 
				function(mediator,value,name){
					var plugin = mediator.plugins[name];
					plugin.target.find('ul.dropdown-menu li').each(function(){

						var a = $(this).find('a');

						var valueArgument = a.attr('data-value-argument');

						if(value === valueArgument){
							$(this).addClass('active');
						}else{
							$(this).removeClass('active');
						}
					});
				}