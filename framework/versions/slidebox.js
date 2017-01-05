// jshint ignore: start

// @codekit-prepend 'slidebox-util.js'
// @codekit-prepend 'jquery.scrollLock.simple.js'
// @codekit-append 'lazysizes.js'

var slideBoxCm = {};


function initSlides(config) {

	var defaults = {
			container 	: '.slides',
			slideBox 	: '.slide-box',
			slide 		: '.slide',
			slideBoxClick : false,
			setPath		: false,
			wrapSlides	: false,
			loopSlides	: false,
			slideInterval : 5000,
			debug : debug
		},
		config = typeof(config) === 'object' ? config : defaults,
		$container = $(config.container),

		//boxClass = config.slideBox.replace('.', ''),
		//$boxes = $container.hasClass(boxClass) ? $container.filter(config.slideBox) : $container.find(config.slideBox),
		$boxes = $(config.slideBox),
		$boxActive = $(),
		$boxZoomed = $(),
		boxDataCache = [],
		
		$slides = $boxes.find(config.slide),
		//slideCount = $slides.length,
		
		ytPromise,

		//wrapSlides = config.wrapSlides,
		//loopSlides = config.loopSlides,
		//slideInterval = config.slideInterval,
		
		/*
		$controls = $container.find('.controls'),
		$close = $controls.find('.close'),
		$prevnext = $controls.find('.widget.arrow'),
		$prev = $controls.find('.prev'),
		$next = $controls.find('.next'),
		
		$pager = $container.find('.pager'),
		$pagerAnchors = $pager.find('a'),
		*/
		
		//$container = loadPackery(),

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
				loopBox = $box.hasClass('auto-loop') || $parent.hasClass('auto-loop'),
				$controls = $parent.find('.controls'),
				$prev = $controls.find('.prev'),
				$next = $controls.find('.next'),
				$close = $controls.find('.close'),

				$pager = $box.find('.pager'),
				$pagerAnchors = $pager.find('a');
			
			boxDataCache[boxIndex] = {
				slides		: $slides,
				videos		: $videos,
				slideCount	: slideCount,
				slideActive : $slideActive.length > 0 ? $slideActive : $slides.eq(0),
				pos			: $slideActive.length > 0 ? $slides.index($slideActive) : 0,
				controls		: {
						el   : $controls,
						prev : $prev,
						next : $next	,
						close: $close
				},
				pager 		: {
						el	 : $pager,
						a	 : $pagerAnchors
				}
			};
		
			/// START CAROUSEL
			if (loopBox && slideCount > 1) {
	
				setInterval(function() {
					changeSlide($box, 'next');
				}, config.slideInterval);
				
			}
			
		});
		
		if (config.debug) console.log(boxDataCache);
		
		if (hasYtEmbeds || hasVimeoEmbeds) /// hasHtml5Videos || 
			document.addEventListener('lazybeforeunveil', function(e) {
				
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
		});
		
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
	
	
	function getSlideIndex(boxIndex) {
		
		var boxIndex = typeof boxIndex !== 'undefined' ? boxIndex : $boxes.index($boxActive),
			$box = typeof boxIndex !== 'undefined' ? $boxes.eq(boxIndex) : $boxActive,
			boxProps = boxDataCache[boxIndex],
			$boxSlides = boxProps.slides,
			lastSlide = boxProps.slideCount - 1,
			$slideActive = $box.find('.slide-active'),
			hasActiveSlide = $slideActive.length > 0,
			prev,
			next;
		

		function getAdjacentSlides() {
			
			prev = boxProps.pos + delta['prev'],
			next = boxProps.pos + delta['next'];
			
			// DO NOT WRAP SLIDES:
			/*boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $();
			boxProps.nextSlide = $boxSlides.eq(next); */

			// WRAP SLIDES:
			boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $boxSlides.eq(lastSlide);
			boxProps.nextSlide = next <= lastSlide ? $boxSlides.eq(next) : $boxSlides.eq(0);
			
		}
	
		//getActiveSlide(boxIndex);
		
		boxProps.pos = hasActiveSlide ? $boxSlides.index($slideActive) : 0;
		getAdjacentSlides();
		
		if (config.debug) {
			console.log('slideIndex after load:');
			//if (activeSlide) console.log($slideActive);
			//console.log('boxIndex ' + boxIndex + ', pos : ' + boxProps.pos + ' / ' + $boxSlides.length);
			
			console.log('active : ' + boxProps.pos + ' #' + $slideActive.attr('id'));
			console.log('prev : ' + prev + ' #' + boxProps.prevSlide.attr('id'));
			console.log('next : ' + next + ' #' + boxProps.nextSlide.attr('id'));
			console.log('...');
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
			.removeClass('active')
			.eq(boxProps.pos).addClass('active');
		
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
			itemPath = createPath(initialState.path, slug),
			itemTitle = $box.find('.list-item-title').text(),
			itemState = createState(itemPath, itemTitle),
			expanded = $container.hasClass('expanded');

		// CLEAN UP
		//$boxes
		//	.not($box).removeClass('box-active');
		
		boxProps.slides
			.removeClass('slide-prev slide-next')
			.not($slide).removeClass('slide-active');
		
		// PAUSE ALL VIDEOS
		//console.log(boxProps.videos);
		/*boxProps.videos.each(function() {
			console.log(jQuery._data( this , "events" ));
		});*/
		
		boxProps.videos.trigger('pauseVideo');
		
		if (!$slide.hasClass('slide-active')) {
			
			$slide.addClass('slide-active');
			$(document).trigger('slideChanged');
			
			getSlideIndex(boxIndex);
			
			// LOAD NEW PATH here
			if (config.setPath) loadState(itemState);
			
			boxProps.prevSlide.addClass('slide-prev');
			boxProps.nextSlide.addClass('slide-next');
				
		} else {
			
			//$box.removeClass('box-active');
			$slide.removeClass('slide-active');

		}
		
		setControlIndex(boxIndex);
		setScroll($box);
		
	}
	
	
	function changeSlide($box, dir) {
	
		var boxIndex = $boxes.index($box),
			boxProps = boxDataCache[boxIndex],
			$boxSlides = boxProps.slides,
			$slideActive = boxProps.slideActive,
			allowChange = true,
			dir = typeof dir !== 'undefined' ? dir : '',
			pos = boxProps.pos,
			$nextSlide;
		
		//allowChange = $container.hasClass('expanded') || $container.hasClass('carousel');
		
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

		if (config.debug) console.log('\nboxIndex: ' + boxIndex + ', ' + boxProps.slideCount + ', dir : ' + dir);
		$nextSlide = getNextSlide();
		//allowChange = false;
		if ($nextSlide && allowChange) {
			loadSlide($nextSlide);
		}

		
	}
	
	
	function findBox($target) {
		
		var $box, $cont;
		
		if ($target.length > 0) {
			$box = $target.closest(config.slideBox);
			if (!$box.length > 0) {
				$cont = $target.closest(config.container);
				$box = $cont.find(config.slideBox);
			}
		} else {
			$box = $boxZoomed.length>0 ? $boxZoomed : $boxActive;
		}
		
		/*if (config.debug) {
			console.log($target);
			console.log($cont);
			console.log($box.attr('class'));
		}*/
		return $box;
	}
	
	
	function prevSlide(event) {
		
		var $box = findBox($(this));
		if (event) event.preventDefault();
		changeSlide($box, 'prev');
	}
	
	
	function nextSlide(event) {
		
		var $box = findBox($(this));
		if (event) event.preventDefault();
		changeSlide($box, 'next');
	}
	
	
	function toggleControls(boxIndex) {

		boxDataCache[boxIndex].controls.prev.toggleClass('widget-hide');
		boxDataCache[boxIndex].controls.next.toggleClass('widget-hide');
		boxDataCache[boxIndex].controls.close.toggleClass('widget-hide');
		
		//$controls.addClass('controls-show');
		
		//$controls.removeClass('controls-show');
		//$close.addClass('widget-hide');
		
	}
	
	
	function toggleZoom($slide) {
		
		var $box,
			boxIndex,
			boxProps;
		
		if (typeof $slide !== 'undefined' && !$container.hasClass('expanded')) {
		/// ZOOM IN
			
			$(document).trigger('zoomIn');
			if (config.debug) console.log('Zoom In');
			
			$box = $slide.closest(config.slideBox);
			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			//console.log('how did we get here?');
			
			$container.addClass('expanded');
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
			
		} else if ($boxZoomed.length>0) {
		/// ZOOM OUT
			
			if (config.debug) console.log('Zoom Out');
			
			$box = $boxZoomed;
			$(document).trigger('zoomOut');

			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			boxProps.slides.removeClass('slide-active slide-prev slide-next slide-detail');
			boxProps.videos.trigger('pauseVideo');
			
			$box.removeClass('box-zoomed');
			$boxZoomed = $();
			$container.removeClass('expanded');
		
			$.scrollLock(false);
			
			toggleControls(boxIndex);

			//removeHash();
			if (config.setPath) loadState(initialState);
			
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
		});

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
			$(document).on('click', '.slide-box:not(.box-active)', function (event) {
				
				if (config.debug) console.log('\nslide-box clicked');
				loadBox($(this)); 
			});
		} else {
			$(document).on('click', '.slide:not(.slide-active)', function (event) {
				
				event.stopPropagation();
				if (config.debug) console.log('\nslide clicked');
				toggleZoom($(this));
			});
		}
		
		$(document).on('click', '.slide-active:not(.slide-carousel)', function (event) {
			
			var $slide = $(this),
				archiveUrl = $slide.data('archiveUrl');
			
			event.stopPropagation();
			if (config.debug) console.log('\nactive slide clicked:' + $slide);
			toggleZoom();
			
		}).on('click', '.widget.prev', prevSlide)
		.on('click', '.widget.next', nextSlide)
		.on('swiperight', prevSlide)
		.on('swipeleft', nextSlide)
		.on('click', '.close', function (event) {

			event.preventDefault();
			toggleZoom($boxZoomed);
			
		}).on('click', '.number', function (event) {

			var $number = $(this),
				no = $number.text(),
				$box = $number.closest(config.slideBox),
				boxIndex = $boxes.index($box),
				$boxSlides = boxDataCache[boxIndex].slides,
				$slide = $boxSlides.eq(no - 1);

			if (config.debug) console.log('number clicked ' + no);
			
			event.preventDefault();
			
			loadSlide($slide);
			
		}).on('keyup', function (e) {
			
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

	if ($boxes.length > 0) {
		
		initBoxes();
		addEvents();

		getActiveBox();
		loadSlideBgs();
		//loadSingleSlide();
		//setControlIndex();
	}
	/*
	if (query.indexOf('zoom') > -1) {

		if (query.indexOf('first') > -1) {
			toggleSlide($slides.eq(0));
		} else if (query.indexOf('last') > -1) {
			toggleSlide($slides.eq($slides.length - 1));
		}
	}
	*/
	

}