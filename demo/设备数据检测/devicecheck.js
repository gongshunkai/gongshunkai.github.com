/*!
 * device.js 1.0
 *
 * Author: 龚顺凯 49078111@qq.com
 * Update: 2018-5-8
 *
 */


(function(root){

	function n(e) {
		var n = e[0].toUpperCase() + e.slice(1),
			t = window[e] || window["moz" + n] || window["webkit" + n];
		if (!t) return "0_0";
		try {
			t.setItem(p, 1), t.removeItem(p)
		} catch (o) {
			return "1_0"
		}
		return "1_1"
	}

	function t() {
		var e = new Error;
		return !!e.toSource
	}

	function o() {
		return !(!_ || !_.getContext)
	}

	function i() {
		var e = [],
			n = navigator.plugins;
		if (n && "object" == typeof n) {
			for (var t in n) n.hasOwnProperty(t) && n[t].name && e.push({
				name: n[t].name,
				desc: n[t].description
			});
			if (e.length) return JSON.stringify(e)
		}
	}

	function a() {
		var e = document.createElement("div");
		e.style.height = "1px", e.className = "adsbox", document.body.appendChild(e);
		var n = 0 === e.offsetHeight;
		return document.body.removeChild(e), n
	}

	function d() {
		var e = 0,
			n = 0;
		"undefined" != typeof navigator.maxTouchPoints ? e = navigator.maxTouchPoints : "undefined" != typeof navigator.msMaxTouchPoints && (e = navigator.msMaxTouchPoints);
		try {
			document.createEvent("TouchEvent"), n = 1
		} catch (t) {}
		var o = "ontouchstart" in window ? 1 : 0;
		return [e, n, o].join("_")
	}

	function m(e, n) {
		if (!n.length) return -1;
		for (var t = [], o = 0; o < n.length; o++) t.push(e[n[o]]);
		return t.join("_")
	}

	function r() {
		return window.performance && window.performance.timing ? performance.timing.connectEnd - performance.timing.connectStart : -1
	}

	function f() {
		var e = v()
		return e ? !document[e] : -1
	}

	function v() {
		var e = ["webkit", "moz", "ms", "o"];
		if ("hidden" in document) return "hidden";
		for (var n = 0; n < e.length; n++) {
			var t = e[n] + "Hidden";
			if (t in document) return t
		}
	}

	function u() {
		function e(e) {
			window.setTimeout(e, 1e3 / 60)
		}
		function n() {
			var e = arguments.callee;
			a(function() {
				if (o++, o > 12) {
					t = t.slice(2), t.sort(function(e, n) {
						return e - n
					});
					for (var n = t.length, a = 0, d = 0; n > d; d++) a += t[d];
					return void r.resolve([t[n - 1], t[0], a / n].join("_"))
				}
				var u = Date.now();
				t.push(u - i), i = u, e()
			})
		}
		var t = [],
			o = 0,
			i = Date.now(),
			r = new $.Deferred,
			a = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || e;
		return n(), r
	}

	function c() {
		var e = new $.Deferred;
		return navigator.getBattery ? navigator.getBattery().then(function(n) {
			e.resolve((n.charging ? 1 : 0) + "_" + n.level)
		}) : setTimeout(function() {
			e.resolve(!1)
		}), e
	}

	function s() {
		var e = new $.Deferred;
		return o() ? (setTimeout(function() {
			var n = _.getContext("2d");
			n.textBaseline = "top", n.font = "32px Arial", n.fillText("😃", 0, 0);
			for (var t = n.getImageData(16, 16, 1, 1).data, o = "", i = 0; i < t.length; i++) o += t[i];
			e.resolve(o)
		}), e) : (setTimeout(function() {
			e.resolve(!1)
		}), e)
	}

	var g = '',
		l = function(){
			var e = function() {
					return window.devicePixelRatio || 1
				},
				n = function() {
					return {
						zoom: 1,
						devicePxPerCssPx: 1
					}
				},
				t = function() {
					var n = Math.round(screen.deviceXDPI / screen.logicalXDPI * 100) / 100;
					return {
						zoom: n,
						devicePxPerCssPx: n * e()
					}
				},
				i = function() {
					var n = Math.round(document.documentElement.offsetHeight / window.innerHeight * 100) / 100;
					return {
						zoom: n,
						devicePxPerCssPx: n * e()
					}
				},
				o = function() {
					var n = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
					return {
						zoom: n,
						devicePxPerCssPx: n * e()
					}
				},
				r = function() {
					var n = Math.round(document.documentElement.clientWidth / window.innerWidth * 100) / 100;
					return {
						zoom: n,
						devicePxPerCssPx: n * e()
					}
				},
				d = function() {
					var n = 90 == Math.abs(window.orientation) ? screen.height : screen.width,
						t = n / window.innerWidth;
					return {
						zoom: t,
						devicePxPerCssPx: t * e()
					}
				},
				a = function() {
					var n = function(e) {
							return e.replace(/;/g, " !important;")
						},
						t = document.createElement("div");
					t.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0", t.setAttribute("style", n("font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;"));
					var i = document.createElement("div");
					i.setAttribute("style", n("width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;")), i.appendChild(t), document.body.appendChild(i);
					var o = 1e3 / t.clientHeight;
					return o = Math.round(100 * o) / 100, document.body.removeChild(i), {
						zoom: o,
						devicePxPerCssPx: o * e()
					}
				},
				u = function() {
					var e = m("min--moz-device-pixel-ratio", "", 0, 10, 20, 1e-4);
					return e = Math.round(100 * e) / 100, {
						zoom: e,
						devicePxPerCssPx: e
					}
				},
				c = function() {
					return {
						zoom: u().zoom,
						devicePxPerCssPx: e()
					}
				},
				s = function() {
					var n = window.top.outerWidth / window.top.innerWidth;
					return n = Math.round(100 * n) / 100, {
						zoom: n,
						devicePxPerCssPx: n * e()
					}
				},
				m = function(e, n, t, i, o, r) {
					function d(t, i, o) {
						var u = (t + i) / 2;
						if (0 >= o || r > i - t) return u;
						var c = "(" + e + ":" + u + n + ")";
						return a(c).matches ? d(u, i, o - 1) : d(t, u, o - 1)
					}
					var a, u, c, s;
					window.matchMedia ? a = window.matchMedia : (u = document.getElementsByTagName("head")[0], c = document.createElement("style"), u.appendChild(c), s = document.createElement("div"), s.className = "mediaQueryBinarySearch", s.style.display = "none", document.body.appendChild(s), a = function(e) {
						c.sheet.insertRule("@media " + e + "{.mediaQueryBinarySearch {text-decoration: underline} }", 0);
						var n = "underline" == getComputedStyle(s, null).textDecoration;
						return c.sheet.deleteRule(0), {
							matches: n
						}
					});
					var m = d(t, i, o);
					return s && (u.removeChild(c), document.body.removeChild(s)), m
				},
				h = function() {
					var e = n;
					return isNaN(screen.logicalXDPI) || isNaN(screen.systemXDPI) ? window.navigator.msMaxTouchPoints ? e = i : window.chrome && !(window.opera || navigator.userAgent.indexOf(" Opera") >= 0) ? e = o : Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0 ? e = r : "orientation" in window && "webkitRequestAnimationFrame" in window ? e = d : "webkitRequestAnimationFrame" in window ? e = a : navigator.userAgent.indexOf("Opera") >= 0 ? e = s : window.devicePixelRatio ? e = c : u().zoom > .001 && (e = u) : e = t, e
				}();
			return {
				zoom: function() {
					return h().zoom
				},
				device: function() {
					return h().devicePxPerCssPx
				}
			}
		},
		w = function(){
			function a() {
				var a = document.createElement("span");
				return a.style.position = "absolute", a.style.left = "-9999px", a.style.fontSize = d, a.style.lineHeight = "normal", a.innerHTML = l, S.appendChild(a), a
			}
			function e() {
				for (var a, e = 0, i = t.length; i > e; e++) a = t[e], o.style.fontFamily = a, T[a] = o.offsetWidth, s[a] = o.offsetHeight
			}
			function i(a) {
				for (var e = !1, i = 0, n = t.length; n > i; i++) {
					var r = t[i];
					if (o.style.fontFamily = '"' + a + '",' + r, e = o.offsetWidth !== T[r] || o.offsetHeight !== s[r]) return void B.push(a)
				}
			}
			function n() {
				function a() {
					var a = c[e],
						t = arguments.callee;
					i(a), setTimeout(function() {
						e++, n > e ? t() : (r.resolve(B), S.removeChild(o))
					}, 0)
				}
				var e = 0,
					n = c.length;
				a()
			}
			var o, r = new $.Deferred,
				t = ["monospace", "sans-serif", "serif"],
				l = "mmmmmmmmmmlli",
				d = "72px",
				T = {},
				s = {},
				B = [],
				S = document.getElementsByTagName("body")[0],
				c = ["Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Garamond", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"],
				u = ["Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER", "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville", "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD", "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed", "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara", "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer", "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold", "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Eras Bold ITC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark", "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "FrankRuehl", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC", "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER", "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT", "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "GulimChe", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "BrowalliaUPC", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD", "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV", "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Incised901 Bd BT", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Pegasus", "Incised901 BT", "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN", "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic", "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti", "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli", "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN", "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla", "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood", "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Snap ITC", "Snell Roundhand", "Socket", "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC", "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Long Island", "Tw Cen MT Condensed Extra Bold", "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin", "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF", "American Typewriter", "Cordia New", "CordiaUPC", "Hiragino Mincho ProN", "Small Fonts", "Tamil Sangam MN"];
			return c = c.concat(u), function() {
				return o = a(), e(), n(), r
			}
		},
		h = function(){
			function e() {
				var e = new $.Deferred,
					n = document.createElement("script");
				return n.type = "module", n.innerHTML = "window.__moduleScriptTestVariable__ = 1;", document.body.appendChild(n), setTimeout(function() {
					e.resolve( !! window.__moduleScriptTestVariable__)
				}, 300), e
			}
			function n(e, n) {
				return f[e] = n, !(f[e] !== n)
			}
			function o() {
				return f.color = "#33333333", !! f.color
			}
			function t() {
				var e = document.createElement("meter");
				return e && "max" in e
			}
			function r() {
				var e = ["webkit", "moz", "ms", "o"];
				if ("hidden" in document) return "hidden";
				for (var n = 0; n < e.length; n++) {
					var o = e[n] + "Hidden";
					if (o in document) return o
				}
			}
			function i() {
				w.innerHTML = ['<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ', 'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" ', 'width="1px" height="1px" viewBox="0 0 1 1" ', 'enable-background="new 0 0 1 1" xml:space="preserve">', '<polygon transform="scale(100,100)" ', 'points="5,8.292 1.91,10 2.5,6.382 0,3.819 3.455,3.291 5,', '0 6.545,3.291 10,3.819 7.5,6.382 8.09,10 "/>', "</svg>"].join("");
				var e = w.getElementsByTagName("svg");
				return e && e[0] && "viewBox" in e[0]
			}
			function c(e, n) {
				var o = e[0].toUpperCase() + e.slice(1),
					t = window[e] || window["moz" + o] || window["webkit" + o];
				return n ? !(!t || !t[n]) : !! t
			}
			function a(e) {
				return e in f || "-webkit-" + e in f || "-moz-" + e in f
			}
			function d() {
				var e = 0,
					n = new $.Deferred;
				return w.addEventListener("click", function() {
					e++
				}, {
					once: !0
				}), w.click && w.click(), w.click && w.click(), setTimeout(function() {
					n.resolve(1 === e)
				}), n
			}
			function u() {
				if (document.querySelectorAll) {
					try {
						document.querySelectorAll(":dir(rtl)")
					} catch (e) {
						return
					}
					return !0
				}
			}
			function l() {
				var e = document.createElement("video");
				if (!e.canPlayType) return -1;
				var n = {
					probably: 2,
					maybe: 1
				},
					o = n[e.canPlayType('video/ogg; codecs="theora, vorbis"')];
				return o ? o : 0
			}
			function s() {
				var s = new $.Deferred,
					f = [0, 0, !! navigator.sendBeacon, n("cursor", "zoom-out"), "placeholder" in m, a("font-stretch"), l(), o(), t(), !! r(), "hidden" in w, "onhashchange" in window, "devicePixelRatio" in window, a("all"), c("speechSynthesis"), i(), c("AudioContext"), a("font-display"), "opener" in window, c("BroadcastChannel"), !! Object.observe, c("FontFace"), c("URL"), c("Permissions"), c("Gamepad"), c("performance", "timing"), !! navigator.vibrate, a("font-kerning"), c("RTCPeerConnection"), c("performance", "now"), c("crypto", "getRandomValues"), c("IntersectionObserver"), !! navigator.credentials, a("caret-color"), !! w.requestPointerLock, a("offset-path") || a("motion-path"), c("Bluetooth"), c("matchMedia"), a("scroll-behavior"), u(), a("zoom"), "min" in m, "onunhandledrejection" in window && "onrejectionhandled" in window, "autocomplete" in m, n("display", "flow-root"), "autofocus" in m];
				return $.when(e(), d()).then(function(e, n) {
					f[0] = e, f[1] = n;
					for (var o = 0; o < f.length; o++) f[o] = f[o] ? 1 : 0;
					f = f.join(""), s.resolve(f)
				}), s
			}
			var m = document.createElement("input"),
				w = document.createElement("div"),
				f = w.style;
			return s
		},
		p = "taiji_test_item",
		_ = document.createElement("canvas");


	var Device = root.Device = {
		getDeviceData: function() {

			l = l();
			w = w();
			h = h();

			var e = new $.Deferred,
				o = ["width", "height", "availWidth", "availHeight", "availTop", "availLeft", "colorDepth", "pixelDepth"],
				v = {
					l: navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || "",
					tZ: (new Date).getTimezoneOffset(),
					iDB: !! (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB),
					ls: n("localStorage"),
					ses: n("sessionStorage"),
					oDb: !! window.openDatabase,
					eL: eval.toString().length,
					e2S: t(),
					c: !! navigator.cookieEnabled,
					dNT: navigator.doNotTrack ? navigator.doNotTrack : navigator.msDoNotTrack ? navigator.msDoNotTrack : window.doNotTrack ? window.doNotTrack : "unknown",
					p: i(),
					adb: a(),
					pS: navigator.productSub,
					j: !! navigator.javaEnabled,
					pf: navigator.platform,
					cc: navigator.hardwareConcurrency || 'unknown',
					t: d(),
					cam: !(!navigator.getUserMedia && !navigator.mozGetUserMedia),
					loc: !! navigator.geolocation,
					or: "onorientationchange" in window,
					dpr: window.devicePixelRatio || 1,
					doc: m(document.documentElement, ["offsetWidth", "offsetHeight"]),
					ws: m(window, ["screenX", "screenY"]),
					win: m(window, ["innerWidth", "innerHeight"]),
					scr: m(screen, o),
					la: r(),
					z: l.zoom(),
					v: f(),
					iframe: !(window === top),
					cpuClass:navigator.cpuClass,
					oscpu:navigator.oscpu
				};
			return $.when(w(), s(), h()).then(function(n, t, o) {
				v.f = JSON.stringify(n), v.cFp = t, v.h5 = JSON.stringify({
					ver: "1.0",
					v: o
				}), $.when(c(), u()).then(function(n, t) {
					v.b = n, v.raf = t, e.resolve(v)
				})
			}), e
		}
	};

})(this);