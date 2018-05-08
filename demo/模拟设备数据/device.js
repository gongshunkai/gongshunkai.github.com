/*!
 * device.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2018-5-8
 *
 */


(function(root){

	var Tool = {};

	var Device = function(){
		this.init.apply(this,arguments);
	};

	Device.prototype = {
		init:function(options){
			this.opts = Tool.extend({},Device.defaults,options);
			this.data = Tool.extend({},Device.data);
		},
		setPlatform:function(params){
			var platform = Tool.getPlatform(this.data.useragent.toLowerCase());
			for(var n in Device.platformObj){
		        var v = Device.platformObj[n];

		        if(n == platform)
		            Tool.extend(this.data,{
		                platform:params[v]
		            });
		    }
		},
		setBrowser:function(){
			var browser = this.data.browser;
			for(var n in Device.browserObj){
		        var v = Device.browserObj[n];
		        if(n == browser)
		            Tool.extend(this.data,v,{
		            	oscpu:v.oscpu ? v.oscpu.call(this) : this.data.oscpu,
		                touchSupport:v.touchSupport ? v.touchSupport.call(this) : this.data.touchSupport,
		                getBattery:v.getBattery ? v.getBattery.call(this) : this.data.getBattery
		            });
		    }
		},
		setPlugins:function(){
			var count = this.data.plugins.length - Tool.randomNum(1,this.data.plugins.length);
			for(var i=0,index=0;i<count;i++){
				index = Tool.randomNum(0,this.data.plugins.length-1);
				this.data.plugins.splice(index,1);
			}
			this.data.plugins = this.data.plugins.sort();
		},
		setFonts:function(){
			var count = this.data.fonts.length - Tool.randomNum(1,this.data.fonts.length);
			for(var i=0,index=0;i<count;i++){
				index = Tool.randomNum(0,this.data.fonts.length-1);
				this.data.fonts.splice(index,1);
			}
			this.data.fonts = this.data.fonts.sort();
		},
		set:function(){

		    var params = Tool.newSource(Device.source);

		    this.data.useragent = this.opts.useragent;
		    this.data.colorDepth = params.colorDepth;
		    this.data.flash = params.flash;
		    this.data.java = params.java;
		    this.data.language = params.language;
		    this.data.browser = Tool.getBrowser(this.data.useragent.toLowerCase());

			this.setPlatform(params);
			this.setBrowser();
			this.setPlugins();
			this.setFonts();

		    return this.data;
		}
	};

	Device.defaults = {
		useragent:navigator.userAgent
	};

	Device.source = {
	    colorDepth:['8','16','24','32'],
	    flash:['9.0.283','9.0.289','10.1.85','10.1.102','10.2.152','10.2.153','10.3.181','10.3.183','11.0.1','11.1.102','11.2.202','11.3.300','11.4.402','11.5.502','11.6.602','11.7.700','11.8.800','11.9.900','12.0.0','13.0.0','14.0.0','15.0.0','16.0.0','17.0.0','18.0.0','19.0.0','20.0.0','21.0.0','22.0.0','23.0.0','24.0.0','25.0.0','26.0.0','27.0.0','28.0.0'],
	    java:['0','1'],
	    language:['zh-cn','zh-tw','zh-hk','en-hk','en-us','en-gb','en-ww','en-ca','en-au','en-ie','en-fi','fi-fi','en-dk','da-dk','en-il','he-il','en-za','en-in','en-no','en-sg','en-nz','en-id','en-ph','en-th','en-my','en-xa','ko-kr','ja-jp','nl-nl','nl-be','pt-pt','pt-br','fr-fr','fr-lu','fr-ch','fr-be','fr-ca','es-la','es-es','es-ar','es-us','es-mx','es-co','es-pr','de-de','de-at','de-ch','ru-ru','it-it','el-gr','no-no','hu-hu','tr-tr','cs-cz','sl-sl','pl-pl','sv-se','es-cl'],
	    linux:['Linux i386','Linux i486','Linux i586','Linux i686','Linux armv71','Linux armv81','Linux armv91'],
	    win:['Win16','Win32','Win64','WinCE'],
	    mac:['Mac68k','MacPPC','MacIntel'],
	    ipad:['iPad'],
	    iphone:['iPhone']
	};

	Device.data = {
		/*navigator*/
		useragent:'',
		java:0,
		flash:'',
	    language:'',
	    cpuClass:void 0,
	    platform:void 0,
	    doNotTrack:void 0,
	    hardwareConcurrency:void 0,
	    touchSupport:[0,0,0],
	    oscpu:void 0,
	    productSub:void 0,
	    getUserMedia:false,
	    geolocation:false,
	    getBattery:false,
	    sendBeacon:false,
	    vibrate:false,
	    credentials:false,

	    /*Object*/
	    observe:false,

		/*screen*/
		colorDepth:'',
	       
	    browser:'',

	    evalToString:33,
	    errorToSource:false,
		
	    /*h5*/
	    openDatabase:false,
	    devicePixelRatio:false,
	    speechSynthesis:false,
	    AudioContext:false,
	    BroadcastChannel:false,
	    FontFace:false,
	    URL:false,
	    Permissions:false,
	    opener:false,
	    Gamepad:false,
	    performance:false,
	    RTCPeerConnection:false,
	    crypto:false,
	    IntersectionObserver:false,
	    Bluetooth:false,
	    matchMedia:false,
   
	    /*event*/
	    onorientationchange:false,
	    onhashchange:false,
	    onunhandledrejection:false,
	    onrejectionhandled:false,

	    /*css*/
	    'zoom-out':false,
	    'font-display':false,
	    'font-stretch':false,
	    'font-kerning':false,
	    'caret-color':false,
	    'offset-path':false,
	    'motion-path':false,
	    'scroll-behavior':false,
	    'zoom':false,
	    'flow-root':false,

	    /*attribute*/
	    placeholder:false,
	    min:false,
	    autocomplete:false,
	    autofocus:false,

	    /*element*/
	    requestPointerLock:false,    

	    plugins:[
			{
				"name":"360MMPlugin",
				"description":"360MMPlugin",
				"type":"application/x360mmplugin",
				"suffixes":"dll"
			},
			{
				"name":"360SoftMgrPlugin",
				"description":"360SoftMgrPlugin",
				"type":"application/360softmgrplugin",
				"suffixes":"dll"
			},
			{
				"name":"360安全卫士 快速登录",
				"description":"360安全卫士 快速登录",
				"type":"application/mozilla-npqihooquicklogin",
				"suffixes":""
			},
			{
				"name":"APlayer ActiveX hosting plugin",
				"description":"APlayer III ActiveX hosting plugin for Firefox",
				"type":"application/x-thunder-aplayer",
				"suffixes":"ocx"
			},
			{
				"name":"Adobe Acrobat",
				"description":"Adobe Acrobat Plug-In Version 7.00 for Netscape",
				"type":"application/pdf~pdf,application/vnd.fdf~fdf,application/vnd.adobe.xfdf~xfdf,application/vnd.adobe.xdp+xml~xdp,application/vnd.adobe.xfd+xml",
				"suffixes":"xfd"
			},
			{
				"name":"AliSSOLogin plugin",
				"description":"npAliSSOLogin Plugin",
				"type":"application/npalissologin",
				"suffixes":"AliSSOLogin"
			},
			{
				"name":"AliWangWang Plug-In For Firefox and Netscape",
				"description":"npwangwang",
				"type":"application/ww-plugin",
				"suffixes":"dll"
			},
			{
				"name":"Alipay Security Control 3",
				"description":"Alipay Security Control",
				"type":"application/x-alisecctrl-plugin",
				"suffixes":"*"
			},
			{
				"name":"Alipay Security Payment Client Suit",
				"description":"Alipay Internet Health Control",
				"type":"application/x-aliinethealth-plugin",
				"suffixes":"*"
			},
			{
				"name":"Alipay security control",
				"description":"npaliedit",
				"type":"application/aliedit",
				"suffixes":""
			},
			{
				"name":"Alipay webmod control",
				"description":"npalidcp",
				"type":"application/alidcp",
				"suffixes":""
			},
			{
				"name":"BaiduYunGuanjia Application",
				"description":"YunWebDetect",
				"type":"application/bd-npyunwebdetect-plugin",
				"suffixes":""
			},
			{
				"name":"Baofeng StormPlayer 5",
				"description":"Web player NPPlugin",
				"type":"application/baofengwebplayer-plugin~rts,x-application/baofengwebplayer-plugin",
				"suffixes":""
			},
			{
				"name":"Baofeng StormPlayer WebBrowser Plugin",
				"description":"Baofeng Web Browser plugin",
				"type":"application/baofeng-webbrowser-plugin~,application/x-baofeng-webbrowser-plugin",
				"suffixes":""
			},
			{
				"name":"CFCA npSecEditCtl.BOC.x86 1.0",
				"description":"CFCA SecEditCtl 1.0 for Firefox, Chrome, Safari and Opera",
				"type":"application/npseceditctl.boc.x86",
				"suffixes":"dll"
			},
			{
				"name":"CMBEdit Plugin",
				"description":"China Merchants Bank Edit",
				"type":"aapplication/x-cmbedit",
				"suffixes":""
			},
			{
				"name":"China Online Banking Assistant",
				"description":"COBA Plugin DLL",
				"type":"application/coba",
				"suffixes":"*"
			},
			{
				"name":"Google Update",
				"description":"Google Update",
				"type":"application/x-vnd.google.update3webcontrol.3~,application/x-vnd.google.oneclickctrl.9",
				"suffixes":""
			},
			{
				"name":"QQGamePlugin Pro",
				"description":"QQWebGamePlugin Pro",
				"type":"application/npqqwebgame",
				"suffixes":"rts"
			},
			{
				"name":"QQMail Plugin",
				"description":"QQMail plugin for WebKit #1.0.0.22",
				"type":"application/x-tencent-qmail-webkit~,application/x-tencent-qmail",
				"suffixes":""
			},
			{
				"name":"QQÒôÀÖ²¥·Å¿Ø¼þ",
				"description":"QQÒôÀÖ²¥·Å¿Ø¼þ",
				"type":"application/tecent-qzonemusic-plugin",
				"suffixes":"rts"
			},
			{
				"name":"SangforECPlugin",
				"description":"Sangfor EasyConnect浏览器插件",
				"type":"application/x-npecplugin",
				"suffixes":""
			},
			{
				"name":"Shockwave Flash",
				"description":"Shockwave Flash 28.0 r0",
				"type":"application/x-shockwave-flash~swf,application/futuresplash",
				"suffixes":"spl"
			},
			{
				"name":"Silverlight Plug-In",
				"description":"5.1.20513.0",
				"type":"application/x-silverlight~scr,application/x-silverlight-2",
				"suffixes":""
			},
			{
				"name":"Tencent FTN plug-in",
				"description":"Tencent FTN plug-in",
				"type":"application/txftn-webkit",
				"suffixes":""
			},
			{
				"name":"Tencent QQ",
				"description":"Tencent QQ CPHelper plugin for Chrome",
				"type":"application/qscall-plugin",
				"suffixes":"dll"
			},
			{
				"name":"Tencent SSO Platform",
				"description":"QQ QuickLogin Helper",
				"type":"application/nptxsso",
				"suffixes":""
			},
			{
				"name":"XunLei Plugin",
				"description":"Xunlei scriptability Plugin",
				"type":"application/np_xunlei_plugin",
				"suffixes":"*"
			},
			{
				"name":"XunLei User Plugin",
				"description":"Xunlei User scriptability Plugin,version= 2.0.2.3",
				"type":"application/npxluser_plugin",
				"suffixes":""
			},
			{
				"name":"YoukuAgent",
				"description":"YoukuAgent",
				"type":"application/x-youkuagent",
				"suffixes":""
			},
			{
				"name":"iTrusChina iTrusPTA,XEnroll,iEnroll,hwPTA,UKeyInstalls Firefox Plugin",
				"description":"iTrusPTA&XEnroll hwPTA,IEnroll,UKeyInstalls for FireFox,version=1.0.0.2",
				"type":"application/pta.itruspta.version.1~*,application/cenroll.cenroll.version.1~,application/itrusenroll.certenroll.version.1~,application/hwpta.itrushwpta~,application/hwwdkey.installwdkey~,application/hwepass2001.installepass2001",
				"suffixes":""
			},
			{
				"name":"npQQPhotoDrawEx",
				"description":"npQQPhotoDrawEx Module",
				"type":"application/tencent-qqphotodrawex2-plugin",
				"suffixes":"rts"
			},
			{
				"name":"npalicdo plugin",
				"description":"npalicdo",
				"type":"application/npalicdo",
				"suffixes":"dll"
			}
		],
		fonts:[
			"Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Garamond", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3",
			"Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER", "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville", "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD", "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed", "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara", "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer", "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold", "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Eras Bold ITC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark", "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "FrankRuehl", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC", "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER", "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT", "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "GulimChe", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "BrowalliaUPC", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD", "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV", "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Incised901 Bd BT", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Pegasus", "Incised901 BT", "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN", "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic", "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti", "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli", "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN", "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla", "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood", "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Snap ITC", "Snell Roundhand", "Socket", "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC", "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Long Island", "Tw Cen MT Condensed Extra Bold", "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin", "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF", "American Typewriter", "Cordia New", "CordiaUPC", "Hiragino Mincho ProN", "Small Fonts", "Tamil Sangam MN"
		]
	};

	Device.platformObj = {
	    'Windows Phone':'win',
	    'Windows':'win',
	    'Android':'linux',
	    'Linux':'linux',
	    'iPhone':'iphone',
	    'iPad':'ipad',
	    'Mac':'mac'
	};

	Device.browserObj = {
	    'Firefox':{
	    	/*navigator*/
	        cpuClass:void 0,
	        doNotTrack:'unspecified',
	        hardwareConcurrency:'4',
	        touchSupport:function(){
	            return [0,1,1];
	        },
	        oscpu:function(){
	        	return this.data.platform;
	        },
	        productSub:20100101,
	        getUserMedia:true,
		    geolocation:true,
	        getBattery:function(){
		    	return false;
		    },
		    sendBeacon:true,
		    vibrate:false,
		    credentials:false,

		    /*Object*/
		    observe:true,

	        evalToString:37,
	        errorToSource:true,

	        /*h5*/
		    openDatabase:true,
		    devicePixelRatio:true,
		    speechSynthesis:false,
		    AudioContext:true,
		    BroadcastChannel:true,
		    FontFace:true,
		    URL:true,
		    Permissions:true,
		    opener:true,
		    Gamepad:true,
		    performance:true,
		    RTCPeerConnection:true,
		    crypto:true,
		    IntersectionObserver:true,
		    Bluetooth:false,
		    matchMedia:true,

		    /*event*/
		    onorientationchange:false,
		    onhashchange:true,
		    onunhandledrejection:false,
		    onrejectionhandled:false,

		    /*css*/
		    'zoom-out':false,
		    'font-display':false,
		    'font-stretch':true,
		    'font-kerning':true,
		    'caret-color':true,
		    'offset-path':false,
		    'motion-path':false,
		    'scroll-behavior':false,
		    'zoom':false,
		    'flow-root':true,

		    /*attribute*/
		    placeholder:true,
		    min:true,
		    autocomplete:true,
		    autofocus:true,

		    /*element*/
		    requestPointerLock:false    
	    },
	    'Opera':{
	    	/*navigator*/
	        cpuClass:void 0,
	        doNotTrack:void 0,
	        hardwareConcurrency:'4',
	        touchSupport:function(){
	            return [Tool.randomNum(3,5),1,1];
	        },
	        oscpu:function(){
	        	return void 0;
	        },
	        productSub:20030107,
	        getUserMedia:true,
		    geolocation:true,
		    getBattery:function(){
		    	return {'charging':Tool.randomNum(0,1),'level':Math.random().toFixed(2)};
		    },
		    sendBeacon:true,
		    vibrate:false,
		    credentials:true,

		    /*Object*/
		    observe:true,

	        evalToString:33,
	        errorToSource:false,
	        
	        /*h5*/
		    openDatabase:true,
		    devicePixelRatio:true,
		    speechSynthesis:true,
		    AudioContext:true,
		    BroadcastChannel:true,
		    FontFace:true,
		    URL:true,
		    Permissions:true,
		    opener:true,
		    Gamepad:true,
		    performance:true,
		    RTCPeerConnection:true,
		    crypto:true,
		    IntersectionObserver:true,
		    Bluetooth:true,
		    matchMedia:true,

		    /*event*/
		    onorientationchange:false,
		    onhashchange:true,
		    onunhandledrejection:true,
		    onrejectionhandled:true,

		    /*css*/
		    'zoom-out':false,
		    'font-display':true,
		    'font-stretch':true,
		    'font-kerning':true,
		    'caret-color':true,
		    'offset-path':true,
		    'motion-path':true,
		    'scroll-behavior':true,
		    'zoom':true,
		    'flow-root':true,

		    /*attribute*/
		    placeholder:true,
		    min:true,
		    autocomplete:true,
		    autofocus:true,

		    /*element*/
		    requestPointerLock:false    
	    },
	    'Chrome':{
	        /*navigator*/
	        cpuClass:void 0,
	        doNotTrack:void 0,
	        hardwareConcurrency:'4',
	        touchSupport:function(){
	            return [Tool.randomNum(3,5),1,1];
	        },
	        oscpu:function(){
	        	return void 0;
	        },
	        productSub:20030107,
	        getUserMedia:true,
		    geolocation:true,
		    getBattery:function(){
		    	return {'charging':Tool.randomNum(0,1),'level':Math.random().toFixed(2)};
		    },
		    sendBeacon:true,
		    vibrate:false,
		    credentials:true,

		    /*Object*/
		    observe:true,

	        evalToString:33,
	        errorToSource:false,
	        
	        /*h5*/
		    openDatabase:true,
		    devicePixelRatio:true,
		    speechSynthesis:true,
		    AudioContext:true,
		    BroadcastChannel:true,
		    FontFace:true,
		    URL:true,
		    Permissions:true,
		    opener:true,
		    Gamepad:true,
		    performance:true,
		    RTCPeerConnection:true,
		    crypto:true,
		    IntersectionObserver:true,
		    Bluetooth:true,
		    matchMedia:true,

		    /*event*/
		    onorientationchange:false,
		    onhashchange:true,
		    onunhandledrejection:true,
		    onrejectionhandled:true,

		    /*css*/
		    'zoom-out':false,
		    'font-display':true,
		    'font-stretch':true,
		    'font-kerning':true,
		    'caret-color':true,
		    'offset-path':true,
		    'motion-path':true,
		    'scroll-behavior':true,
		    'zoom':true,
		    'flow-root':true,

		    /*attribute*/
		    placeholder:true,
		    min:true,
		    autocomplete:true,
		    autofocus:true,

		    /*element*/
		    requestPointerLock:false
	    },
	    'Safari':{
	    	/*navigator*/
	        cpuClass:void 0,
	        doNotTrack:void 0,
	        hardwareConcurrency:void 0,
	        touchSupport:function(){
	            return [0,1,1];
	        },
	        oscpu:function(){
	        	return void 0;
	        },
	        productSub:20030107,
	        getUserMedia:true,
		    geolocation:true,
		    getBattery:function(){
		    	return false;
		    },
	        sendBeacon:false,
		    vibrate:false,
		    credentials:false,

		    /*Object*/
		    observe:true,

	        evalToString:37,
	        errorToSource:false,
	        
	        /*h5*/
		    openDatabase:true,
		    devicePixelRatio:true,
		    speechSynthesis:true,
		    AudioContext:true,
		    BroadcastChannel:false,
		    FontFace:true,
		    URL:true,
		    Permissions:false,
		    opener:true,
		    Gamepad:true,
		    performance:true,
		    RTCPeerConnection:true,
		    crypto:true,
		    IntersectionObserver:false,
		    Bluetooth:false,
		    matchMedia:true,

		    /*event*/
		    onorientationchange:false,
		    onhashchange:true,
		    onunhandledrejection:false,
		    onrejectionhandled:false,

		    /*css*/
		    'zoom-out':false,
		    'font-display':false,
		    'font-stretch':false,
		    'font-kerning':true,
		    'caret-color':false,
		    'offset-path':false,
		    'motion-path':false,
		    'scroll-behavior':false,
		    'zoom':true,
		    'flow-root':false,

		    /*attribute*/
		    placeholder:true,
		    min:true,
		    autocomplete:true,
		    autofocus:false,

		    /*element*/
		    requestPointerLock:true  
	    },
	    'Internet Explorer':{
	        
	    }
	};


	/*********************工具方法**********************************/

	Tool.extend = function(obj) {
		for(var i=0,source;source=Array.prototype.slice.call(arguments, 1)[i++];){
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	};

	Tool.randomNum = function(min,max){
	    var range = max - min;
	    var rand = Math.random();  
	    var num = min + Math.round(rand * range);
	    return num;
	};

	Tool.newSource = function(source){
	    for(var n in source){
	        var i = Tool.randomNum(0,source[n].length-1);
	        source[n] = source[n][i];
	    }
	    return source;
	};

	Tool.getPlatform = function(ua){
	    return ua.indexOf("windows phone") >= 0 ? "Windows Phone" : ua.indexOf("win") >= 0 ? "Windows" : ua.indexOf("android") >= 0 ? "Android" : ua.indexOf("linux") >= 0 ? "Linux" : ua.indexOf("iphone") >= 0 ? "iPhone" : ua.indexOf("ipad") >= 0 ? "iPad" : ua.indexOf("mac") >= 0 ? "Mac" : "Other";
	};

	Tool.getBrowser = function(ua){
	    return ua.indexOf("firefox") >= 0 ? "Firefox" : ua.indexOf("opera") >= 0 || ua.indexOf("opr") >= 0 ? "Opera" : ua.indexOf("chrome") >= 0 ? "Chrome" : ua.indexOf("safari") >= 0 ? "Safari" : ua.indexOf("trident") >= 0 ? "Internet Explorer" : "Other";
	};

	/******************** 暴露外部方法 ***********************************/

	root.Device = function(options){
		return new Device(options);
	};

})(this);