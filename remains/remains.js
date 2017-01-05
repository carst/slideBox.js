function fitSlide($slide) {
		
		var fullImg = $slide.find('.full'),
			width = fullImg.attr('width'),
			height = fullImg.attr('height'),
			$caption = $slide.find('.slide-caption'),
			ratio = width / height,
			windowHeight = $(window).height(),
			windowWidth = $(window).width(),
			controlsHeight = $controls.height(),
			captionHeight = $caption.height(),
			vPadding = controlsHeight - captionHeight,
			maxHeight = windowHeight - vPadding,
			maxWidth = windowWidth,
			newHeight = maxHeight,
			newWidth = ratio * newHeight;
	
		//trace('controlsHeight: ' + controlsHeight + ', captionHeight: ' + captionHeight);
	
		$slide.height(maxHeight);
				
	}
	