(function(root){


	/*********************** 核心类 ******************************/

//参考文档：JS Range HTML文档/文字内容选中、库及应用介绍：http://www.zhangxinxu.com/wordpress/2011/04/js-range-html%E6%96%87%E6%A1%A3%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E9%80%89%E4%B8%AD%E3%80%81%E5%BA%93%E5%8F%8A%E5%BA%94%E7%94%A8%E4%BB%8B%E7%BB%8D/

var userSelection = (function(){

    var selection, range, node;

    return {
        
        //保存Rang
        save:function(target){

            if (window.getSelection) { //现代浏览器
                selection = window.getSelection();
                range = selection.rangeCount && selection.getRangeAt(0);
            } else if (document.selection) { //IE浏览器 考虑到Opera，应该放在后面
                selection = document.selection.createRange();
            }

            /*if(hasBro.isIE()){
                selection = document.selection.createRange();
            }
            else{
                selection = selection || window.getSelection();
                range = range || selection.getRangeAt(0);
            }*/
        
            node = target;

        },

        pasteHTML:function(str){
            if(selection.pasteHTML){
                selection.pasteHTML(str);
            }else{
                range.insertNode($(str).get(0));
            }
        },

        htmlText:function(){
            //return hasBro.isIE() ? selection.htmlText : selection.text || selection.toString();
            return selection.htmlText || selection.text || selection.toString();
        },

        //恢复光标选择区域
        reselect:function(){

            if(selection.moveStart){
                selection.moveStart('character',0);
                selection.select();
            }else{
                if(range){
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            /*if(hasBro.isIE()){

                selection.moveStart('character',0);
                selection.select();

            }else{
                
                if(range){
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

            }*/
        },

        //根据DOM元素恢复光标选择
        selectNode:function(node){

            if(selection.moveToElementText){
                selection.moveToElementText(node);
                selection.select();
            }else{

                if(range){       
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                range.selectNodeContents(node);
            }

            /*if(hasBro.isIE()){

                selection.moveToElementText(node);
                selection.select();

            }else{

                if(range){       
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                range.selectNodeContents(node);
            }*/
        },

        anchorNode:function(){
            return selection.anchorNode;
        },

        //根据用户的光标选择获取当前文本节点的父级元素
        parentElement:function(mode){

            if(!mode && node){
                return node;
            }else{
                return selection.parentElement ? 
                    selection.parentElement()
                :
                    selection.anchorNode ? 
                        selection.anchorNode.parentNode 
                    : 
                        document.createElement('div');

                /*return hasBro.isIE() ? 
                    selection.parentElement()
                :
                    selection.anchorNode.parentNode;*/
            }
              
        }
    };
})();

var preventControlSelect = function(node){
    if(node.attachEvent){
        node.attachEvent('oncontrolselect',function(e){
            e.returnValue = false;
        });
    }else{
        node.addEventListener('mscontrolselect',function(e){
            e.preventDefault();
        })
    }
};

//禁用图像和其他对象的大小可调整大小手柄
var enableControlSelect = (function(){

    var once = false;

    return function(editable){

        if(hasBro.isIE()){

            editable.find('img,table').each(function(){
                preventControlSelect($(this).get(0));
            });

        }else{

            if(!once){

                once = true;

                //启用或禁用图像和其他对象的大小可调整大小手柄。(IE浏览器不支持)
                document.execCommand('enableObjectResizing',false,false);
                document.execCommand('enableInlineTableEditing',false,false);
            }

        }
    }

})();

/*统一各浏览器按回车键插入P标签
火狐默认BR
谷歌默认DIV
IE默认P
解决办法：当空文本时，往编辑器插入一个P标签，即可修改火狐或谷歌默认的标签
         当编辑器的值发生变化，如果字符数量大于10才开始查找DOM元素
         如果字符数量小于10且不含P标签则插入一个p标签*/
var insertParagraph = function(editable){
    
    //如果字符数量小于10且不含P标签则插入一个p标签
    if(editable.html().length < 10 && !editable.find('p').length){
        
        //IE不做处理，火狐用execCommand命令，其他浏览器用append方法
        if(!hasBro.isIE()){
            if(hasBro.isFF()){
                document.execCommand('insertParagraph',false);
            }else{
                editable.append('<p><br></p>');
            }
        }
    }
};

//光标所在位置的所有父节点信息
//返回一个对象包含：指令名称集合、节点名称集合、节点属性集合
var selectParentsInfo = function(nodeInfo,parentName){

    var tagNames = [],
        attributes = {},
        elements = [];

    var setAttribute = function(attrs){

        for(var i in attrs){
            var attr = attrs[i] || {}; //IE9+ 会有NULL
            for(var k in nodeInfo.attributes){
                if(attr.name===k && !attributes[k])
                    attributes[k] = attr.value;
            }
        }
    };

    var addInfo = function(element){
        if(element.get && element.get(0)){

            var tagName = element.get(0).tagName,
                attributes = element.get(0).attributes;

            tagNames.push(tagName);     
            elements.push(element);             

            //拿到元素与字典匹配的所有属性和属性值
            setAttribute(attributes);
        }

        return element;
    };

    var element = userSelection.parentElement();

    addInfo($(element)).parentsUntil(parentName || 'body').each(function(){
        addInfo($(this));
    });

    return {
        tagNames:tagNames,
        attributes:attributes,
        elements:elements
    };

};


/*********************** 工具类 ******************************/

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
        if (ua.indexOf("msie") != -1 || ua.indexOf("rv:11") != -1) { bros.ie = true; }
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

var getTimeTick = function(){
    return new Date().getTime();
};


String.prototype.camelCase = String.prototype.camelCase || function(){
    return this.replace(/-([a-z])/ig,function(all,letter) {
        return letter.toUpperCase();
    });
};

String.prototype.underlineName = String.prototype.underlineName || function(){
    return this.replace(/([A-Z])/g,"-$1").toLowerCase();
};


/*************** 对话框类 ********************/

//全局自定义事件
var Event = {

	//事件集合
	clients:[],

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
		var key = [].shift.call(arguments),
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

Event.on('display.dialog',function(){
	this.target.attr('tabIndex','-1');
});

//动画速度
Event.on('display.dialog',function(){
	this.opts.speed = this.opts.show ? 0 : 'slow';
});

//自定义对话框大小
Event.on('display.dialog',function(){
	this.size(this.opts.width,this.opts.height);
});

//自定义对话框位置
Event.on('display.dialog',function(){
	this.opts.absolute && this.position(this.opts.left,this.opts.top);
});

//绝对定位
Event.on('display.dialog',function(){
	this.opts.absolute && this.target.css('position','absolute');
});

//加入ESC键盘事件
Event.on('display.dialog',function(){
	this.opts.keyEsc && this._addEscBehaviour();
});

//添加皮肤样式名
Event.on('display.dialog',function(){
	this.opts.skinClassName && this.target.addClass(this.opts.skinClassName);
});

//隐藏模态框头部
Event.on('display.dialog',function(){
	this.opts.hideToolbar && this._hideHeader();
});

//隐藏模态框主体
Event.on('display.dialog',function(){
	this.opts.hideContent && this._hideBody();
});

//模态框显示前
Event.on('show.dialog',function(){
	this.opts.onShow && this.opts.onShow();
});

//模态框显示后
Event.on('shown.dialog',function(){
	this.opts.onShown && this.opts.onShown();
});

//模态框隐藏前
Event.on('hide.dialog',function(){
	this.opts.onHide && this.opts.onHide();
});

//模态框隐藏后
Event.on('hiden.dialog',function(){
	this.opts.onHiden && this.opts.onHiden();
});


var Dialog = (function(){

	var dialogCache = [],
		dialog;

	return function(opts){

		opts = opts || {};

		dialog = dialogCache[opts.id];

		return dialog || (dialog = new DialogBox(opts)), opts.id && (dialogCache[opts.id] = dialog), dialog;
	};

})();


var DialogBox = function(){
	this.init.apply(this,arguments);
};

$.extend(DialogBox.prototype,Event,{

	//初始化
	init:function(options){

		//设置参数
		this.opts = $.extend({}, DialogBox.defaults, options);

		//自定义事件集合:继承自全局自定义事件集合
		this.clients = $.extend(true,{},Event.clients);

		//按钮集合
		this.buttons = [];
	},

	//显示对话框
	show:function(options){

		var opts = $.extend({}, options);

		if(this.opts.draw){
			this.opts.reload &&	this._loadContents(opts.contents);

			setTimeout(function(){

				this.fire('show.dialog');

				this.target.fadeIn(this.opts.speed,function(){
					this.fire('shown.dialog');
				}.bind(this));
			}.bind(this),100);
				
		}else{
			this._show(opts);
		}

	},

	_show:function(opts){

		//防止重复创建
		this.opts.draw = true;

		//设置id
		this.opts.id = this.opts.id || DialogBox.getTimeTick();

		//渲染对话框
		var appendWindow = this._drawWindow(opts);

		//安装按钮
		this._injectAllButtons();

		//设置对话框位置
		this.position();

		//触发自定义事件
		this.fire('display.dialog');

		//把窗体添加到文档
		appendWindow();
	},

	//隐藏对话框
	hide:function(){
		if(this.target.is(':visible')){

			this.fire('hide.dialog');

			this.target.fadeOut(this.opts.speed,function(){
				this.fire('hiden.dialog');

				this.opts.closeType == 'close' && this._hide();
			}.bind(this));
		}
	},

	_hide:function(){
		this.fire('hide.dialog');
		this.destory();
	},

	//销毁对话框
	destory:function(){

		this.fire('destory.dialog');

		this.target.remove();

		this.buttons = 
			this.clients = [];
	},

	//获取/设置对话框位置
	position: function(x,y){

		if(x == undefined){
			x = this.target.position().left;
		}else{
			this.opts.left = x;
			this.target.css('left',this.opts.left);
		}

		if(y == undefined){
			y = this.target.position().top;
		}else{
			this.opts.top = y;
			this.target.css('top',this.opts.top);
		}

		return { x:x, y:y };
	},

	//获取/设置对话框大小
	size: function(w,h){

		if(w == undefined){
			w = this.target.width();
		}else{
			this.opts.width = w;
			this.target.outerWidth(this.opts.width);
		}

		if(h == undefined){
			h = this.target.height();
		}else{
			this.opts.height = h;
			if(this.opts.fullHeight)
				this.target.outerHeight(this.opts.height);
			else
				this.target.find('.editor-content').outerHeight(this.opts.height);
		}

		return { w:w, h:h };
	},
	
	//加入按钮
	addButton:function(button){
		this.buttons.push(button);
		return this;
	},

	//渲染对话框
	_drawWindow:function(opts){

		var self = this;

		//设置内容
		var html = this._template(this.opts.template, {
			'_CONTENTS_':opts.contents ? opts.contents.toString() : ''
		});

	   	this.target = $(html);

		this._loadContents(opts.contents);

		if(this.opts.clickBoxClose){
			$(this.opts.clickBoxClose)
			.on('click',this.hide.bind(this))
			.on('keyup',function(e){
			if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13)
				this.hide();
			}.bind(this));
		}

    	//延迟执行
		return function(){
			//加入模态窗
			$(self.opts.appendTo)[self.opts.appendMode](self.target);

			self.fire('show.dialog');

			self.target.fadeIn(self.opts.speed,function(){
				self.fire('shown.dialog');
			});
		};
  
	},

	_loadContents:function(contents){
		//内容是JQ对象
		if(contents && contents.jquery){
			this.target.find('.editor-content').empty().append(contents);
		}
		//内容是回调函数
		else if(typeof contents === 'function'){
			contents(this.target.find('.editor-content').empty());
		}
	},

	//隐藏模态框头部
	_hideHeader:function(){
		this.target.find('.toolbar').hide();
	},

	//隐藏模态框主体
	_hideBody:function(){
		this.target.find('.editor-content').hide();
	},

	//安装按钮
	_injectAllButtons: function(){
		
		this.buttons.forEach(function(el){
			this.target.find('.toolbar ul.list-inline').append(el);
		},this);
    },

    //加入ESC键盘事件
	_addEscBehaviour: function(){
		if(this.opts.keyEsc){
			this.removeFn = function(e){
				if(e.keyCode == 27) this.hide();
			}.bind(this);
			this.target.on('keydown',this.removeFn);
		}
	},

	//模板
	_template:function(s,d){
		for(var p in d)
			s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
		return s;
	}
});

DialogBox.getTimeTick = function(){
	return new Date().getTime();
};

DialogBox.defaults = {
	width:     600, //对话框宽度
	height:    400, //对话框高度
	fullHeight:true,//true:高度等于模态框 false:高度等于模态框主体
	appendTo:  document.body, //把模态窗口放在指定的dom元素中
	appendMode:'append', //append,prepend,after,before
	clickBoxClose:null,
	closeType: 'close', //关闭方式 'close','hide'
	reload: false, //是否重新加载内容
	absolute:  true, // 是否绝对定位
	left:     0, //自定义位置 left
	top:      0, //自定义位置 top
    hideToolbar:    false, //隐藏对话框头部
    hideContent:    false, //隐藏对话框主体
    skinClassName: null, //皮肤样式名
    keyEsc:    true,//键盘上的 esc 键被按下时关闭模态框
    show:          false, //模态框初始化之后就立即显示出来
    onShow:    null, //模态框显示前立即触发该事件
    onShown:     null, //模态框已经显示出来（并且同时在动画效果完成）之后被触发
    onHide:    null, //模态框隐藏前立即触发该事件
    onHidden:     null, //此事件在模态框被隐藏（并且同时在动画效果完成）之后被触发
    template:'<div class="editor-wrap">\
    	<div class="toolbar">\
    		<ul class="list-inline" unselectable="on" onselectstart="return false"></ul>\
    	</div>\
        <div class="editor-content">{_CONTENTS_}</div>\
    </div>'
};




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




/*!
 * editor.js 2.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2018-11-6
 *
 */


var Editor = root.Editor = function(target,options){

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


$.extend(plugins,{
	//链接
	link:{
		dialog:true,
		nodeInfo:{
			tags:['A']
		},
		//工具条数据
		toolbarButtonData:{
			icon:'fa fa-link',
			title:'超链接',
		},
		//工具条指令
		toolbarButtonCommand:function(mediator){
			mediator.plugins.link.target.on('click',function(){
				for(var i=0,p=mediator.editwrap.find('.plugins-wrap'),f=true;i<p.length;i++)
					if($(p[i]).is(':visible')) f=false;	
				f && mediator.plugins.link.insert();
			});
		},
		//插件选中时的指令
		userSelectionCommand:function(mediator,element){
			element && mediator.plugins.link.update(element);
		},
		//插件初始化指令
		pluginFactoryCommand:function(mediator){

			var Link = function(){
				this.init.apply(this,arguments);
			}

			Link.prototype = {
				init:function(){
					this.text = Link.defaults.text;
				},
				setContents:function(){

					var self = this;
					
					this.contents = $('<div class="form-body">\
						<div class="form-group">\
							<label class="control-label">链接文字</label>\
						      <input type="text" class="form-control input-sm" value="' + this.text + '">\
						      <a class="btn-unlink" title="移除链接" href="javascript:;">\
								<span class="fa fa-unlink"></span>\
							  </a>\
						    </div>\
						    <div class="form-group">\
						      <label class="control-label">链接地址</label>\
						      <input type="text" class="form-control input-sm" value="http://www.baidu.com">\
						    </div>\
						    <div class="form-group">\
						  	  <label class="control-label">打开方式</label>\
						      <select class="form-control input-sm">\
							      <option value="_blank">在当前窗口中打开(_blank)</option>\
							      <option value="_self">在新窗口中打开(_self)</option>\
						      </select>\
						  </div>\
						</div>');

					this.inputText = this.contents.find('input').eq(0);
					this.inputLink = this.contents.find('input').eq(1);
					this.select = this.contents.find('select');
					this.unlink = this.contents.find('.btn-unlink');

					this.inputText.on('input',function(){
						self.node.text($(this).val());
					});

					this.inputLink.on('input',function(){
						self.node.attr('href',$(this).val());
					});

					this.select.on('change',function(){
						self.node.attr('target',$(this).val());
					});

					this.unlink.on('click',function(){
						userSelection.selectNode(self.node.get(0));
						mediator.execCommand('unlink',false);
						self.dialog.hide();
					});
				},
				dialogBox:function(){

					var self = this;

					this.dialog = Editor.dialog({
						id:Link.defaults.id,
						width:300,
						height:106,
						fullHeight:false,
						skinClassName:'plugins-wrap',
						appendTo:mediator.editable,
						appendMode:'after',
						clickBoxClose:mediator.editable,
						closeType:'hide',
						reload:true,
						hideToolbar:true,
						show:true,
						onShown:function(){
							self.repos(0,4);
							self.node.addClass('selected');

							self.removeFn = (function(){
								var node = self.node;
								return function(){
									node.removeClass('selected');
								}
							})();
						},
						onHiden:function(){
							self.removeFn.call(self);
						}
					});

					this.dialogShow();
				},
				dialogShow:function(){
					this.setContents();
					this.defaultValue();
					this.dialog.show({
						contents:this.contents
					});
				},
				defaultValue:function(){
					this.inputText.val(this.node.text());
					this.inputLink.val(this.node.attr('href'));
					this.select.val(this.node.attr('target'));
				},
				insert:function(){
					//防止a标签嵌套
					//如果光标在链接文字最后则触发编辑方法而不继续插入新的链接
					var parentElement = userSelection.parentElement(true);
					if(parentElement.tagName === 'A'){
						this.update($(parentElement));
					}else{
						var id = 'plugins-link-' + getTimeTick();

						this.text = userSelection.htmlText();

						if(!this.text){
							this.text = Link.defaults.text;
							mediator.pasteHTML('<a href="' + id + '">' + this.text + '</a>');
						}else{
							mediator.execCommand('createLink',false,id);		
						}

						this.node = mediator.editable.find('a[href="' + id + '"]');
						
						if(this.node.length){

							this.node.attr({'href':'http://www.baidu.com','target':'_blank'});
							this.dialogBox();			
						}
					}
				},
				update:function(node){
					this.node = node;

					if(this.node.length){
						this.dialogBox();
					}
				}
			};

			Link.defaults = {
				id:getTimeTick(),
				text:'链接文字'
			};

			return Link;
		}
	}
});


$.extend(plugins,{
	
	image:{
		dialog:true,
		nodeInfo:{
			tags:['IMG']
		},
		//工具条数据
		toolbarButtonData:function(mediator){
			var obj = {
				icon:'fa fa-picture-o',
				title:'图片'
			};

			var map = {
				'upload':'上传图片',
				'external':'外链图片'
			};

			if($.isArray(mediator.opts.imageButton)){
				obj.menu = [];

				mediator.opts.imageButton.forEach(function(value){
					obj.menu.push({valueArgument:value,nodeText:map[value] || ''});
				});
			}else{
				obj.commandName = mediator.opts.upload ? 'upload' : 'external';
			}

			return obj;
		},
		//工具条指令
		toolbarButtonCommand:function(mediator){

			var plugin = mediator.plugins.image;
			var target = plugin.target;
			var menu = target.find('ul.dropdown-menu');

			if(menu.length){
				menu.find('a').each(function(){
					$(this).on('click',function(){
						var fn = mediator.plugins.image[$(this).attr('data-value-argument')];
						fn && fn.call(mediator.plugins.image);
					});
				});
			}else{
				target.on('click',function(){
					var button = target.find('button');
					var fn = mediator.plugins.image[button.attr('data-command-name').camelCase()];
					fn && fn.call(mediator.plugins.image);
				});
			}
		},
		//插件选中时的指令
		userSelectionCommand:function(mediator,element){
			element && mediator.plugins.image.update(element);
		},
		//插件初始化指令
		pluginFactoryCommand:function(mediator){
			var Image = function(){
				this.init.apply(this,arguments);
			}

			Image.prototype = {
				init:function(){
					
				},
				setContents:function(){

					var self = this;

					this.contents = $('<div class="form-body">\
						<div class="form-group">\
							<label class="control-label">图片地址</label>\
							<input type="text" class="form-control input-sm" value="' + mediator.opts.defaultImage + '">\
							<a class="btn-upload' + (mediator.opts.upload ? '' : ' hide') + '" title="上传图片" href="javascript:;">\
								<span class="fa fa-upload"></span>\
							</a>\
						</div>\
						<div class="form-group">\
						    <label class="control-label">图片描述</label>\
						    <input type="text" class="form-control input-sm" value="Image">\
						</div>\
						<div class="form-group">\
						    <label class="control-label">图片尺寸</label>\
							<input class="form-control input-sm image-size" type="text" value="" maxlength="4" onclick="select()">\
							<span class="times">×</span>\
							<input class="form-control input-sm image-size" type="text" value="" maxlength="4" onclick="select()">\
							<a class="btn-trash" title="删除图片" href="javascript:;">\
								<span class="fa fa-trash-o"></span>\
							</a>\
						</div>\
					</div>');

					this.inputUrl = this.contents.find('input[type="text"]').eq(0);
					this.inputDesc = this.contents.find('input[type="text"]').eq(1);
					this.inputSizeW = this.contents.find('input.image-size').eq(0);
					this.inputSizeH = this.contents.find('input.image-size').eq(1);
					this.inputFile = this.contents.find('input[type="file"]');
					this.linkUpload = this.contents.find('a.btn-upload');
					this.linkDelete = this.contents.find('a.btn-trash');

					this.inputUrl.on('input',function(){
						self.node.attr('src',$(this).val());
					});

					this.inputDesc.on('input',function(){
						self.node.attr('alt',$(this).val());
					});

					this.inputSizeW.on('input',function(){
						if($(this).val() == '')
							self.node.removeAttr('width');
						else
							self.node.attr('width',$(this).val());
						mediator.target.trigger('valuechanged');
					});

					this.inputSizeH.on('input',function(){
						if($(this).val() == '')
							self.node.removeAttr('height');
						else
							self.node.attr('height',$(this).val());
						mediator.target.trigger('valuechanged');
					});

					this.linkUpload.on('click',function(){
						self.uploadAjax(1);
					});

					this.linkDelete.on('click',function(){
						self.node.remove();
						self.dialog.hide();
					});

					
				},
				dialogBox:function(){

					var self = this;

					this.dialog = Editor.dialog({
						id:Image.defaults.id,
						width:300,
						height:106,
						fullHeight:false,
						skinClassName:'plugins-wrap',
						appendTo:mediator.editable,
						appendMode:'after',
						clickBoxClose:mediator.editable,
						closeType:'hide',
						reload:true,
						hideToolbar:true,
						show:true,
						onShown:function(){
							self.defaultValue();
							self.repos();
							self.node.addClass('selected');

							self.removeFn = (function(){
								var node = self.node;
								return function(){
									node.removeClass('selected');
								}
							})();
						},
						onHiden:function(){
							self.removeFn.call(self);
						}
					});

					this.dialogShow();
				},
				dialogShow:function(){
					this.setContents();
					this.dialog.show({
						contents:this.contents
					});
				},
				defaultValue:function(){
					this.inputUrl.val(this.node.attr('src'));
					this.inputDesc.val(this.node.attr('alt'));
					this.inputSizeW.val(this.node.attr('width'));
					this.inputSizeH.val(this.node.attr('height'));
				},
				external:function(){

					this.createImage(mediator.opts.defaultImage);
				
					if(this.node.length){

						this.node.addClass('selected').removeAttr('id');

						//阻止不选择
						preventControlSelect(this.node.get(0));
						
						this.dialogBox();
					}
				},
				update:function(node){
					this.node = node;

					if(this.node.length){
						this.dialogBox();	
					}
				},
				createImage:function(src){
					var id = 'plugins-image-' + getTimeTick();

					var str = '<img id="' + id + '" src="' + src + '" alt="Image">';

					mediator.pasteHTML(str);
					
					this.node = mediator.editable.find('#' + id);
				},
				upload:function(){
					mediator.selectInEditor() && this.uploadAjax(0);
				},

				/*mode参数说明：
				0: 新增上传图片(批量)  1:更新上传图片(单张)*/
				uploadAjax:function(mode){
					var self = this;

					var nodes = [];

					var inputFile = $('<input type="file"' + (mode === 0 ? ' multiple="multiple"' : '') + ' accept="image/*">');

					inputFile.on('change',function(){
						var formData = new FormData();

						var files = mode === 0 ? $(this)[0].files : [$(this)[0].files[0]];

						for(var i=0;i<files.length;i++){
							if(mediator.opts.imageUpload.connectionCount < i+1) break;

							formData.append(mediator.opts.imageUpload.fileKey + i, files[i]);
							
							if(mode === 0){
								self.createImage(mediator.opts.loadingImage);
				
								if(self.node.length){

									//给元素包裹p标签
									self.node.wrap('<p></p>');

									//删除id
									self.node.removeAttr('id');

									//阻止不选择
									preventControlSelect(self.node.get(0));

								}
							}

							nodes.unshift(self.node);
						}

						for (n in mediator.opts.imageUpload.params) {
							formData.append(n, mediator.opts.imageUpload.params[n]);
						}

						$.ajax({
							url:mediator.opts.imageUpload.url,
							type:'GET',
							data:formData,
							dataType:'json',
							cache: false,
							contentType: false,    //不可缺
							processData: false,    //不可缺
							success:function(data){
								nodes.forEach(function(node,i){
									node.attr('src',data.img[i].imgUrl);
								});
								
							}
						});
					});
			
					inputFile.get(0).click();
				}
			};

			Image.defaults = {
				id:getTimeTick()
			};

			return Image;
		}
	}
});




$.extend(plugins,{
	table:{
		dialog:true,
		nodeInfo:{
			tags:['TH','TD']
		},
		//工具条数据
		toolbarButtonData:function(mediator){
			for(var x=0,menu=[];x<5;x++){
				for(var y=0;y<6;y++){
					menu.push({
						valueArgument:x+','+y,
						nodeText:'<span></span>'
					});
				}
			}	
			return {
				icon:'fa fa-table',
				title:'表格',
				menu:menu
			}
		},
		//工具条指令
		toolbarButtonCommand:function(mediator){
			var plugin = mediator.plugins.table;
			var target = plugin.target;
			var menu = target.find('ul.dropdown-menu');

			menu.on('mouseover','a',function(){
				var matrix = $(this).attr('data-value-argument');
				
				matrix = matrix.split(',');

				menu.find('a').each(function(){
					var data = $(this).attr('data-value-argument').split(',');

					if(data[0]<=matrix[0] && data[1]<=matrix[1]){
						$(this).parent().addClass('active');
					}else{
						$(this).parent().removeClass('active');
					}
				});
				
			});

			menu.on('mouseout',function(){
				$(this).find('a').parent().removeClass('active');
			});

			menu.on('click','a',function(e){
				var matrix = $(e.target).attr('data-value-argument');
				plugin.insert(matrix.split(','));
			});
		},
		//插件选中时的指令
		userSelectionCommand:function(mediator,element){
			element && mediator.plugins.table.update(element);
		},
		//插件初始化指令
		pluginFactoryCommand:function(mediator){

			var plugins = {
				tableHeader:{
					nodeInfo:{
						tags:['TH']
					},
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-header',
						title:'表头',
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;

						target.on('click',function(){

							var button = target.find('button');
							var node = table.node;

							button.toggleClass('active');

							var _table = table.getTable(node);

							var thead = _table.find('thead');

							if(thead.length){
								thead.remove();
							}else{

								var columnCount = table.getColumnCount(node);
								
								var th = table.setTh(columnCount);

								thead = $('<thead><tr>' + th + '</tr></thead>');

								_table.find('tbody').before(thead);
							}
						});
						
					},
					//插件选中时的指令
					userSelectionCommand:function(mediator,mode,name){
						var plugin = mediator.plugins[name];
						if(mode)
							plugin.target.find('button').addClass('active');
						else
							plugin.target.find('button').removeClass('active');
					}
				},
				removeTable:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-trash-o',
						title:'删除表格',
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;

						target.on('click',function(){

							var button = target.find('button');
							var node = table.node;
							var dialog = table.dialog;

							var _table = table.getTable(node);
								
							_table.remove();
							dialog.hide();
						});
					}
				},
				row:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-reorder',
						title:'行',
						menu:[
							{valueArgument:'insertRowAbove',nodeText:'上面插入行'},
							{valueArgument:'insertRowBelow',nodeText:'下面插入行'},
							{valueArgument:'deleteRow',nodeText:'删除行'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var dialog = table.dialog;
								var type = $(this).attr('data-value-argument');	
								if(type==='deleteRow'){
									node.closest('tr').remove();
									dialog.hide();
								}else{
									table[type](node);
								}	
							});
						});		
					}
				},
				column:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-reorder fa-rotate-90',
						title:'列',
						menu:[
							{valueArgument:'insertColumnBefore',nodeText:'左边插入列'},
							{valueArgument:'insertColumnAfter',nodeText:'右边插入列'},
							{valueArgument:'deleteColumn',nodeText:'删除列'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var dialog = table.dialog;
								var type = $(this).attr('data-value-argument');	
								if(type==='deleteColumn'){
									var index = node.index();
									node.closest('tr').siblings().each(function(){
										$(this).find('td').eq(index).remove();
									});
									node.remove();
									dialog.hide();
								}else{
									table[type](node);
								}	
							});
						});		
					}
				},
				tableStyle:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-leaf',
						title:'表格样式',
						menu:[
							{valueArgument:'dashedBorders',nodeText:'虚线边框'},
							{valueArgument:'alternateRows',nodeText:'隔行变色'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var type = $(this).attr('data-value-argument');	
								var _table = table.getTable(node);
								if(type==='dashedBorders'){
									if(_table.hasClass('dashed-borders')){
										_table.removeClass('dashed-borders');
										_table.find('td').css('border-style','');
									}else{
										_table.addClass('dashed-borders');
										_table.find('td').css('border-style','dashed');
									}
								}else if(type==='alternateRows'){
									if(_table.hasClass('alternate-rows')){
										_table.removeClass('alternate-rows');
										_table.find('tr').filter(':even').find('td').css('background-color','');
									}else{
										_table.addClass('alternate-rows');
										_table.find('tr').filter(':even').find('td').css('background-color','#f5f5f5');
									}
								}	
							});
						});		
					}
				},
				cell:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-square-o',
						title:'单元格',
						menu:[
							{valueArgument:'mergeCells',nodeText:'合并列'},
							{valueArgument:'verticalSplit',nodeText:'水平拆分'},
							{valueArgument:'horizontalSplit',nodeText:'垂直拆分'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var type = $(this).attr('data-value-argument');	
								var _table = table.getTable(node);
								
							});
						});		
					}
				},
				color:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-tint',
						title:'颜色',
						menu:[
							{'valueArgument':'#e33737','nodeText':'<span style="background:#e33737"></span>'},
							{'valueArgument':'#e28b41','nodeText':'<span style="background:#e28b41"></span>'},
							{'valueArgument':'#c8a732','nodeText':'<span style="background:#c8a732"></span>'},
							{'valueArgument':'#209361','nodeText':'<span style="background:#209361"></span>'},
							{'valueArgument':'#418caf','nodeText':'<span style="background:#418caf"></span>'},
							{'valueArgument':'#aa8773','nodeText':'<span style="background:#aa8773"></span>'},
							{'valueArgument':'#999999','nodeText':'<span style="background:#999999"></span>'},
							{'valueArgument':'#000000','nodeText':'<span style="background:#000000"></span>'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var bgcolor = $(this).attr('data-value-argument');	
								node.attr('bgcolor',bgcolor);				
							});
						});		
					}
				},
				verticalAlign:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-arrows-v',
						title:'垂直对齐',
						menu:[
							{valueArgument:'top',nodeText:'顶端'},
							{valueArgument:'middle',nodeText:'居中'},
							{valueArgument:'bottom',nodeText:'底部'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var valign = $(this).attr('data-value-argument');
								node.css('vertical-align',valign);	
							});
						});		
					}
				},
				horizontalAlign:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-arrows-h',
						title:'水平对齐',
						menu:[
							{valueArgument:'left',nodeText:'左对齐'},
							{valueArgument:'center',nodeText:'居中对齐'},
							{valueArgument:'right',nodeText:'右对齐'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').each(function(){
							$(this).on('click',function(){
								var node = table.node;
								var align = $(this).attr('data-value-argument');
								node.css('text-align',align);
							});
						});		
					}
				},
				cellStyle:{
					//工具条数据
					toolbarButtonData:{
						icon:'fa fa-magic',
						title:'单元格样式',
						menu:[
							{nodeText:'增强亮度'},
							{nodeText:'增强宽度'}
						]
					},
					//工具条指令
					toolbarButtonCommand:function(mediator,name,table){
						var plugin = mediator.plugins[name];
						var target = plugin.target;
						var menu = target.find('ul.dropdown-menu');

						menu.find('a').eq(0).on('click',function(){
							var node = table.node;
							if(node.hasClass('highlighted')){
								node.removeClass('highlighted');
								node.css('border-color','');
							}else{
								node.addClass('highlighted');
								node.css('border-color','red');
							}
						});	

						menu.find('a').eq(1).on('click',function(){
							var node = table.node;
							if(node.hasClass('thick')){
								node.removeClass('thick');
								node.css('border-width','');
							}else{
								node.addClass('thick');
								node.css('border-width','2px');
							}
						});		
					}
				}
			};

			var Table = function(){
				this.init.apply(this,arguments);
			}

			Table.prototype = {
				init:function(){
					var table = this, toolbar;

					var _mediator = $.extend({},mediator,{
						opts:{
							toolbarButtons:['tableHeader','removeTable','row','column','tableStyle','cell','color','verticalAlign','horizontalAlign','cellStyle'],
							plugins:plugins
						},
						plugins:{},
						nodeInfo:{
							//标签映射关系对象
							tags:{},
							//标签的属性映射关系对象
							attributes:{}
						}
					});

					_mediator.editable
					.on('click',function(e){
						_mediator.userSelectionCommand(e.target);
					})
					.on('keyup',function(e){
						if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13){
							_mediator.userSelectionCommand();
						}
					});

					_mediator.editor.on('initialized',function(){

						$.extend(_mediator,{
							editwrap:mediator.editwrap
						});

						//工具条添加键盘ESC事件
						toolbar.addEscBehaviour();
					});

					toolbar = this.toolbar = Editor.toolbar(_mediator);

					_mediator.opts.toolbarButtons.forEach(function(name){
						toolbar.addButton(name);
						toolbar.injectCommand(name,table);
					});

					var destroy = function(){
						_mediator.editor.destroy();
					}
				
				},
				insert:function(matrix){
					var valueRow = matrix[0],
						valueCell = matrix[1];

					var id = 'plugins-table-' + getTimeTick();

					var t = '<table id="' + id + '" border="1" width="100%"><tbody>';

					for(var x=0;x<=valueRow;x++){
						t+='<tr>';
						for(var y=0;y<=valueCell;y++){
							t+='<td>&nbsp;</td>';
						}
						t+='</tr>';
					}
					t+='</tbody></table>';

					mediator.pasteHTML(t);

					this.node = mediator.editable.find('#' + id);

					if(this.node.length){

						if(!this.node.prev().length){
							this.node.before($('<p><br></p>'));
						}
						if(!this.node.next().length){
							this.node.after($('<p><br></p>'));
						}

						this.node.removeAttr('id');

						//阻止不选择
						preventControlSelect(this.node.get(0));

						this.dialogBox();
					}
				},
				update:function(node){
					this.node = node;

					if(this.node.length){

						this.node.addClass('selected');

						
						this.dialogShow();
						this.repos();
					}
				},
				dialogBox:function(){

					var self = this;

					this.dialog = Editor.dialog({
						id:Table.defaults.id,
						width:250,
						height:'auto',
						skinClassName:'plugins-wrap',
						appendTo:mediator.editable,
						appendMode:'after',
						clickBoxClose:mediator.editable,
						closeType:'hide',
						hideContent:true,
						show:true,
						onShown:function(){
							
						},
						onHiden:function(){
							
						}
					});

					this.toolbar.buttons.forEach(function(button){
						this.dialog.addButton(button);
					},this);
					
				},
				dialogShow:function(){
					this.dialog.show();
				},
				getTable:function(){
					return this.node.closest('table');
				},
				getColumnCount:function(){
					var table = this.getTable();
					var columnCount = 0;
					table.find('tr').each(function(){
						columnCount = Math.max(columnCount,$(this).find('th').length);
						columnCount = Math.max(columnCount,$(this).find('td').length);
					});
					return columnCount;
				},
				isThead:function(node){
					var parents = node.parentsUntil('table').toArray();
					for(var i=0,parent;parent=parents[i++];){
						if(parent.tagName === 'THEAD') return true;
					}
				},
				setTh:function(count){
					var str = '';
					for(var i=0;i<count;i++){
						str += '<th><br></th>';
					}
					return str;
				},
				setTd:function(count){
					var str = '';
					for(var i=0;i<count;i++){
						str += '<td><br></td>';
					}
					return str;
				},
				insertRowAbove:function(node){

					var columnCount = this.getColumnCount(node);
					var td = this.setTd(columnCount);
					var tr = $('<tr>' + td + '</tr>');

					var isThead = this.isThead(node);

					//是thead则在tbody开头插入tr，否则在当前的tr之后插入tr
					if(!isThead){
						node.closest('tr').before(tr);
					}

				},
				insertRowBelow:function(node){

					var columnCount = this.getColumnCount(node);
					var td = this.setTd(columnCount);
					var tr = $('<tr>' + td + '</tr>');

					var isThead = this.isThead(node);

					//是thead则在tbody开头插入tr，否则在当前的tr之后插入tr
					if(isThead){
						var table = this.getTable(node);
						table.find('tbody').prepend(tr);
					}else{
						node.closest('tr').after(tr);
					}
				},

				insertColumnBefore:function(node){
					var index = node.index();

					node.closest('tr').siblings().each(function(){
						$(this).find('td').eq(index).before($('<td><br></td>'));
					});
					
					node.before($('<td><br></td>'));
				},

				insertColumnAfter:function(node){
					var index = node.index();

					node.closest('tr').siblings().each(function(){
						$(this).find('td').eq(index).after($('<td><br></td>'));
					});
					
					node.after($('<td><br></td>'));
				}
			};

			Table.defaults = {
				id:getTimeTick()
			}

			return Table;
		}
	}
});



})(this);


