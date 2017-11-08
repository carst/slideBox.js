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