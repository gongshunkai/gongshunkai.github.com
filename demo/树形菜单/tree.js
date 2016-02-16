var Tree = jutil.Class.create();
jutil.extend(Tree.prototype,{
  initialize: function(container,arrMenu,options) {
    this.container=document.getElementById(container);

	this.icon = {
		point:"new.gif",
		minus: 'minus.gif',
        plus: 'plus.gif',
		line: 'line.gif',
		folder: 'folder.gif',
        folderOpen: 'folderopen.gif',
        join: 'join.gif',
        joinBottom: 'joinbottom.gif',
		joinOne: 'joinone.gif',
		joinTop: 'jointop.gif',
		lineMinus: 'line_minus.gif',
		lineMinusBottom: 'line_minusbottom.gif',
		lineMinusOne: 'line_minusone.gif',
		lineMinusTop: 'line_minustop.gif',
		linePlus: 'line_plus.gif',
		linePlusBottom: 'line_plusbottom.gif',
		linePlusOne: 'line_plusone.gif',
		linePlusTop: 'line_plustop.gif',
		empty: 'empty.gif'	
	};
    this.Menu = jutil.buildTree(arrMenu);  //树形结构
	this.element={}; //html元素
	this.tmpId = []; //临时id
	this.loadTimes = 0;
	
	//设置默认属性
	var params = {showLine:false,showCheckBox:false,openChecked:false,path:"images/",onShow:function(){}};
	options = jutil.extend(params,options || {});
	
	//显示连线
	this.showLine = !!options.showLine;
	//显示多选框
	this.showCheckBox = !!options.showCheckBox;
	//打开选中项
	this.openChecked = !!options.openChecked;
	//图标地址
	this.path = options.path;
	//延迟显示
	this.onShow = options.onShow;
	
	for(var n in this.icon){
			this.icon[n] = this.path + this.icon[n];
	}	
  },
  Start: function() {
	this.loadTimes = 1;
	this.onShow();
  },
  //获取树形结构的数据
  GetTreeData:function(){
	if(this.loadTimes == 1){
		for(var n in this.Menu.tree){
			this.tmpId.push(this.Menu.tree[n].id); //把第一层的节点压入堆栈
		}
	}
	
	var x = this.tmpId.length; //取ID总数
	while(x>0){ //ID取完跳出循环，每次取一层
		var id = this.tmpId.shift(), //取ID
			o = this.Menu.findCurrentNode(id); //获取当前节点
		this.Build(o); //创建HTML
		
		for(var i=0; i<o.children.length; i++){
		    this.tmpId.push(o.children[i].id); //把当前节点的子节点压入堆栈
		}
		x--;
	}
	this.loadTimes++;
	this.onShow();
  },
  //创建HTML
  Build:function(o){
	var o_p = this.Menu.parentNode(o), //获取父节点
		div = document.createElement("div"),
		oc = this.openChecked ? o.checked : false,
		opc = this.openChecked ? o_p.checked : false,
		self = this;
	   
	div.className = "node";
	div.style.display = this.loadTimes == 1 || oc || !!opc ? "block" : "none";
	
	if(this.showLine){ //显示连线
		jutil.each(this.CreateLine(o),function(list){  //循环创建连线
			var img = document.createElement("img");
			img.src = list;
			div.appendChild(img);
		});
	}else{
		var span = document.createElement("span");
		span.style.width = 15 * (this.loadTimes - 1) + "px";
		div.appendChild(span);
	}

	var a = document.createElement("a");
	a.href = "javascript:;";
	a.lang = o.id;
	a.setAttribute("attr",oc ? "open" : "close");
	a.onclick = function(){ self.Open(this); }
	div.appendChild(a);
	
	if(this.showLine){ //显示连线
		var img = document.createElement("img");
		img.className = "expand";
		img.src = this.ShowIcon(o, oc);
		a.appendChild(img);
	}else{
		var img = document.createElement("img");
		img.className = "expand";
		img.src = this.Menu.hasChildNodes(o) ? oc ? this.icon.minus : this.icon.plus : this.icon.point;
		a.appendChild(img);
	}
	
	if(this.showCheckBox){ //显示多选框
		var input = document.createElement("input");
		input.type = "checkbox";
		input.name = "checkbox";
		input.lang = o.id;
		input.value = o.id;
		input.checked = o.text.checked;
		input.onclick = function(){ self.SelectCheckBox(this); }
		div.appendChild(input);
	}
	
	var a = document.createElement("a");
	a.href = o.text.url;
	a.innerHTML = o.text.title;
	div.appendChild(a);
	
	if(this.loadTimes == 1){
	  this.container.appendChild(div);
	}else{
	  this.element[o.pid].appendChild(div);
	}
	this.element[o.id] = div;
  },
  //打开节点
  Open:function(obj){
	  var o = this.Menu.findCurrentNode(obj.lang); //当前的节点
	  
	  //遍历子节点
	  for(var n in o.children){
		if(obj.getAttribute("attr") == "open"){
		  this.element[o.children[n].id].style.display = "none";
		}else{
		  this.element[o.children[n].id].style.display = "block";
		}
	  }
	  
	  //当前节点是否含有子节点
	  if(this.Menu.hasChildNodes(o)){  
	  
		if(obj.getAttribute("attr") == "open"){ 
		  obj.setAttribute("attr", "close"); obj.firstChild.src = this.showLine ? this.ShowIcon(o,false) : this.icon.plus;
	    }else{
		  obj.setAttribute("attr", "open"); obj.firstChild.src = this.showLine ? this.ShowIcon(o,true) : this.icon.minus;
	    }
	  }	  
  },
  //打开指定的层级
  OpenLevel:function(i){
	/*for(var n in this.Menu.pos){
	   if(this.Menu.pos[n].length <= i){
		  if(this.element[n] != undefined){
			  this.element[n].style.display = "block";
		  }
	   }
	}*/
	
	var id_tmp = []; //临时变量保存ID
	for(var n in this.Menu.tree){
		id_tmp.push(this.Menu.tree[n].id); //把第一层的节点压入堆栈
	}
	
	for(var y=0;y<i;y++){
		var x = id_tmp.length; //取ID总数
		while(x>0){ //ID取完跳出循环，每次取一层
			var id = id_tmp.shift(), //取ID
				o = this.Menu.findCurrentNode(id); //获取当前节点
			
			if(this.element[id] != undefined){
				 this.element[id].style.display = "block";
				 if(this.Menu.hasChildNodes(o)){  //当前节点是否含有子节点
					 this.element[id].getElementsByTagName("a")[0].setAttribute("attr","open");
					 this.element[id].getElementsByTagName("a")[0].firstChild.src = this.showLine ? this.ShowIcon(o,true) : this.icon.minus;
				}
			}
			
			for(var c=0; c<o.children.length; c++){
				id_tmp.push(o.children[c].id); //把当前节点的子节点压入堆栈
			}
			x--;
		}
	}
  },
  //选择多选框
  SelectCheckBox:function(obj){
	  var o_id = obj.lang,  //当前节点的ID
      	  o_node = this.Menu.findCurrentNode(o_id), //当前的节点
	  	  b = true, //标识符用于判断兄弟节点是否含有选中项
	  	  o_tmp = []; //临时节点堆栈
	  
	  
	  /* ----------- 多选框选中或取消所有子节点选中项 ---------------------- */
	  
	  var input = this.element[o_id].getElementsByTagName("input");
	  jutil.each(input,function(list){
			list.checked = obj.checked;
	  });
	   
		
		
	  if(obj.checked){
		  
		 /* ------------ 多选框选中所有父节点选中项 ----------------------- */
		
		 o_tmp.push(this.Menu.parentNode(o_node)); //把当前节点的父节点压入堆栈
		
		 while(o_tmp.length > 0){
			 
		    var o = o_tmp.pop();	//获取节点  
		    this.element[o.id].getElementsByTagName("input")[0].checked = true;
		    o = this.Menu.parentNode(o); //获取父节点
			
		    if(o.id != undefined){
				o_tmp.push(o);
			}
		 }
	  } 
	  else{
		  
		/* 多选框取消所有父节点选中项的原理：
		   在死循环中判断兄弟节点是否含有选中项，如果有则跳出循环，没有则继续向上查找父节点并取消选中项直到跳出循环 */
		
		
		 o_tmp.push(this.Menu.parentNode(o_node)); //把当前节点的父节点压入堆栈
		
		 while(b && o_tmp.length > 0){
		   var o = o_tmp.pop();	//获取节点  	  
		  
		   //遍历子节点
		   for(var n in o.children){	
		     //判断兄弟节点是否含有选中项
			 if(this.element[o.children[n].id].getElementsByTagName("input")[0].checked){
				 b = false; break;
			 }
		   }
		   if(b){
			   this.element[o.id].getElementsByTagName("input")[0].checked = false; //取消父节点的选中项
		   }
		  
		   o = this.Menu.parentNode(o); //获取父节点
		   if(o.id != undefined){
			   o_tmp.push(o);
		   }
		 }
	  }
  },
  //创建连线，如果父节点是最后一个兄弟节点则不加连线
  CreateLine:function(obj){
  
	 var l = [],
	 	 o_tmp = [],
	 	 o_p = this.Menu.parentNode(obj); //获取当前节点的父节点
		 
	 if(o_p.id != undefined){ //判断是否为顶级节点
		 o_tmp.push(o_p); //把当前节点的父节点压入堆栈
			
		 while(o_tmp.length > 0){
			 
			var o = o_tmp.pop();	//获取节点 
			
			if(this.Menu.nextSibling(o).id != undefined){ //判断是否为最后一个兄弟节点
				l.unshift(this.icon.line);
			}else{
				l.unshift(this.icon.empty);
			}
			o = this.Menu.parentNode(o); //获取父节点
			
			if(o.id != undefined){
				o_tmp.push(o);
			}
		 }
	 }
	 return l;
  },
  //显示当前节点的连线
  ShowIcon:function(obj, checked){
	  if(this.Menu.parentNode(obj).id == undefined && this.Menu.previousSibling(obj).id == undefined){ //判断是否为顶级节点的第一个兄弟节点
		  if(this.Menu.tree.length == 1){
			  return checked ? this.icon.lineMinusOne : this.icon.linePlusOne;
		  }else{
			  return checked ? this.icon.lineMinusTop : this.icon.linePlusTop;
		  }
	  }
	  
	  if(this.Menu.hasChildNodes(obj)){ //判断当前节点是否有子节点
		  if(this.Menu.nextSibling(obj).id != undefined){ //是否为最后一个兄弟节点
			  return checked ? this.icon.lineMinus : this.icon.linePlus;
		  }else{
			  return checked ? this.icon.lineMinusBottom : this.icon.linePlusBottom;
		  }
	  }else{
		  if(this.Menu.nextSibling(obj).id != undefined){ //是否为最后一个兄弟节点
			  return this.icon.join;
		  }else{
			  return this.icon.joinBottom;
		  }
	  }
  }
});