// jshint ignore: start



function setSlideBg($element, defer) {
		
	var $img = $element.is('img') ? $element : $element.children('img'),
		bgWasSet = $img.hasClass('bg-set'),
		bgSrc,
		$bgTarget,
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

		//$img.attr('src', imgDir + 'blank.gif');
	}
	
	//if ($slide.is('a')) $img = $slide.find('img');
	if ($img.length > 0 && !bgWasSet) {
		
		if (debug) console.log($img);
		
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
			slide 		: '.slide, .load-bg'
		};
	
	var $targetBox = $targetBox === undefined ? $('.box-active') : $targetBox;
	
	$targetBox.find(config.slide).each(function() {
		setSlideBg($(this));
	});
	
}
