// jshint ignore: start

function setSlideBg($slide, defer) {
		
	var bgWasSet = false,
		$img = $slide.is('img') ? $slide : $slide.children('img'),
		bgSrc,
		fullImg = new Image(),
		loaded = false,
		imgDir = typeof imgDirDefault !== 'undefined' ? imgDirDefault : 'images/';
	
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
	
	function loadHandler() {
		
		/*
		if (loaded) { 
			return;
		}
		loaded = true;
		*/
		
		//trace('src ' + this.src);
		//trace('full Images src' + fullImg);
		
		$slide
			.removeClass('loading')
			.css('background-image', 'url(' + bgSrc + ')')
			.addClass('has-bg');

		if ($slide.is('img')) $img.attr('src', imgDir + 'blank.gif');
		
	}
	
	if ($slide.is('a')) $img = $slide.find('img');
	
	//console.log($img);
	
	if ($img.length > 0 && !$slide.hasClass('has-bg')) {
		
		bgSrc = findBgSrc($img);
		//if (debug) 
		//console.log('bgSrc : ' + bgSrc);
		if (typeof bgSrc !== 'undefined') {
			$slide.addClass('loading');
			fullImg.onload = loadHandler();
			fullImg.src = bgSrc;
			bgWasSet = true;
		}
	}
	
	return bgWasSet;
	
}


function loadSlideBgs($targetBox) {
	
	var config = {
			slide 		: '.slide, .load-bg'
		};
	
	var $targetBox = $targetBox === undefined ? $('.box-active') : $targetBox;
	
	$targetBox.find(config.slide).each(function() {
		setSlideBg($(this));
	});
	
}
