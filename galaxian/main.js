xengine.game.run(function(){
	
	var sc = new Scene({w:400,h:500,color:'#222'});
	xengine.director.push(sc);
	
	sc.addListener(new xengine.EventListener({
		"beforeRender":function(){
			
		},
		"afterRender":function(){
			if(sc.player.life < 1){
				sc.menu.isVisible = true;
				sc.restart.isVisible = true;
				sc.isAttack = false;
			}
			if(cfg.level > cfg.maxLev){
				sc.menu.isVisible = true;
				sc.restart.isVisible = true;
				sc.isAttack = false;
			}
			if(cfg.enemyNum < 1 && cfg.level <= cfg.maxLev){
				cfg.level++;
				sc.isXFlip = true;
				sc.removeChild(sc.layer);
				sc.createEnemy();
			}
		}
	}));
		
	var posX = 0;
	//鼠标事件
	xengine.Mouse.sDLG("down",function(e){							  
		posX = e.clientX - sc.player.x;	
	});
	xengine.Mouse.sDLG("move",function(e){								  
		if(xengine.Mouse.gBtnState(e.button) && e.clientX-posX > sc.x+sc.player.w*0.5 && e.clientX-posX < sc.w-sc.player.w*1.5){
			sc.player.x = e.clientX-posX;
		}
	});
	xengine.Mouse.sDLG("click",function(e){
										//alert(sc.restart.isMouseIn());
		if(sc.restart.isMouseIn()){
			//alert('restart');
		}
	});
	//触摸事件
	xengine.Touch.sDLG("start",function(e){							  
		var touch = e.touches[0]; //获取第一个触点
		posX = touch.clientX - sc.player.x;
	});
	xengine.Touch.sDLG("move",function(e){								  
		var touch = e.touches[0]; //获取第一个触点
		if(xengine.Touch.gState() && touch.clientX-posX > sc.x+sc.player.w*0.5 && touch.clientX-posX < sc.w-sc.player.w*1.5){
			sc.player.x = touch.clientX-posX;
		}
	});
	
	/*document.ontouchstart = function(e){
		var touch = e.touches[0]; //获取第一个触点
		posX = touch.pageX - sc.player.x;
		
		document.ontouchmove = function(e){
			var touch = e.touches[0]; //获取第一个触点
			if(touch.pageX-posX > sc.x+sc.player.w*0.5 && touch.pageX-posX < sc.w-sc.player.w*1.5){
				sc.player.x = touch.pageX-posX;
			}
		};
		document.ontouchend = function(){
			document.ontouchmove = null;
		};
	};*/
	
	window.onresize = function(){ sc.resize(); }
},30);


						   
