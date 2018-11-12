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