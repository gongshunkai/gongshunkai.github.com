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