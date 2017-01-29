
'use strict';

(function (win) {
    //配置baseUrl
    var baseUrl = document.getElementById('main').getAttribute('data-baseurl');

    /*
     * 文件依赖
     */
    var config = {
        baseUrl: baseUrl,           //依赖相对路径
        paths: {                    //如果某个前缀的依赖不是按照baseUrl拼接这么简单，就需要在这里指出
            'box2d': 'libs/box2d',
			'jquery.mousewheel': 'libs/jquery.mousewheel',
            'jquery': 'libs/jquery1.12.0.min',
			'xengine.box': 'engine/xengine.box',
			'xengine.fsm': 'engine/xengine.fsm',
            'xengine': 'engine/xengine',
            'xengine.map': 'engine/xengine.map',
            'xengine.music': 'engine/xengine.music',
			'xengine.particle': 'engine/xengine.particle',
			'xengine.resource': 'engine/xengine.resource',
			'xengine.util': 'engine/xengine.util',
			
			'bullet': 'galaxian/js/bullet',
			'enemy': 'galaxian/js/enemy',
			'game': 'galaxian/js/game',
			'menu': 'galaxian/js/menu',
			'player': 'galaxian/js/player',
			'shooter': 'galaxian/js/shooter',
			'text': 'galaxian/js/text'
        },
        shim: {                     //引入没有使用requirejs模块写法的类库。xengine依赖jquery
			'box2d': {
                exports: 'Box2D'
            },
            'jquery': {
                exports: '$'
            },
			'jquery.mousewheel': {
				deps: ['jquery']
            },
            'xengine': {
                deps: ['jquery','jquery.mousewheel'],
                exports: 'xengine'
            },
			'xengine.box': {
                deps: ['xengine']
            },
			'xengine.fsm': {
                deps: ['xengine']
            },
			'xengine.map': {
                deps: ['xengine']
            },
			'xengine.music': {
                deps: ['xengine']
            },
			'xengine.particle': {
                deps: ['xengine']
            },
			'xengine.resource': {
                deps: ['xengine']
            },
			'xengine.util': {
                deps: ['xengine']
            },
			
			'bullet': {
                deps: ['xengine']
            },
			'enemy': {
                deps: ['xengine','shooter']
            },
			'game': {
                deps: ['xengine','player','enemy','bullet','text','menu']
            },
			'menu': {
                deps: ['xengine']
            },
			'player': {
                deps: ['xengine','shooter']
            },
			'shooter': {
                deps: ['xengine']
            },
			'text': {
                deps: ['xengine']
            }
        }
    };

    require.config(config);

    //xengine会把自己加到全局变量中
    require(['xengine','xengine.box','xengine.fsm','xengine.util','game'], function(){	

        xengine.game.run(function(){
	
			var sc = new Scene({w:400,h:500,color:'#222'});
			xengine.director.push(sc);
			
			sc.addListener(new xengine.EventListener({
				"beforeRender":function(){
					
				},
				"afterRender":function(){
					//处理游戏过关
					if(sc.enemyNum < 1){
						if(sc.level > cfg.maxLev){
							sc.menu || sc.createMenu();
							sc.isAttack = false;
						}else{
							++sc.level;
							sc.isXFlip = true;
							sc.removeChild(sc.layer);
							sc.createEnemy();
						}
					}
					//处理游戏结束
					if(sc.player.life < 1){
						sc.menu || sc.createMenu();
						sc.isAttack = false;
					}
				}
			}));
				
			var posX = 0;
			//鼠标事件
			xengine.Mouse.sDLG("down",function(e){							  
				posX = e.clientX - sc.player.x;	
			});
			xengine.Mouse.sDLG("move",function(e){								  
				if(xengine.Mouse.gBtnState(e.button) && e.clientX-posX > sc.x+sc.player.w && e.clientX-posX < sc.w-sc.player.w){
					sc.player.x = e.clientX-posX;
				}
			});
			xengine.Mouse.sDLG("click",function(e){								
				if(sc.restart && sc.restart.isMouseIn()){
					sc.clearAll();
					sc.loadGame();
				}
			});
			//触摸事件
			xengine.Touch.sDLG("start",function(e){
				posX = e.clientX - sc.player.x;
			});
			xengine.Touch.sDLG("move",function(e){
				if(xengine.Touch.gState() && e.clientX-posX > sc.x+sc.player.w && e.clientX-posX < sc.w-sc.player.w){
					sc.player.x = e.clientX-posX;
				}
			});
			
			/*document.ontouchstart = function(e){
				var touch = e.touches[0]; //获取第一个触点
				posX = touch.pageX - sc.player.x;
				
				document.ontouchmove = function(e){
					var touch = e.touches[0]; //获取第一个触点
					if(touch.pageX-posX > sc.x+sc.player.w && touch.pageX-posX < sc.w-sc.player.w){
						sc.player.x = touch.pageX-posX;
					}
				};
				document.ontouchend = function(){
					document.ontouchmove = null;
				};
			};*/
			
			win.onresize = function(){ sc.resize(); }
		},20);
    });

})(this);


						   
