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