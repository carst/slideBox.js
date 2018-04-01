var debug = typeof(debug) !== 'undefined' ? debug : false,
	mobile = typeof(mobile) !== 'undefined' ? mobile : false;

// jshint ignore:start
var getScriptDir = (function() {

	var scripts = document.getElementsByTagName('script'),
	scriptPath = scripts[scripts.length-1].src.split('?')[0], // remove any ?query
	scriptDir = scriptPath.split('/').slice(0, -1).join('/')+'/'; // remove last filename part of path

	return function() { return scriptDir; };
})();

// jshint ignore: start

function createState(path, hash, title) {
	
	var state = {
		'path'	: path,
		'hash'	: hash,
		'title'	: title
	}
	
	return state;
	
}


function getState() {
	
	var indexPath = window.location.pathname,
		query = window.location.search.slice(1),
		hash = window.location.hash.substring(1),
		indexTitle = document.title,
		state = createState(indexPath, hash, indexTitle);
		
	if (debug) {
		console.log('indexPath: ' + indexPath);
		console.log('hash: ' + hash);
		console.log('indexTitle: ' + indexTitle);
	}
		
	return state;
	
}


function createPath(path, slug) {
	
	var	pathArray = path.split( '/' ),
		pathLength = pathArray.length,
		//newPath = pathLength > 2 ? '/' + pathArray[pathLength-2] + '/' + slug + '/' : '';
		newPath = path + slug + '/';
	
	if (debug) {
		//console.log('pathArray: ('+pathLength+')');
		//console.log(pathArray);
		//console.log('newPath: ' + newPath);
	}
	
	return newPath;
	
}


function loadState(state) {
	
	var itemPath = state.path,
		itemTitle = state.title;
	
	if (debug) {
		//console.log( 'new hash = ' + slug );
		console.log( 'itemPath = ' + itemPath );
		console.log( 'itemTitle = ' + itemTitle );
	}
	
	//document.location.hash = $box.attr('id');
	if (itemPath !== '') history.pushState('', itemTitle, itemPath);
	document.title = itemTitle;
	
}


function resetState() {
	
	document.location.hash = '';
	history.pushState('', indexTitle, indexPath);
	document.title = indexTitle;
	
}


function setScroll($box) {
	
	var $container = $box.parent();
	
	if ($box.hasClass('box-has-content')) { // Allow for vertical scroll
		$container.addClass('allow-scroll');
		if (debug) console.log('hello there');
	} else {
		$container.removeClass('allow-scroll');
	}

}

// jshint ignore: start

function setSlideBg($element, defer) {
		
	var $isImg = $element.is('img'),
		$img = $isImg ? $element : $element.find('img'),
		setBg = !$img.hasClass('bg-set') && !$img.hasClass('no-bg-load'),
		bgWasSet = false,
		bgSrc,
		$bgTarget,
		fullImg = new Image(),
		loaded = false;
	
	function findBgSrc($img) {
		
		var bgSrc,
			lazyLoadSrc = $img.data('src'),
			fullSrc = $img.data('srcFull'),
			fullSrcResp = $img.data('srcFullSl');
		
		if (mobile && typeof fullSrcResp !== 'undefined') bgSrc = fullSrcResp;
		else if (typeof fullSrc !== 'undefined') bgSrc = fullSrc;
		else if (defer && typeof lazyLoadSrc !== 'undefined') bgSrc = lazyLoadSrc;
		else if (!$img.hasClass('lazyload')) bgSrc = $img.attr('src');
		
		//console.log('defer : ' + defer);
		//console.log('lazyLoadSrc : ' + lazyLoadSrc);
		
		return bgSrc;
	}
	
	function findBgTarget($img) {
		
		$bgTarget = $img.hasClass('slide') ? $img : $img.parent();
	}
	
	function loadHandler() {
		
		$bgTarget
			.css('background-image', 'url(' + bgSrc + ')')
			.addClass('has-bg');
		
		$img
			.removeClass('loading')
			.addClass('bg-set');
		
		bgWasSet = true;
		
		if ($bgTarget.is('img')) {
			//$img.src = '';
			//console.log($img.attr('class'));
			$img.attr('src', slideBoxCm.imageDir + 'blank.gif');
		}
	}
	
	//if ($slide.is('a')) $img = $slide.find('img');
	if ($img.length > 0 && setBg) {
		
		//if (debug) console.log($img);
		
		bgSrc = findBgSrc($img);
		findBgTarget($img);
		//if (debug) 
		//console.log('bgSrc : ' + bgSrc);
		if (typeof bgSrc !== 'undefined') {
			$img.addClass('loading');
			fullImg.onload = loadHandler();
			fullImg.src = bgSrc;
		}
	}
	
	return bgWasSet;
	
}


function loadSlideBgs($targetBox) {
	
	var config = {
			slide : '.slide, .load-bg'
		};
	
	var $targetBox = $targetBox === undefined ? $('.box-active') : $targetBox;
	
	$targetBox.find(config.slide).each(function() {
		setSlideBg($(this));
	});
	
}


// jshint ignore: start

var slideBoxCm = {
	initialized : false,
	imageDir		: typeof(imageDir) !== 'undefined' ? imageDir : getScriptDir()+'../images/'
};

function initSlides(settings) {
	
	//console.log(getScriptDir());
	//console.log(slideBoxCm.imageDir);

	if (!slideBoxCm.initialized) {
		
		//if (debug) 
		//console.log('initSlides: slideBox is being initialized.');
		
		var defaults = {
			container	: '.slide-box', 
			slideBox		: '.slide-box',
			slide		: '.slide',
			slideBoxClick : false,
			setPath		: false,
			wrapSlides	: false,
			loopSlides	: false,
			interval		: 5000,
			debug		: debug
		},
		config = typeof(settings) === 'object' ? settings : defaults,

		$boxes = $(config.slideBox),
		$boxActive = $(),
		$boxZoomed = $('.box-zoomed'),
		boxDataCache = [],
		
		$slides = $boxes.find(config.slide),
		
		ytPromise,

		//wrapSlides = config.wrapSlides,
		//loopSlides = config.loopSlides,
		//interval = config.slideInterval,
		
		initialState = getState(),
		delta = {
			'prev'	: -1,
			'next'	: +1
		};
	
		//config.wrapSlides = slideCount > 1 && $container.hasClass('wrap-slides');
		//config.loopSlides = slideCount > 1 && $container.hasClass('auto-loop');
		
		if (config.debug) {
			console.log(config);
			//console.log('globalControls '+globalControls);
			//console.log($slides);
		}
	} else {
		if (debug) console.log('initSlides: slideBox was already initialized.');
	}
	
	function initBoxes() {
		
		/* PRELOAD CONTENT OF EACH BOX:
		
		1 which slides it contains
		2 the current slide position
		
		3 (later) local loop settings
		
		*/
		
		var $html5Videos = $boxes.find('video'),
			$ytEmbeds = $boxes.find('.video-yt'),
			$vimeoEmbeds = $boxes.find('.video-vimeo'),
			hasHtml5Videos = $html5Videos.length > 0,
			hasYtEmbeds = $ytEmbeds.length > 0,
			hasVimeoEmbeds = $vimeoEmbeds.length > 0,
			players = {};
			
			//console.log($ytEmbeds);
		
		function loadEmbedAPIs() {

			var tag,
				firstScriptTag;
		
			if (hasYtEmbeds) ytPromise = new Promise(function(onYouTubeIframeAPIReady) {

				window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
				
				tag = document.createElement('script');
				tag.src = "https://www.youtube.com/iframe_api";
				firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			});
			
			if (hasVimeoEmbeds) { // PROMISE??
				
				tag = document.createElement('script');
				tag.src = 'https://player.vimeo.com/api/player.js';
				firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
	
		}
		
		function pauseVideo($target) {
			
			var id = $target.attr('id');

			console.log('Pause video: '+id);
			//console.log(players);
			
			/// REGULAR HTML 5
			if ($target.is('video')) {
			
				$target.get(0).pause();
				//this.player.pause();
				//if ($(this)[0].player.pause()) 
			} else if ($target.hasClass('video-yt')) {
				
				players[id].pauseVideo();
				//console.log(players[id]);
				
			} else if ($target.hasClass('video-vimeo')) {
			
				players[id].pause();
				//console.log(players[id]);
			}
	
		}
		
		function handlePauseEvent(event) {
			
			var $target = $(event.target);
			/*if (config.debug) {
				console.log('Pause event Fired');
				console.log($target);
			}*/
			pauseVideo($target);
		}
		
		function addPlayerObject($target) {
			
			var id = $target.attr('id');
			//console.log($target.get(0));
			
			if ($target.hasClass('video-yt')) {
				if (config.debug) console.log('Adding YT Player '+id);
				players[id] = new YT.Player(id);
			} else if ($target.hasClass('video-vimeo')) {
				if (config.debug) console.log('Adding Vimeo Player '+id);
				players[id] = new Vimeo.Player($target.get(0));
			}
			
			$target.on('pauseVideo', handlePauseEvent);
			//console.log(players);
			
			//console.log(jQuery._data( $target.get(0) , "events" ));
			
			/*player = new YT.Player('existing-iframe-example', {
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});*/
		}
		
		$html5Videos.on('pauseVideo', handlePauseEvent);
		loadEmbedAPIs();
		
		$boxes.each(function () {
			
			var $box = $(this),
				$parent = $box.closest(config.container),
				boxIndex = $boxes.index($box),
				$slides = $box.find(config.slide),
				$videos = $box.find('video, .video-yt, .video-vimeo'),
				slideCount = $slides.length,
				$slideActive = $box.find('.slide-active'),
				hasActiveSlide = $slideActive.length > 0,
				isCarousel = $box.data('carousel') || $box.hasClass('box-carousel') || $box.hasClass('slide-box-carousel'),
				loopBox = $box.data('loop') || $box.hasClass('auto-loop') || $parent.hasClass('auto-loop'),
				interval = $box.data('interval') ? $box.data('interval') : config.interval,
				$controls = $parent.find('.controls'),
				$prev = $controls.find('.prev'),
				$next = $controls.find('.next'),
				$close = $controls.find('.close'),

				$pager = $box.find('.pager'),
				$pagerAnchors = $pager.find('a');
			
			if (!hasActiveSlide) $slideActive = $slides.eq(0);
			
			if (slideCount === 1) $next.addClass('disabled');
			
			boxDataCache[boxIndex] = {
				slides		: $slides,
				videos		: $videos,
				slideCount	: slideCount,
				slideActive : $slideActive.length > 0 ? $slideActive : $slides.eq(0),
				pos			: $slideActive.length > 0 ? $slides.index($slideActive) : 0,
				isCarousel	: isCarousel,
				controls		: {
						el   : $controls,
						prev : $prev,
						next : $next	,
						close: $close
				},
				pager		: {
						el	: $pager,
						a	: $pagerAnchors
				}
			};

			
			/// INIT CAROUSEL
			if (isCarousel) {
				getSlideIndex(boxIndex);
				
				$slideActive.addClass('slide-active');
				boxDataCache[boxIndex].prevSlide.addClass('slide-prev');
				boxDataCache[boxIndex].nextSlide.addClass('slide-next');
			
				if (loopBox && slideCount > 1) {
		
					setInterval(function() {
						changeSlide($box, 'next');
					}, interval);
				}
			}
			
		});
		
		if (config.debug) console.log(boxDataCache);
		
		function doVideoStuff(e) {
				
			var element = e.target,
				$element = $(element),
				isHtml5 = $element.is('video'),
				isYT = $element.hasClass('video-yt'),
				isVimeo = $element.hasClass('video-vimeo'),
				clone,
				parent,
				$clone,
				$box = $element.closest(config.slideBox),
				boxIndex = $boxes.index($box),
				boxProps = boxDataCache[boxIndex];
				
			if (isYT || isVimeo) { /// isHtml5 || 
				//console.log($(element));
				clone = element.cloneNode(true);
				parent = element.parentNode;
				clone.src = element.getAttribute('data-src');
				clone.classList.remove('lazyload', 'lazyloading');
				clone.classList.add('lazyloaded');
				parent.insertBefore(clone, element);
				element.remove();
				$clone = $(clone);
				
				/// RESET VIDEO CACHE
				boxDataCache[boxIndex].videos = $box.find('video, .video-yt, .video-vimeo');
				
				if (isYT) {
					ytPromise.then(function(val) {
						//console.log(ytPromise);
						addPlayerObject($clone);
					});
				} else if (isVimeo) {
					addPlayerObject($clone);
				} else {
					addPlayerObject($clone);
				}
			}
		}
		
		function lazyLoadBg(e) {
			
			var element = e.target,
				$element = $(element),
				bgWasSet;
				//lazyLoadSrc = $element.data('src');

			//e.preventDefault();
			//console.log('lazybeforeunveil');
			//console.log($element);
			
			bgWasSet = setSlideBg($element, true);
			//console.log('bgWasSet '+ bgWasSet);
			if (bgWasSet) e.preventDefault();

			/*if (!$element.bgWasSet) {
				$element.attr('src', lazyLoadSrc);
				//src = addClass('lazyloaded');
				//lazySizes.loader.unveil(element);
			}*/
			
		}
		
		// Background image laoding for lazyloaded images
		document.addEventListener('lazybeforeunveil', lazyLoadBg);
		document.addEventListener('lazyloaded', lazyLoadBg);
		
		if (hasYtEmbeds || hasVimeoEmbeds) /// hasHtml5Videos || 
			document.addEventListener('lazybeforeunveil', doVideoStuff);
			//document.addEventListener('lazybeforeunveil', function(e) );
		
	}

	
	function getActiveBox() {
		
		$boxActive = $('.box-active');
	}


	function activateBox($box) {
		
		$box.addClass('box-active');
		getActiveBox();
		
		loadSlideBgs();
	}	
	
	
	function getActiveSlide($box) {

		$slideActive = $box.find('.slide-active');
		return $slideActive;

	}
	
	
	function getSlideIndex(supIndex) {
		
		var boxIndex = typeof supIndex !== 'undefined' ? supIndex : $boxes.index($boxActive),
			$box = typeof boxIndex !== 'undefined' ? $boxes.eq(boxIndex) : $boxActive,
			boxProps = boxDataCache[boxIndex],
			$boxSlides = boxProps.slides,
			lastSlide = boxProps.slideCount - 1,
			$slideActive = $box.find('.slide-active'),
			hasActiveSlide = $slideActive.length > 0,
			prev,
			next;
		

		function getAdjacentSlides() {
			
			prev = boxProps.pos + delta.prev; //delta['prev'],
			next = boxProps.pos + delta.next; //delta['next'];
			
			// DO NOT WRAP SLIDES:
			/*boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $();
			boxProps.nextSlide = $boxSlides.eq(next); */

			// WRAP SLIDES:
			boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $boxSlides.eq(lastSlide);
			boxProps.nextSlide = next <= lastSlide ? $boxSlides.eq(next) : $boxSlides.eq(0);
			
			if (boxProps.slideCount === 1) {
				boxProps.nextSlide = $();
				boxProps.prevSlide = $();
			}
		}
	
		//getActiveSlide(boxIndex);
		
		boxProps.pos = hasActiveSlide ? $boxSlides.index($slideActive) : 0;
		//if (!hasActiveSlide) $boxSlides.eq(0).addClass('active-slide');
		getAdjacentSlides();
		
		if (config.debug) {
			console.log('slideIndex after load {\n' +
			//if (activeSlide) console.log($slideActive);
			//console.log('boxIndex ' + boxIndex + ', pos : ' + boxProps.pos + ' / ' + $boxSlides.length);
			
			'\tactive : \t' + boxProps.pos + '\t\t #' + $slideActive.attr('id') +'\n'+
			'\tprev : \t\t' + prev + '\t\t #' + boxProps.prevSlide.attr('id') +'\n'+
			'\tnext : \t\t' + next + '\t\t #' + boxProps.nextSlide.attr('id') +'\n'+
			'}');
		}
		
		boxDataCache[boxIndex] = boxProps;
		
	}

		
	function setControlIndex(boxIndex) {
	
		//$boxActive = $('.box-active'); //$boxes.filter('.box-active'),
		var $box = $boxes.eq(boxIndex),
			boxProps = boxDataCache[boxIndex],
			$controls = boxProps.controls.el,
			$prev = boxProps.controls.prev,
			$next = boxProps.controls.next,
			
			$pager = boxProps.pager.el,
			$pagerAnchors = boxProps.pager.a;
		//}
		
		$pagerAnchors
			.removeClass('active pg-item-active')
			.eq(boxProps.pos).addClass('pg-item-active');
		
		if (boxProps.prevSlide.length === 0) {
			$prev.addClass('disabled'); 
		} else {
			$prev.removeClass('disabled');
		}
		
		if (boxProps.nextSlide.length === 0) {
			$next.addClass('disabled'); 
		} else {
			$next.removeClass('disabled');
		}

	}

	
	function loadSlide($slide) {
		
		if (config.debug) console.log('loadSlide : ' + $slide.attr('id'));
	
		var $box = $slide.closest(config.slideBox),
			boxIndex = $boxes.index($box),
			boxProps = boxDataCache[boxIndex],
			slug = $slide.attr('id'),
			nextIsPrev,
			prevIsNext,
			itemPath = createPath(initialState.path, slug),
			itemTitle = $box.find('.list-item-title').text(),
			itemState = createState(itemPath, itemTitle);
			
		// CLEAN UP
		boxProps.slides
			.removeClass('playing');
			//.not($slide).removeClass('slide-active');
		$('#slide-copy').remove();
		
		// PAUSE ALL VIDEOS
		//console.log(boxProps.videos);
		/*boxProps.videos.each(function() {
			console.log(jQuery._data( this , "events" ));
		});*/
		boxProps.videos.trigger('pauseVideo');
		
		if (!$slide.hasClass('slide-active')) {
			
			boxProps.slides.removeClass('slide-active');
			$slide.addClass('slide-active');
			$(document).trigger('slideChanged');
			
			getSlideIndex(boxIndex);
			
			// LOAD NEW PATH here
			if (config.setPath) loadState(itemState);
			
			nextIsPrev = boxProps.nextSlide.hasClass('slide-prev');
			prevIsNext = boxProps.prevSlide.hasClass('slide-next');
			boxProps.slides.removeClass('slide-prev slide-next prev-to-next next-to-prev');
			
			if (nextIsPrev) {
				//console.log('nextIsPrev');
				boxProps.nextSlide.clone()
					.addClass('prev-out')
					.attr('id', 'slide-copy')
					.insertBefore(boxProps.nextSlide);
				boxProps.nextSlide.addClass('prev-to-next');
				
			} else {
				boxProps.nextSlide.addClass('slide-next');
			}
			if (prevIsNext) {
				//console.log('prevIsNext');
				boxProps.prevSlide.clone()
					.insertBefore(boxProps.prevSlide)
					.addClass('prev-out')
					.attr('id', 'slide-copy');
				boxProps.prevSlide.addClass('next-to-prev');
				//boxProps.prevSlide.addClass('slide-prev').removeClass('prev-to-next');
			} else {
				boxProps.prevSlide.addClass('slide-prev');
			}
				
		} else {
			
			$slide.removeClass('slide-active');
		}
		
		setControlIndex(boxIndex);
		setScroll($box);
	}
	
	
	function changeSlide($box, direction) {
	
		var dir = typeof direction !== 'undefined' ? direction : '';
		
		$box.each(function() {
		/// ALLOW FOR BOX TO BE A COLLECTION
		
			var $box = $(this),
				boxIndex = $boxes.index($box),
				boxProps = boxDataCache[boxIndex],
				$boxSlides = boxProps.slides,
				$slideActive = boxProps.slideActive,
				allowChange = $box.hasClass('box-zoomed') || boxProps.isCarousel,
				pos = boxProps.pos,
				$nextSlide;
			
			function getNextSlide() {
			
				var lastSlide = boxProps.slideCount - 1,
					future = dir !== '' ? pos + delta[dir] : $boxSlides.index($slide),
					$future;
				
				if (future > lastSlide) future = 0;		// go to first slide
				if (future < 0) future = lastSlide;		// go to last slide
					
				if (future !== pos) {
					pos = future;
					boxDataCache[boxIndex].pos = pos;
					$future = $boxSlides.eq(future);
				} else {
					$future = false;
				}
				
				if (config.debug) {
					//console.log($boxSlides);
					//console.log('lastSlide ' + lastSlide + ', future : ' + future);
					//console.log($future);
				}
				
				return $future;
			}

			if (config.debug) {
				//console.log($box);
				//console.log($box.attr('class'));
				console.log('\nboxIndex: '+boxIndex+', '+boxProps.slideCount+' slides,\n' + 
					'dir : ' + dir + ', allowChange: ' + allowChange);
			}
			
			if (allowChange) {
				$nextSlide = getNextSlide();
				if ($nextSlide) loadSlide($nextSlide);
			}

		});
		
	}
	
	
	function findBox(event) {
		
		var isZoomed = $boxZoomed.length>0,
			$target,
			$box, $cont;
		
		if (typeof event === 'object') {
			/// ARROW WIDGETS
			event.preventDefault();
			$target = $(event.target);
			$box = $target.closest(config.slideBox);
			if (!$box.length > 0) {
				$cont = $target.closest(config.container);
				$box = $cont.find(config.slideBox);
			}
			//console.log($box);
		} else { 
			/// KEYBOARD SHORTCUTS
			$box = isZoomed ? $boxZoomed : $boxActive;
		}
		
		if (config.debug) {
			//console.log($target);
			//console.log($cont);
		}
		return $box;
	}
	
	
	function prevSlide(event) {
	
		var $box = findBox(event);
		changeSlide($box, 'prev');
	}
	
	
	function nextSlide(event) {
	
		var $box = findBox(event);
		changeSlide($box, 'next');
	}
	
	
	function toggleControls(boxIndex) {

		if ($boxes.eq(boxIndex).hasClass('box-zoomed')) {
		
			boxDataCache[boxIndex].controls.prev.removeClass('widget-hide');
			boxDataCache[boxIndex].controls.next.removeClass('widget-hide');
			boxDataCache[boxIndex].controls.close.removeClass('widget-hide');
		}
		//console.log ('boxIndex'+boxIndex);
		//$controls.addClass('controls-show');
		
		//$controls.removeClass('controls-show');
		//$close.addClass('widget-hide');
		
	}
	
	
	function toggleZoom($slide) {
		
		var $box,
			boxIndex,
			boxProps,
			$slideActive;
		
		if (typeof $slide !== 'undefined') {
		/// ZOOM IN
			
			$(document).trigger('zoomIn');
			if (config.debug) console.log('Zoom In');
			
			$box = $slide.closest(config.slideBox);
			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			//console.log('how did we get here?');
			
			activateBox($box);
			$box.addClass('box-zoomed');
			$boxZoomed = $box;
			boxProps.slides.addClass('slide-detail');
			
			$.scrollLock(true);
			//boxProps.pos = boxProps.slides.index($slide);
			
			if (!$slide.hasClass('slide-active')) {
				loadSlide($slide);
			}
			
			toggleControls(boxIndex);
			
		} else if ($boxZoomed.length > 0) {
		/// ZOOM OUT
			
			if (config.debug) console.log('Zoom Out');
			
			$box = $boxZoomed;
			$slideActive = $box.find('.slide-active');
			if (config.debug) console.log('slideActive:' + $slideActive.attr('class'));
			
			$(document).trigger('zoomOut');

			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			$box.removeClass('box-zoomed');
			$boxZoomed = $();
			
			boxProps.slides.removeClass('slide-detail');
			if (!boxProps.isCarousel)
				boxProps.slides.removeClass('slide-active slide-prev slide-next');
			boxProps.videos.trigger('pauseVideo');
			
			$.scrollLock(false);
			
			toggleControls(boxIndex);
			
			//removeHash();
			if (config.setPath) loadState(initialState);
			
			//scrollToTarget($slideActive);
			//$(document).scrollTop( $slideActive.offset().top );
			//$('html,body').scrollTop( $slideActive.offset().top );
			/*$('html,body').animate({
				scrollTop: $slideActive.offset().top - 60
			}, 0);*/
		
			$(document).trigger('zoomedOut');
			
		}
		
	}
	
	
	function loadBox($box) {
		
		var $slide = $box.find(config.slide).eq(0);

		activateBox($box);
		toggleZoom($slide);
	}
	
	
	function loadSingleSlide() {
		
		if (hash !== '') {
			if (config.debug) console.log('hash: ' + hash);
			loadBox($('#' + hash));
		}
	}
	
	
	function addEvents() {
		
		// CUSTOM EVENTS
		
		$boxes.on('slideBoxChange', function (event) {
			var $target = $(event.target);
			
			if (config.debug) console.log('slideBoxChange event triggered');
			//if (config.debug) console.log($target);
			activateBox($target);
			getSlideIndex();
		})
		.on('prevSlide', prevSlide)
		.on('nextSlide', nextSlide);

		$slides.on('toggleZoom', function (event) {
			var $target = $(event.target);
			//if (config.debug) console.log($target);
			toggleZoom($target);
		});
		
		$(document).on('slideChanged', function () {
			if (config.debug) console.log('slideChanged event triggered');
		});
		
		/// REGULAR EVENTS
		
		/*$(document).on('mouseenter', config.slideBox, function () {
			
			var $target = $(this);
			$boxes.not($target).removeClass('box-active');
			activateBox($target);
			getSlideIndex();
		});*/
		
		if (config.slideBoxClick) {
			$(document).on('click', '.slide-box:not(.box-zoomed)', function (event) {
		
				if (config.debug) console.log('\nslideBox clicked');
				loadBox($(this)); 
			});
		} else {
			$(document).on('click', '.slide:not(a,.slide-detail,.slide.playing)', function (event) {
			// ZOOM IN

				event.stopPropagation();
				if (config.debug) console.log('\nSlide clicked');
				toggleZoom($(this));
			});
		}
		
		$(document)
			.on('click', '.slide-detail:not(.slide.playing)', function (event) {
			// ZOOM OUT
				var $slide = $(this),
					$box = $slide.parents('.slide-box'),
					archiveUrl = $slide.data('archiveUrl');
				
				event.stopPropagation();
				if (config.debug) console.log('\nDetail slide clicked:' + $slide);
				
				toggleZoom();
			})
			.on('click', '.controls .prev', prevSlide)
			.on('click', '.controls .next', nextSlide)
			.on('swiperight', prevSlide)
			.on('swipeleft', nextSlide)
			.on('click', '.controls .close', function (event) {
				// ZOOM OUT
				event.preventDefault();
				toggleZoom();
				
			})
			.on('click', '.number, .pg-item', function (event) {
	
				var $number = $(this),
					$box = $number.closest(config.slideBox),
					boxIndex = $boxes.index($box),
					$boxSlides = boxDataCache[boxIndex].slides,
					no = boxDataCache[boxIndex].pager.a.index($number),
					$slide = $boxSlides.eq(no);
	
				event.preventDefault();
				if (config.debug) console.log('item clicked ' + parseInt(no+1));
				if (!$slide.hasClass('slide-active')) loadSlide($slide);
				
			})
			.on('keyup', function (e) {
				
				switch (e.keyCode) {
				case 27: // esc
					toggleZoom();
					break;
				case 37: // left <-
					prevSlide();
					break;
				case 39: // right ->
					nextSlide();
					break;
				}
			});

	}


	// MAIN PLUGIN LOGIC
	if (!slideBoxCm.initialized && $boxes.length > 0) {
		
		initBoxes();
		addEvents();

		getActiveBox();
		//loadSlideBgs($boxes);
	
		slideBoxCm.initialized = true;
		
		if (config.debug) console.log('initSlides: slideBox was initialized.');
	}
	
}

$(function () {
	initSlides();
});


$.scrollLock = ( function scrollLockSimple(){
	var locked   = false;
	var $body;
	var previous;

	function lock(){
	  if( !$body ){
	    $body = $( 'body' );
	  }
	  
	  previous = $body.css( 'overflow' );
		
	  $body.css( 'overflow', 'hidden' );

	  locked = true;
	}

	function unlock(){
	  $body.css( 'overflow', previous );

	  locked = false;
	}

	return function scrollLock( on ) {
		// If an argument is passed, lock or unlock depending on truthiness
		if( arguments.length ) {
			if( on ) {
				lock();
			}
			else {
				unlock();
			}
		}
		// Otherwise, toggle
		else {
			if( locked ){
				unlock();
			}
			else {
				lock();
			}
		}
	};
}() );

// jshint ignore: start

// codekit-prepend 'matchMedia.js'
// codekit-prepend 'defineMobile.js'
// codekit-prepend 'jquery.mobile-events.js'

// @codekit-prepend 'includes/globals.js'
// @codekit-prepend 'includes/getScriptDir.js'
// @codekit-prepend 'includes/saveState.js'
// @codekit-prepend 'includes/setBackground.js
// @codekit-prepend 'includes/initSlides.js

// @codekit-prepend 'third-party/jquery.scrollLock.simple.js'
// @codekit-append 'third-party/lazysizes.js'

(function(window, factory) {
	var lazySizes = factory(window, window.document);
	window.lazySizes = lazySizes;
	if(typeof module == 'object' && module.exports){
		module.exports = lazySizes;
	}
}(window, function l(window, document) {
	'use strict';
	/*jshint eqnull:true */
	if(!document.getElementsByClassName){return;}

	var lazysizes, lazySizesConfig;

	var docElem = document.documentElement;

	var Date = window.Date;

	var supportPicture = window.HTMLPictureElement;

	var _addEventListener = 'addEventListener';

	var _getAttribute = 'getAttribute';

	var addEventListener = window[_addEventListener];

	var setTimeout = window.setTimeout;

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

	var requestIdleCallback = window.requestIdleCallback;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var regClassCache = {};

	var forEach = Array.prototype.forEach;

	var hasClass = function(ele, cls) {
		if(!regClassCache[cls]){
			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		}
		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
	};

	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
		}
	};

	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? _addEventListener : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
		var event = document.createEvent('CustomEvent');

		if(!detail){
			detail = {};
		}

		detail.instance = lazysizes;

		event.initCustomEvent(name, !noBubbles, !noCancelable, detail);

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesConfig.pf) ) ){
			polyfill({reevaluate: true, elements: [el]});
		} else if(full && full.src){
			el.src = full.src;
		}
	};

	var getCSS = function (elem, style){
		return (getComputedStyle(elem, null) || {})[style];
	};

	var getWidth = function(elem, parent, width){
		width = width || elem.offsetWidth;

		while(width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var rAF = (function(){
		var running, waiting;
		var firstFns = [];
		var secondFns = [];
		var fns = firstFns;

		var run = function(){
			var runFns = fns;

			fns = firstFns.length ? secondFns : firstFns;

			running = true;
			waiting = false;

			while(runFns.length){
				runFns.shift()();
			}

			running = false;
		};

		var rafBatch = function(fn, queue){
			if(running && !queue){
				fn.apply(this, arguments);
			} else {
				fns.push(fn);

				if(!waiting){
					waiting = true;
					(document.hidden ? setTimeout : requestAnimationFrame)(run);
				}
			}
		};

		rafBatch._lsFlush = run;

		return rafBatch;
	})();

	var rAFIt = function(fn, simple){
		return simple ?
			function() {
				rAF(fn);
			} :
			function(){
				var that = this;
				var args = arguments;
				rAF(function(){
					fn.apply(that, args);
				});
			}
		;
	};

	var throttle = function(fn){
		var running;
		var lastTime = 0;
		var gDelay = lazySizesConfig.throttleDelay;
		var rICTimeout = lazySizesConfig.ricTimeout;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn();
		};
		var idleCallback = requestIdleCallback && rICTimeout > 49 ?
			function(){
				requestIdleCallback(run, {timeout: rICTimeout});

				if(rICTimeout !== lazySizesConfig.ricTimeout){
					rICTimeout = lazySizesConfig.ricTimeout;
				}
			} :
			rAFIt(function(){
				setTimeout(run);
			}, true)
		;

		return function(isPriority){
			var delay;

			if((isPriority = isPriority === true)){
				rICTimeout = 33;
			}

			if(running){
				return;
			}

			running =  true;

			delay = gDelay - (Date.now() - lastTime);

			if(delay < 0){
				delay = 0;
			}

			if(isPriority || delay < 9){
				idleCallback();
			} else {
				setTimeout(idleCallback, delay);
			}
		};
	};

	//based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
	var debounce = function(func) {
		var timeout, timestamp;
		var wait = 99;
		var run = function(){
			timeout = null;
			func();
		};
		var later = function() {
			var last = Date.now() - timestamp;

			if (last < wait) {
				setTimeout(later, wait - last);
			} else {
				(requestIdleCallback || run)(run);
			}
		};

		return function() {
			timestamp = Date.now();

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
		};
	};

	(function(){
		var prop;

		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			//strictClass: 'lazystrict',
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 40,
			customMedia: {},
			init: true,
			expFactor: 1.5,
			hFac: 0.8,
			loadMode: 2,
			loadHidden: true,
			ricTimeout: 0,
			throttleDelay: 125,
		};

		lazySizesConfig = window.lazySizesConfig || window.lazysizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;

		setTimeout(function(){
			if(lazySizesConfig.init){
				init();
			}
		});
	})();

	var loader = (function(){
		var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

		var defaultExpand, preloadExpand, hFac;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;

		var isLoading = 0;
		var lowRuns = -1;

		var resetPreloading = function(e){
			isLoading--;
			if(e && e.target){
				addRemoveLoadEvents(e.target, resetPreloading);
			}

			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = getCSS(document.body, 'visibility') == 'hidden' || getCSS(elem, 'visibility') != 'hidden';

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
				visible = ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
						eLleft < outerRect.right &&
						eLbottom > outerRect.top - 1 &&
						eLtop < outerRect.bottom + 1
					;
				}
			}

			return visible;
		};

		var checkElements = function() {
			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

			var lazyloadElems = lazysizes.elements;

			if((loadMode = lazySizesConfig.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

				i = 0;

				lowRuns++;

				if(preloadExpand == null){
					if(!('expand' in lazySizesConfig)){
						lazySizesConfig.expand = docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370;
					}

					defaultExpand = lazySizesConfig.expand;
					preloadExpand = defaultExpand * lazySizesConfig.expFactor;
				}

				if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden){
					currentExpand = preloadExpand;
					lowRuns = 0;
				} else if(loadMode > 1 && lowRuns > 1 && isLoading < 6){
					currentExpand = defaultExpand;
				} else {
					currentExpand = shrinkExpand;
				}

				for(; i < eLlen; i++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + (elemExpand * hFac);
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand * hFac &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						(lazySizesConfig.loadHidden || getCSS(lazyloadElems[i], 'visibility') != 'hidden') &&
						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
						if(isLoading > 9){break;}
					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
						(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesConfig.sizesAttr) != 'auto')))){
						autoLoadElem = preloadElems[0] || lazyloadElems[i];
					}
				}

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			addClass(e.target, lazySizesConfig.loadedClass);
			removeClass(e.target, lazySizesConfig.loadingClass);
			addRemoveLoadEvents(e.target, rafSwitchLoadingClass);
			triggerEvent(e.target, 'lazyloaded');
		};
		var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
		var rafSwitchLoadingClass = function(e){
			rafedSwitchLoadingClass({target: e.target});
		};

		var changeIframeSrc = function(elem, src){
			try {
				elem.contentWindow.location.replace(src);
			} catch(e){
				elem.src = src;
			}
		};

		var handleSources = function(source){
			var customMedia;

			var sourceSrcset = source[_getAttribute](lazySizesConfig.srcsetAttr);

			if( (customMedia = lazySizesConfig.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
				source.setAttribute('media', customMedia);
			}

			if(sourceSrcset){
				source.setAttribute('srcset', sourceSrcset);
			}
		};

		var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg){
			var src, srcset, parent, isPicture, event, firesLoad;

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented){

				if(sizes){
					if(isAuto){
						addClass(elem, lazySizesConfig.autosizesClass);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem[_getAttribute](lazySizesConfig.srcsetAttr);
				src = elem[_getAttribute](lazySizesConfig.srcAttr);

				if(isImg) {
					parent = elem.parentNode;
					isPicture = parent && regPicture.test(parent.nodeName || '');
				}

				firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

				event = {target: elem};

				if(firesLoad){
					addRemoveLoadEvents(elem, resetPreloading, true);
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 2500);

					addClass(elem, lazySizesConfig.loadingClass);
					addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
				}

				if(isPicture){
					forEach.call(parent.getElementsByTagName('source'), handleSources);
				}

				if(srcset){
					elem.setAttribute('srcset', srcset);
				} else if(src && !isPicture){
					if(regIframe.test(elem.nodeName)){
						changeIframeSrc(elem, src);
					} else {
						elem.src = src;
					}
				}

				if(isImg && (srcset || isPicture)){
					updatePolyfill(elem, {src: src});
				}
			}

			if(elem._lazyRace){
				delete elem._lazyRace;
			}
			removeClass(elem, lazySizesConfig.lazyClass);

			rAF(function(){
				if( !firesLoad || (elem.complete && elem.naturalWidth > 1)){
					if(firesLoad){
						resetPreloading(event);
					} else {
						isLoading--;
					}
					switchLoadingClass(event);
				}
			}, true);
		});

		var unveilElement = function (elem){
			var detail;

			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = isImg && (elem[_getAttribute](lazySizesConfig.sizesAttr) || elem[_getAttribute]('sizes'));
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && (elem[_getAttribute]('src') || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass) && hasClass(elem, lazySizesConfig.lazyClass)){return;}

			detail = triggerEvent(elem, 'lazyunveilread').detail;

			if(isAuto){
				 autoSizer.updateElem(elem, true, elem.offsetWidth);
			}

			elem._lazyRace = true;
			isLoading++;

			lazyUnveil(elem, detail, isAuto, sizes, isImg);
		};

		var onload = function(){
			if(isCompleted){return;}
			if(Date.now() - started < 999){
				setTimeout(onload, 999);
				return;
			}
			var afterScroll = debounce(function(){
				lazySizesConfig.loadMode = 3;
				throttledCheckElements();
			});

			isCompleted = true;

			lazySizesConfig.loadMode = 3;

			throttledCheckElements();

			addEventListener('scroll', function(){
				if(lazySizesConfig.loadMode == 3){
					lazySizesConfig.loadMode = 2;
				}
				afterScroll();
			}, true);
		};

		return {
			_: function(){
				started = Date.now();

				lazysizes.elements = document.getElementsByClassName(lazySizesConfig.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass + ' ' + lazySizesConfig.preloadClass);
				hFac = lazySizesConfig.hFac;

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 999);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				//, 'fullscreenchange'
				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
					document[_addEventListener](name, throttledCheckElements, true);
				});

				if((/d$|^c/.test(document.readyState))){
					onload();
				} else {
					addEventListener('load', onload);
					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
					setTimeout(onload, 20000);
				}

				if(lazysizes.elements.length){
					checkElements();
					rAF._lsFlush();
				} else {
					throttledCheckElements();
				}
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = rAFIt(function(elem, parent, event, width){
			var sources, i, len;
			elem._lazysizesWidth = width;
			width += 'px';

			elem.setAttribute('sizes', width);

			if(regPicture.test(parent.nodeName || '')){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sources[i].setAttribute('sizes', width);
				}
			}

			if(!event.detail.dataAttr){
				updatePolyfill(elem, event.detail);
			}
		});
		var getSizeElement = function (elem, dataAttr, width){
			var event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent, width);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.detail.width;

					if(width && width !== elem._lazysizesWidth){
						sizeElement(elem, parent, event, width);
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					getSizeElement(autosizesElems[i]);
				}
			}
		};

		var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
				addEventListener('resize', debouncedUpdateElementsSizes);
			},
			checkElems: debouncedUpdateElementsSizes,
			updateElem: getSizeElement
		};
	})();

	var init = function(){
		if(!init.i){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	lazysizes = {
		cfg: lazySizesConfig,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth,
		rAF: rAF,
	};

	return lazysizes;
}
));


