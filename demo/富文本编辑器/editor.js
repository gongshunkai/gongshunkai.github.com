/*!
 * editor.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2017-2-17
 *
 */
(function(root){

	var Editor = root.Editor = function(target,options){

		var toolBar, doc, editorWin, editorDoc, 
		textarea = createElement('textarea');


		var init = function(context){

			var bookmark = null;

			context.target.appendChild(createToolBar());
			context.target.appendChild(createEditorBody());


			function createToolBar(){
				return (toolBar = new ToolBar(context)).get();
			};

			function createEditorBody(){

				var editorBody = createElement('div',{
					'class':'editor-body',
					'html':'<iframe frameborder="0"></iframe>'
				});

				var ifr = editorBody.querySelector('iframe');

				addEvent(ifr,'load',function(){
					doc = ifr.contentDocument || ifr.contentWindow.document;
					doc.designMode = 'on';
					doc.contentEditable = true;

					//页面处于正在加载的状态
					//只要在doc.write()方法前后加上doc.open(), doc.close()就可以了
					//IE下有权限问题
					!hasBro.isIE() && doc.open();

					doc.write('<!DOCTYPE html>\
						<html>\
						<head>\
						<meta content="text/html; charset=utf-8" http-equiv="Content-Type">\
						<link href="iframe.css" rel="stylesheet">\
						</head>\
						<body></body>\
						</html>'
					);

					!hasBro.isIE() && doc.close();

					editorWin = ifr.contentWindow;
					editorDoc = doc;

					//注册事件
					hasBro.isIE() && onBeforedeactivate();
					toolBar.addEscBehaviour(doc);
					onInput();

					//初始化完成之后执行的方法
					context.opts.oninitialized && context.opts.oninitialized.call(context);
					context.fire('initialized');
				});

				//自定义编辑器高度
				editorBody.style.height = typeof context.opts.height === 'string' ? context.opts.height : context.opts.height + 'px';
				
				editorBody.appendChild(textarea);

				return editorBody;
			};


			/*ie不能保持光标位置，这个是在添加超链接时候出现的问题，
			当不使用浏览器内置的输入框，光标移动其他的文本域里，ie会失去所选中的部分，无法对选中的部分加链接了，
			解决办法就是：利用range的getBookmark和moveToBookmark，
			然后给iframe的document绑定onbeforedeactivate(getBookmark)、onactivate（moveTo），
			这2个事件的大致意思就是，当被激活和失去激活状态。
			增加事件之后，就不必保存lastRang或者再其他地方设置bookmark了，可以让ie像其他浏览器一样自动保持光标位置了*/
			function onBeforedeactivate(){

				addEvent(doc, 'beforedeactivate', function(){
					var range = createRange();
		            bookmark = range.getBookmark();
				});

				addEvent(doc, 'activate', function(){
					if (bookmark) {
		                var range = createRange();
		                range.moveToBookmark(bookmark);
		                range.select();
		                bookmark = null;
		            }
				});
				
			};

			function onInput(){
				addEvent(doc,'input',function(){
					context.fire('valuechanged');
				});
			};
		};
			
		
		function createRange(){
			if(hasBro.isIE())
				return editorDoc.selection.createRange();
			else
				return editorWin.getSelection();
		};


		function Public(){

			this.target = typeof target === 'string' ? document.getElementById(target) : target;

			var params = {height:200,toolbarButtons:[],skinClassName:null,oninitialized:null};
			this.opts = extend(params, options || {});

			//自定义事件集合
			this.clients = [];

			//设置容器样式
			addClass(this.target,'editor-wrap');

			//自定义皮肤样式名
			this.opts.skinClassName && addClass(this.target,this.opts.skinClassName);

			//初始化
			init(this);
		};

		//暴露给外部使用的公共方法
		Public.prototype = {

			//获取源码
			getSource:function(){
				return doc.body.innerHTML;
			},

			//设置源码
			setSource:function(source){
				doc.body.innerHTML = source;

				//当编辑器内容改变时触发
				this.fire('valuechanged');
			},

			//切换全屏
			toggleFullScreen:function(model){
				if(model === true){
					addClass(document.documentElement,'full-fix');
					addClass(this.target,'full-fix');
				}else{
					toggleClass(document.documentElement,'full-fix');
					toggleClass(this.target,'full-fix');
				}
			},

			//显示源码
			showSource:function(){

				addClass(textarea.parentNode,'source-mode');
				textarea.value = this.getSource();

				toolBar.buttons.forEach(function(wrap){

					var btn = wrap.querySelector('button');

					btn && btn.getAttribute('command-name') !== 'toggleFullScreen' && 
						btn.getAttribute('command-name') !== 'toggleSource' && 
							btn.setAttribute('disabled','disabled');

				});
			},

			//隐藏源码
			hideSource:function(){

				removeClass(textarea.parentNode,'source-mode');
				this.setSource(textarea.value);

				toolBar.buttons.forEach(function(wrap){

					var btn = wrap.querySelector('button');

					btn && btn.getAttribute('command-name') !== 'toggleFullScreen' && 
						btn.getAttribute('command-name') !== 'toggleSource' && 
							btn.removeAttribute('disabled');

				});
			},

			//是否源码模式
			hasSource:function(){
				return hasClass(textarea.parentNode,'source-mode');
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
				var node = this.target.parentNode;
				if(node){
					node.removeChild(this.target);
					toolBar.removeEscBehaviour();
					toolBar.buttons.length = 0;
					this.clients.length = 0;
				}
			},

			//IE用pasteHTML，非IE用execCommand
			_pasteHTML:function(callback) {

				if(hasBro.isFF())
					doc.documentElement.focus();
				else
					doc.activeElement.focus();

				var range = createRange(),
					text = hasBro.isIE() ? range.htmlText : range.text || range.toString();

				//callback可以是回调函数也可以是字符串
				var str = typeof callback === 'function' ? callback(text) : callback;

				if(hasBro.isIE())
					range.pasteHTML(str);
				else
					doc.execCommand('insertHTML',false,str);

				return {
					doc:doc,
					range:range,
					text:text
				};

			},

			//dropdown and dialog 走 if
			//button and option 走 else
			_execCommand:function (e){

				var self = e.currentTarget,
					node = self.parentNode,
					commandName = self.getAttribute('command-name') || '',
					valueArgument = self.getAttribute('value-argument') || '';

				if(hasClass(node,'dropdown') || hasClass(node,'dialog')){

					e.stopPropagation();

					//删除兄弟节点的样式
					siblings(node).forEach(function(el){
						hasClass(el,'open') && removeClass(el,'open');
					});

					toggleClass(node,'open');

				}else{

					doc.execCommand(commandName,false,valueArgument);

					if(hasBro.isFF())
						doc.documentElement.focus();
					else
						doc.activeElement.focus();
				}	

			},

			//绑定事件
			on:function(key,fn){
				if(!this.clients[key])
					this.clients[key] = [];

				//订阅的消息加进缓存列表
				this.clients[key].push(fn);

				return this;
			},

			//触发事件
			fire:function(){
				var key = shift.call(arguments),
					fns = this.clients[key];
				
				//如果没有绑定对应的消息
				if(!fns || fns.length === 0) return this;
				
				for(var i =0, fn; fn=fns[i++];)
					fn.apply(this,arguments);

				return this;
			},

			//移除事件
			off:function(key,fn){
				var fns = this.clients[key];
				
				//如果key对应的消息没有被人订阅，则直接返回
				if(!fns) return this;

				//如果没有传入具体的回调函数，表示需要取消key对应的所有订阅
				if(!fn){
					fns && (fns.length = 0);
				}else{
					for(var i=fns.length - 1; i>=0;i--){
						var _fn = fns[i];
						if(_fn === fn){
							//删除订阅者的回调函数
							fns.splice(i,1);
						}
					}
				}
				return this;
			}

		};

		return new Public;

	};



	/*************** 工具条类 ********************/

	function ToolBar(){
		this.init.apply(this,arguments);
	};

	ToolBar.prototype = {

		//初始化
		init:function(editor){
			
			//保存按钮元素集合
			this.buttons = [];
			//保存编辑器实例化对象
			this.editor = editor;
			//创建工具条容器
			this.toolBar = createElement('div',{'class':'toolbar'});

			switch(editor.opts.toolbarButtons){
				case 'full':
					editor.opts.toolbarButtons = ['bold','italic','underline','strikeThrough','fontFamily','fontSize','formatBlock','color','|','align','orderedList','unorderedList','outdent','indent','|','createLink','insertImage','insertVideo','insertTable','|','undo','redo','fullScreen','help','codeView'];
				break;
				case 'simple':
					editor.opts.toolbarButtons = ['bold','italic','underline','strikeThrough','fontFamily','fontSize','|','align','orderedList','unorderedList','|','createLink','insertImage','|','undo','redo','help'];
				break;
				case 'mini':
					editor.opts.toolbarButtons = ['bold','italic','underline','|','align','|','createLink','insertImage','|','undo','redo'];
				break;
			}

			this.createToolBar(editor.opts.toolbarButtons);
			this.injectAllButtons();

			//addEscBehaviour方法放到iframe onload事件中执行
			//this.addEscBehaviour();		
		},

		//获取工具条对象
		get:function(){
			return this.toolBar;
		},

		//创建工具条按钮
		createToolBar:function(toolbarButtons){
			toolbarButtons.forEach(function(name){

				var obj = ToolBar.toolbarButtons[name];

				if(name === '|')
					this.addSeparator();
				else
					obj && this.addButton(obj);

			}.bind(this));
		},

		//添加分隔元素
		addSeparator:function(){
			this.buttons.push(
				createElement('li',{
					'html':'<i class="separator"></i>'
			}));
		},

		//抽象类：把相同的方法抽象出来，不同的方法由子类重写
		AbsButton:function(params){
		
			//创建按钮
			var addWrap = function(){
				this.buttons.push(
					createElement('li',{
						'html':'<button type="button" unselectable="on" onselectstart="return false" class="btn btn-default"></button>'
				}));
				return this.buttons[this.buttons.length-1];
			}.bind(this);

			//绑定按钮事件
			var btnEvent = function(btn){
				addEvent(btn,'click',bindAsEventListener(this,function(e){
					//IE扩展一个currentTarget的属性
					if(!e.currentTarget)
						e.currentTarget = btn;
					params.btnEvent ? params.btnEvent.call(this.editor) : this.editor._execCommand(e);
				}));
			}.bind(this);

			//没有具体实现由子类重写
			//设置按钮容器属性
			//设置按钮属性
			var wrapAttr = params.wrapAttr ? params.wrapAttr.bind(this) : function(){};
			var btnAttr = params.btnAttr ? params.btnAttr.bind(this) : function(){};

			//添加按钮子菜单
			var wrapMenu = function(wrap){
				params.wrapMenu && wrap.appendChild(params.wrapMenu());
			}.bind(this);

			//创建一个构造函数并返回它
			var F = function(){
				this.init.apply(this,arguments);
			};

			//构造函数初始化，按步骤创建按钮
			F.prototype.init = function(){
				var wrap = addWrap(),
					btn = wrap.querySelector('button');
				wrapAttr(wrap);
				btnAttr(btn);
				btnEvent(btn);
				wrapMenu(wrap);
			};

			return F;
		},
		addButton:function(obj){

			/*var wrap, btn, model = obj.commandName,
				dialogBox = ToolBar.toolbarDialog[model],
				dropdownMenu = obj.menu && ToolBar.dropdownMenu;

			wrap = createElement('li',{
				'class':obj.menu ? 'dropdown' : dialogBox ? 'dialog' : '',
				'html':'<button type="button" class="btn btn-default"' + (obj.menu ? '' : ' command-name="' + obj.commandName + '"') + '><i class="' + obj.classe + '"></i>' + (obj.menu ? ' <i class="caret"></i>' : '') + '</button>'
			});

			btn = wrap.querySelector('button');
			addEvent(btn,'click',bindAsEventListener(this,function(e){
				obj.clickEvent ? obj.clickEvent(e) : execCommand(e);
			}));
			
			dropdownMenu && wrap.appendChild(dropdownMenu(obj.menu));
			dialogBox && wrap.appendChild(dialogBox());
			
			this.buttons.push(wrap);
			return wrap;*/


			var commandName = obj.commandName,
				title = obj.title,
				classe = obj.classe,
				menu = obj.menu,

				//对象属性不存在则返回undefined否则返回创建dialog的方法
				dialogBox = ToolBar.toolbarDialog(this)[commandName],

				//对象不包含menu属性则返回false否则返回创建dropdown的方法
				dropdownMenu = menu && ToolBar.dropdownMenu.bind(this);

			if(dropdownMenu){

				//实例化包含下拉菜单的按钮
				new (this.AbsButton({
					wrapAttr:function(wrap){
						wrap.setAttribute('title',title);
						wrap.setAttribute('class','dropdown');
					},
					btnAttr:function(btn){
						btn.innerHTML = '<i class="' + classe + '"></i> <i class="caret"></i>';
					},
					wrapMenu:function(){
						return dropdownMenu(menu);
					}
				}))();

			}else if(dialogBox){

				//实例化包含对话框的按钮
				new (this.AbsButton({
					wrapAttr:function(wrap){
						wrap.setAttribute('title',title);
						wrap.setAttribute('class','dialog');
					},
					btnAttr:function(btn){
						btn.setAttribute('command-name',commandName);
						btn.innerHTML = '<i class="' + classe + '"></i>';
					},
					wrapMenu:dialogBox
				}))();

			}else{

				//实例化普通按钮
				new (this.AbsButton({
					wrapAttr:function(wrap){
						wrap.setAttribute('title',title);
					},
					btnAttr:function(btn){
						btn.setAttribute('command-name',commandName);
						btn.innerHTML = '<i class="' + classe + '"></i>';
					},
					btnEvent:this.editor[commandName]
				}))();

			}
		
		},

		//添加取消菜单的事件行为
		addEscBehaviour:function(editorDoc){

			this.removeFn = function(){
				[].forEach.call(this.toolBar.querySelectorAll('li'),function(e){
					(hasClass(e,'dropdown') || hasClass(e,'dialog')) && hasClass(e,'open') && removeClass(e,'open');
				});
			}.bind(this);

			addEvent(document,'click',this.removeFn);
			addEvent(editorDoc,'click',this.removeFn);
			addEvent(document,'keydown',bindAsEventListener(this,function(e){
				if(e.keyCode == 27) this.removeFn();
			}));

		},

		//移除取消菜单的事件行为
		removeEscBehaviour: function(){
			removeEvent(document,'click',this.removeFn);
			removeEvent(document,'keydown',this.removeFn);
		},

		//安装按钮
		injectAllButtons:function(){
			var wrap = createElement('ul',{'class':'list-inline','unselectable':'on','onselectstart':'return false'});
			this.buttons.forEach(function(e){
				wrap.appendChild(e);
			});
			this.toolBar.appendChild(wrap);
		}
	};

	//工具条按钮配置项
	ToolBar.toolbarButtons = {
		'fontFamily':{'classe':'icon-font','title':'字体','menu':[
			{'html':'<span style="font-family:SimSun">宋体</span>','commandName':'fontName','valueArgument':'SimSun'},
			{'html':'<span style="font-family:FangSong_GB2312">仿宋体</span>','commandName':'fontName','valueArgument':'FangSong_GB2312'},
			{'html':'<span style="font-family:SimHei">黑体</span>','commandName':'fontName','valueArgument':'SimHei'},
			{'html':'<span style="font-family:KaiTi_GB2312">楷体</span>','commandName':'fontName','valueArgument':'KaiTi_GB2312'},
			{'html':'<span style="font-family:Microsoft YaHei">微软雅黑</span>','commandName':'fontName','valueArgument':'Microsoft YaHei'},
			{'html':'<span style="font-family:Arial">Arial</span>','commandName':'fontName','valueArgument':'Arial'},
			{'html':'<span style="font-family:Georgia">Georgia</span>','commandName':'fontName','valueArgument':'Georgia'},
			{'html':'<span style="font-family:Impact">Impact</span>','commandName':'fontName','valueArgument':'Impact'},
			{'html':'<span style="font-family:Tahoma">Tahoma</span>','commandName':'fontName','valueArgument':'Tahoma'},
			{'html':'<span style="font-family:Times New Roman">Times New Roman</span>','commandName':'fontName','valueArgument':'Times New Roman'},
			{'html':'<span style="font-family:Verdana">Verdana</span>','commandName':'fontName','valueArgument':'Verdana'}
		]},
		'fontSize':{'classe':'icon-text-height','title':'字体大小','menu':[
			{'html':'1','commandName':'fontSize','valueArgument':'1'},
			{'html':'2','commandName':'fontSize','valueArgument':'2'},
			{'html':'3','commandName':'fontSize','valueArgument':'3'},
			{'html':'4','commandName':'fontSize','valueArgument':'4'},
			{'html':'5','commandName':'fontSize','valueArgument':'5'},
			{'html':'6','commandName':'fontSize','valueArgument':'6'},
			{'html':'7','commandName':'fontSize','valueArgument':'7'}
		]},
		'formatBlock':{'classe':'glyphicon glyphicon-header','title':'段落标签','menu':[
			{'html':'<h1>标题1</h1>','commandName':'formatBlock','valueArgument':'<H1>'},
			{'html':'<h2>标题2</h2>','commandName':'formatBlock','valueArgument':'<H2>'},
			{'html':'<h3>标题3</h3>','commandName':'formatBlock','valueArgument':'<H3>'},
			{'html':'<h4>标题4</h4>','commandName':'formatBlock','valueArgument':'<H4>'},
			{'html':'<h5>标题5</h5>','commandName':'formatBlock','valueArgument':'<H5>'},
			{'html':'<h6>标题6</h6>','commandName':'formatBlock','valueArgument':'<H6>'}
		]},
		'align':{'classe':'icon-align-center','title':'对齐','menu':[
			{'html':'<i class="icon-align-left"></i>','commandName':'justifyLeft'},
			{'html':'<i class="icon-align-center"></i>','commandName':'justifyCenter'},
			{'html':'<i class="icon-align-right"></i>','commandName':'justifyRight'},
			{'html':'<i class="icon-align-justify"></i>','commandName':'justifyFull'}
		]},
		'bold':{'classe':'icon-bold','title':'加粗','commandName':'bold'},
		'italic':{'classe':'icon-italic','title':'斜体','commandName':'italic'},
		'underline':{'classe':'icon-underline','title':'下划线','commandName':'underline'},
		'strikeThrough':{'classe':'icon-strikethrough','title':'删除线','commandName':'strikeThrough'},
		'orderedList':{'classe':'icon-list-ol','title':'数字列表','commandName':'insertOrderedList'},
		'unorderedList':{'classe':'icon-list-ul','title':'符号列表','commandName':'insertUnorderedList'},
		'outdent':{'classe':'icon-indent-left','title':'减少缩进','commandName':'outdent'},
		'indent':{'classe':'icon-indent-right','title':'增加缩进','commandName':'indent'},
		'color':{'classe':'icon-tint','title':'颜色','commandName':'foreColor'},
		'createLink':{'classe':'icon-link','title':'超链接','commandName':'createLink'},
		'insertImage':{'classe':'icon-picture','title':'图片','commandName':'insertImage'},
		'insertVideo':{'classe':'icon-facetime-video','title':'视频','commandName':'insertVideo'},
		'insertTable':{'classe':'icon-table','title':'表格','commandName':'insertTable'},
		'undo':{'classe':'icon-undo','title':'撤销','commandName':'undo'},
		'redo':{'classe':'icon-repeat','title':'重做','commandName':'redo'},
		'fullScreen':{'classe':'icon-resize-full','title':'全屏编辑','commandName':'toggleFullScreen'},
		'help':{'classe':'icon-question-sign','title':'关于 editor','commandName':'help'},
		'codeView':{'classe':'icon-html','title':'可视化编辑','commandName':'toggleSource'}
	};

	//创建对话框的静态方法
	ToolBar.toolbarDialog = function(context){

		var editor = context.editor,
			pasteHTML = editor._pasteHTML.bind(editor);

		return {
			//字体颜色
			foreColor:function(){
				var valueArgument;
				var dialog = new DialogBox({
					width:200,
					offsetLeft:17,
					hideFooter:true,
					onShow:function(){
						[].forEach.call(dialog.dialog.querySelectorAll('ul.color button'),function(e){	
							addEvent(e,'click',function(){
								valueArgument = e.getAttribute('value-argument');
								dialog.hide();
							}.bind(dialog));
						});
					},
					onHide:function(){		
						var obj = pasteHTML(function(text){
							return '<font color="' + valueArgument + '">' + text + '</font>';
						});
						if(hasBro.isIE()){
							obj.range.moveStart('character',-obj.text.length);
							obj.range.select();
						}else{
							var range = obj.range.getRangeAt(0);
							range.setStart(range.startContainer,range.startOffset-obj.text.length);

							if(hasBro.isFF())
								obj.doc.documentElement.focus();
							else
								obj.doc.activeElement.focus();
						}		
					}
				});
				dialog.show({
					title:'字体颜色',
					contents:'<ul class="list-unstyled color">\
					<li><button type="button" style="background:#61BD6D" class="btn btn-default" command-name="ForeColor" value-argument="#61BD6D"></button></li>\
					<li><button type="button" style="background:#1ABC9C" class="btn btn-default" command-name="ForeColor" value-argument="#1ABC9C"></button></li>\
					<li><button type="button" style="background:#54ACD2" class="btn btn-default" command-name="ForeColor" value-argument="#54ACD2"></button></li>\
					<li><button type="button" style="background:#2C82C9" class="btn btn-default" command-name="ForeColor" value-argument="#2C82C9"></button></li>\
					<li><button type="button" style="background:#9365B8" class="btn btn-default" command-name="ForeColor" value-argument="#9365B8"></button></li>\
					<li><button type="button" style="background:#475577" class="btn btn-default" command-name="ForeColor" value-argument="#475577"></button></li>\
					<li><button type="button" style="background:#CCCCCC" class="btn btn-default" command-name="ForeColor" value-argument="#CCCCCC"></button></li>\
					<li><button type="button" style="background:#41A85F" class="btn btn-default" command-name="ForeColor" value-argument="#41A85F"></button></li>\
					<li><button type="button" style="background:#00A885" class="btn btn-default" command-name="ForeColor" value-argument="#00A885"></button></li>\
					<li><button type="button" style="background:#3D8EB9" class="btn btn-default" command-name="ForeColor" value-argument="#3D8EB9"></button></li>\
					<li><button type="button" style="background:#2969B0" class="btn btn-default" command-name="ForeColor" value-argument="#2969B0"></button></li>\
					<li><button type="button" style="background:#553982" class="btn btn-default" command-name="ForeColor" value-argument="#553982"></button></li>\
					<li><button type="button" style="background:#28324E" class="btn btn-default" command-name="ForeColor" value-argument="#28324E"></button></li>\
					<li><button type="button" style="background:#000000" class="btn btn-default" command-name="ForeColor" value-argument="#000000"></button></li>\
					<li><button type="button" style="background:#F7DA64" class="btn btn-default" command-name="ForeColor" value-argument="#F7DA64"></button></li>\
					<li><button type="button" style="background:#FBA026" class="btn btn-default" command-name="ForeColor" value-argument="#FBA026"></button></li>\
					<li><button type="button" style="background:#EB6B56" class="btn btn-default" command-name="ForeColor" value-argument="#EB6B56"></button></li>\
					<li><button type="button" style="background:#E25041" class="btn btn-default" command-name="ForeColor" value-argument="#E25041"></button></li>\
					<li><button type="button" style="background:#A38F84" class="btn btn-default" command-name="ForeColor" value-argument="#A38F84"></button></li>\
					<li><button type="button" style="background:#EFEFEF" class="btn btn-default" command-name="ForeColor" value-argument="#EFEFEF"></button></li>\
					<li><button type="button" style="background:#FFFFFF" class="btn btn-default" command-name="ForeColor" value-argument="#FFFFFF"></button></li>\
					<li><button type="button" style="background:#FAC51C" class="btn btn-default" command-name="ForeColor" value-argument="#FAC51C"></button></li>\
					<li><button type="button" style="background:#F37934" class="btn btn-default" command-name="ForeColor" value-argument="#F37934"></button></li>\
					<li><button type="button" style="background:#D14841" class="btn btn-default" command-name="ForeColor" value-argument="#D14841"></button></li>\
					<li><button type="button" style="background:#B8312F" class="btn btn-default" command-name="ForeColor" value-argument="#B8312F"></button></li>\
					<li><button type="button" style="background:#7C706B" class="btn btn-default" command-name="ForeColor" value-argument="#7C706B"></button></li>\
					<li><button type="button" style="background:#D1D5D8" class="btn btn-default" command-name="ForeColor" value-argument="#D1D5D8"></button></li>\
					</ul>'
				});
				return dialog.get();
			},

			//链接
			createLink:function(){
				var dialog = new DialogBox({
					width:200,
					btn_ok:'Insert',
					onHide:function(){
						var input = dialog.dialog.querySelector('#inputLink'),
							check = dialog.dialog.querySelector('#checkLink'),
							valueArgument = input.value,
							checked = check.checked;
						
						var obj = pasteHTML(function(text){
							return '<a href="' + valueArgument + '"' + (checked ? ' target="_blank"' : '') + '>' + text + '</a>';
						});
						if(hasBro.isIE()){
							obj.range.moveStart('character',-obj.text.length);
							obj.range.select();
						}else{
							var range = obj.range.getRangeAt(0);
							range.setStart(range.startContainer,range.startOffset-1);

							if(hasBro.isFF())
								obj.doc.documentElement.focus();
							else
								obj.doc.activeElement.focus();
						}
					}
				});
				dialog.show({
					model:'dialog-alert',
					title:'添加链接',
					contents:'<div class="form-group input-sm">\
					    <div>\
					      <input type="text" class="form-control input-sm" id="inputLink" placeholder="http://">\
					    </div>\
					  </div>\
					  <div class="checkbox">\
					    <label>\
					      <input type="checkbox" id="checkLink"> open in new tab\
					    </label>\
					  </div>'
				});
				return dialog.get();
			},

			//图片
			insertImage:function(){
				var dialog = new DialogBox({
					width:200,
					btn_ok:'Insert',
					onHide:function(){
						var input = dialog.dialog.querySelector('#inputImage'),
							valueArgument = input.value;
						
						pasteHTML('<img src="' + valueArgument + '">');	
					}
				});
				dialog.show({
					model:'dialog-alert',
					title:'插入图片',
					contents:'<div class="form-group input-sm">\
					    <div>\
					      <input type="text" class="form-control input-sm" id="inputImage" placeholder="http://">\
					    </div>\
					  </div>'
				});
				return dialog.get();
			},

			//视频
			insertVideo:function(){
				var dialog = new DialogBox({
					width:200,
					btn_ok:'Insert',
					onHide:function(){
						var input = dialog.dialog.querySelector('#inputVideo'),
							valueArgument = input.value;
					
						pasteHTML(valueArgument);	
					}
				});
				dialog.show({
					model:'dialog-alert',
					title:'插入视频',
					contents:'<div class="form-group input-sm">\
					    <div>\
					      <input type="text" class="form-control input-sm" id="inputVideo">\
					    </div>\
					  </div>'
				});
				return dialog.get();
			},

			//表格
			insertTable:function(){
				var dialog = new DialogBox({
					width:200,
					btn_ok:'Insert',
					onHide:function(){

						var inputRow = dialog.dialog.querySelector('#inputRow'),
							inputCell = dialog.dialog.querySelector('#inputCell'),
							valueRow = inputRow.value,
							valueCell = inputCell.value;

						var t = '<table border="1" width="100%">';
						for(var i=0;i<valueRow;i++){
							t+='<tr>';
							for(var y=0;y<valueCell;y++){
								t+='<td>&nbsp;</td>';
							}
							t+='</tr>';
						}
						t+='</table>';
		
						pasteHTML(t);
					}
				});
				dialog.show({
					model:'dialog-alert',
					title:'插入表格',
					contents:'<div class="form-group input-sm">\
					    <div>\
					      <input type="text" class="form-control input-sm" id="inputRow" placeholder="行">\
					    </div>\
					  </div>\
					  <div class="form-group input-sm">\
					    <div>\
					      <input type="text" class="form-control input-sm" id="inputCell" placeholder="列">\
					    </div>\
					  </div>'
				});
				return dialog.get();
			},

			//帮助
			help:function(){
				var dialog = new DialogBox({
					width:130,
					hideFooter:true
				});
				dialog.show({
					title:'关于 Editor',
					contents:'<h4 class="text-primary">Editor <small>v1.0</small></h4>\
					<p>以 Bootstrap 为皮肤编辑器，不依赖第三方js库，最低支持IE8</p>'
				});
				return dialog.get();
			}
		};
	};

	//创建下拉子菜单的静态方法
	ToolBar.dropdownMenu = function(menu){

		//创建菜单容器
		var wrap = createElement('ul',{
			'class':'dropdown-menu'
		});

		//创建菜单项并添加到容器中
		menu.forEach(function(e){
			wrap.appendChild(createElement('li',{
				'html':'<a href="javascript:;" command-name="' + e.commandName + '" value-argument="' + e.valueArgument + '">' + e.html + '</a>'
			}));
		});

		//菜单项绑定事件
		[].forEach.call(wrap.querySelectorAll('a'),function(el){
			addEvent(el,'click',bindAsEventListener(this,function(e){
				//IE扩展一个currentTarget的属性
				if(!e.currentTarget)
					e.currentTarget = el;
				this.editor._execCommand(e);
			}));
		}.bind(this));

		//返回菜单容器
		return wrap;
	};




	/*************** 对话框类 ********************/

	function DialogBox(){
		this.init.apply(this,arguments);
	};
	DialogBox.prototype = {

		//初始化
		init:function(options){

			//设置参数
			this.opts = extend({}, DialogBox.defaults, options || {});

			//按钮集合
			this.buttons = [];
		},

		//显示对话框
		show:function(options){
			var opts = extend({}, options);

			//渲染对话框
			this._drawWindow(opts);

			//切换不同的模式
			switch(opts.model){

				//提示框
		    	case 'dialog-alert' :

		    		//加入确认按钮
					this.addButton(this.opts.btn_ok,'btn btn-default',function(){
						this.hide();
					}.bind(this));
				break;

				//确认框
				case 'dialog-confirm' :

					//加入取消按钮
					this.addButton(this.opts.btn_cancel,'btn btn-default',function(){
						this.hide();
					}.bind(this));

					//加入确认按钮
					this.addButton(this.opts.btn_ok,'btn btn-primary',opts.callback);
				break;
		    }

		    //自定义对话框宽度
		    this.dialog.style.width = this.opts.width + 'px';

		    //添加皮肤样式名
		    this.opts.skinClassName && addClass(this.dialog,this.opts.skinClassName);

		    //隐藏对话框头部
		    this.opts.hideHeader && (this.dialog.querySelector('.dialog-header').style.display = 'none');

		    //隐藏对话框底部
			this.opts.hideFooter && (this.dialog.querySelector('.dialog-footer').style.display = 'none');

			//安装按钮
			this._injectAllButtons();

			//设置对话框位置
			this._display();
		},

		//获取对话框
		get:function(){
			return this.dialog;
		},

		//隐藏对话框
		hide:function(){
			removeClass(this.dialog.parentNode,'open');
			this.opts.onHide && this.opts.onHide();
		},
		
		//加入按钮
		addButton:function(label,classe,clickEvent){
			var btn = createElement('button',{
				'type':'button', 'class':classe,
				'html':label, 'click':clickEvent
			});
			this.buttons.push(btn);
			return btn;
		},

		//渲染对话框
		_drawWindow:function(opts){

			//设置内容
			var html = this._template(this.opts.template, {
				"_TITLE_":opts.title || "Untitled",
				"_CONTENTS_":opts.contents || ""
			});
		    
		   
		    this.dialog = parse2dom(html)[0];
		   

		    //禁止所有子元素冒泡行为
		    [].forEach.call(this.dialog.querySelectorAll('*'),function(e){
		    	addEvent(e,'click',bindAsEventListener(this,function(e){
					e.stopPropagation();
				}));
	    	});

		    this.opts.onShow && this.opts.onShow(); 
		},

		//安装按钮
		_injectAllButtons: function(){
			this.buttons.forEach(function(e){
				this.dialog.querySelector('.dialog-footer').appendChild(e);
			}.bind(this));
	    },

		//设置对话框位置
		_display: function(){
			this.dialog.style.left = (-this.opts.width*0.5+this.opts.offset) + 'px';
		},

		//模板
		_template:function(s,d){
			for(var p in d)
				s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
			return s;
		}
	};

	DialogBox.defaults = {
		width:         600, //对话框宽度
		offset:     20, //偏移
	    hideHeader:    false, //隐藏对话框头部
	    hideFooter:    false, //隐藏对话框底部
	    btn_ok:        'OK', // Label
	    btn_cancel:    'Cancel', // Label
	    skinClassName: null, //皮肤样式名
	    onShow:    null, //对话框显示前立即触发该事件
	    onHide:    null, //对话框隐藏前立即触发该事件
	    template:'<div class="dialog-box">\
	    	<div class="arrow"></div>\
	        	<div class="dialog-content">\
	      			<div class="dialog-header">\
						<h5 class="modal-title">{_TITLE_}</h5>\
	      			</div>\
	      			<div class="dialog-body">{_CONTENTS_}</div>\
					<div class="dialog-footer"></div>\
	      		</div>\
	      </div>'
	};




	/*********************** 工具方法 ******************************/


	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		shift			 = ArrayProto.shift,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;


	function createElement(tag,obj){
		if(typeof tag !== 'string') return;

		var node = document.createElement(tag),
			prop, value;

		for(prop in obj){

			value = obj[prop];

			if(prop === 'html')
				value && (node.innerHTML = value);
			else if(typeof value === 'function')
				value && addEvent(node,prop,value);
			else
				value && node.setAttribute(prop,value);
		}

		return node;
	};

	function bindAsEventListener(object, fun) {
		var self = this;
		return function(e) {
			return fun.call(object, eventCompat(e));
		}
	};

	function eventCompat(e) {
		e || (e = root.event);
		var type = e.type;
		if (type == 'DOMMouseScroll' || type == 'mousewheel') {
			e.delta = (e.wheelDelta) ? -e.wheelDelta / 120 : (e.detail || 0) / 3;
		}
		if (type == 'touchend') {
			e.touches = e.changedTouches;
		}
		if (e.srcElement && !e.target) {
			e.target = e.srcElement;    
		}
		//阻止默认行为
		if (!e.preventDefault) {
			e.preventDefault = function() {
				e.returnValue = false;
			};
		}
		//阻止冒泡
		if (!e.stopPropagation && e.cancelBubble !== undefined) {
			e.stopPropagation = function() {
				e.cancelBubble = true;
			};
		}
		//键盘的兼容性处理
		if(e.which == null){
			e.which = e.charCode != null ? e.charCode : e.keyCode;
		}
		/* 
		   ......其他一些兼容性处理 */
		return e;
	};

	function addEvent(el,type,fn,capture) {
		if (root.addEventListener) {	
			if (type === "mousewheel" && document.mozHidden !== undefined) {
				type = "DOMMouseScroll";
			}	
			el.addEventListener(type, fn, capture || false);
		} else if (root.attachEvent) {
			el.attachEvent("on" + type, fn);
		}
	};

	function removeEvent(el,type,fn,capture) {
		if (root.removeEventListener) {	
			if (type === "mousewheel" && document.mozHidden !== undefined) {
				type = "DOMMouseScroll";
			}	
			el.removeEventListener(type, fn, capture || false);
		} else if (root.detachEvent) {
			el.detachEvent("on" + type, fn);
		}
	};

	function extend(obj) {
		for(var i=0,source;source=Array.prototype.slice.call(arguments, 1)[i++];){
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	};


	function parse2dom(str){
		var div = document.createElement("div");
		if(typeof str == "string")
			div.innerHTML = str;
		return div.childNodes;
	};


	function siblings( elem ) {
		var r = [];
		var n = elem.parentNode.firstChild;
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	};




	var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
         core_trim = String.prototype.trim,
         core_rspace = /\s+/,
         rclass = /[\t\r\n]/g;
         
     var trim = function(text){
         if(core_trim && !core_trim.call("\uFEFF\xA0")){
             return text == null ?
                 "" :
                 core_trim.call(text);
         }else{
             return text == null ?
                 "" :
                 (text + "").replace(rtrim, "");
         }
     };
             
     
    function addClass(elem,value){
         var classNames,setClass;
         
         if (!value || typeof value !== "string") return;
         if (elem.nodeType !== 1) return;
         
         classNames = value.split(core_rspace);
         
         if (!elem.className && classNames.length === 1){
             elem.className = value;
         }else{
             setClass = " " + elem.className + " ";
         
             for (var i = 0; i < classNames.length; i++){
                 if (setClass.indexOf(" " + classNames[ i ] + " ") < 0)
                     setClass += classNames[ i ] + " ";
             }
             elem.className = trim(setClass);
         }    
     };

     function removeClass(elem,value){
     
         var removes,className;
     
         if ((!value || typeof value !== "string") && value !== undefined) return;
         if (elem.nodeType !== 1 || !elem.className) return;
         
         removes = (value || "").split(core_rspace);
         className = (" " + elem.className + " ").replace(rclass," ");
         
         // loop over each item in the removal list
         for (var i=0;i<removes.length;i++){
             // Remove until there is nothing to remove,
             while (className.indexOf(" " + removes[i] + " ") >= 0)
                 className = className.replace(" " + removes[i] + " "," ");
         }
         elem.className = value ? trim(className) : "";
     };

     function toggleClass(elem,value,stateVal){
         var type = typeof value,
             isBool = typeof stateVal === "boolean";
     
         if (type !== "string") return;
         
         // toggle individual class names
         var className,
             i = 0,
             state = stateVal,
             classNames = value.split(core_rspace);
 
         while ((className = classNames[ i++ ])){
             // check each className given, space separated list
             state = isBool ? state : !hasClass(elem,className);
             (state ? addClass : removeClass)(elem,className);
         }
     };

     function hasClass(elem,selector){
         var className = " " + selector + " ";
         if (elem.nodeType === 1 && (" " + elem.className + " ").replace(rclass," ").indexOf(className) >= 0)
             return true;
         return false;
     };
  


	var hasBro = (function() {

    	var ua = null,
    		cm = null,
    		bros = {
		        ie: false,
		        ff: false,
		        opera: false,
		        safari: false,
		        chrome: false,
		        unknown: false
		    };

	    try {
	        cm = document.compatMode;
	    } catch(A) {}
	    try {
	        ua = navigator.userAgent.toLowerCase();
	        if (ua.indexOf("msie") != -1) { bros.ie = true; }
	        else if (ua.indexOf("firefox") != -1) { bros.ff = true; }
	        else if (ua.indexOf("opera") != -1) { bros.opera = true; }
	        else if (ua.indexOf("chrome") != -1) { bros.chrome = true; }
	        else if (ua.indexOf("safari") != -1) { bros.safari = true; }
	        else { bros.unknown = true; }
	    } catch(A) {
	        bros.unknown = true;
	    }

	    return{
	    	isIE:function(){ return bros.ie; },
	    	isFF:function(){ return bros.ff; },
	    	isOpera:function(){ return bros.opera; },
	    	isChrome:function(){ return bros.chrome; },
	    	isSafari:function(){ return bros.safari; }
	    };

	})();



	//用bind改变this指向
	FuncProto.bind = FuncProto.bind || function(context) {
		var self = this; //保存原函数
		return function() { //返回一个新的函数
			return self.apply(context, arguments); //执行新的函数的时候，会把之前传入的context当作新的函数体内的this
		}
	};

	ArrayProto.forEach = ArrayProto.forEach || function(fun /*, thisp*/){  
		var len = this.length;  
		if (typeof fun != "function")  
			throw new TypeError();  
			var thisp = arguments[1];  
		for (var i = 0; i < len; i++){  
			if (i in this)  
				fun.call(thisp, this[i], i, this);  
		}
	};
	

})(this);