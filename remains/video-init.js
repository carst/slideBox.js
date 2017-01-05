// 2. This code loads the IFrame Player API code asynchronously.

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

var ytPromise = new Promise(function(onYouTubeIframeAPIReady) {
	var tag = document.createElement('script'),
		firstScriptTag = document.getElementsByTagName('script')[0];
	
	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
	
	tag.src = "https://www.youtube.com/iframe_api";
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

function changeBorderColor(playerStatus) {
  var color;
  if (playerStatus == -1) {
    color = "#37474F"; // unstarted = gray
  } else if (playerStatus == 0) {
    color = "#FFFF00"; // ended = yellow
  } else if (playerStatus == 1) {
    color = "#33691E"; // playing = green
  } else if (playerStatus == 2) {
    color = "#DD2C00"; // paused = red
  } else if (playerStatus == 3) {
    color = "#AA00FF"; // buffering = purple
  } else if (playerStatus == 5) {
    color = "#FF6DOO"; // video cued = orange
  }
  if (color) {
    document.getElementById('existing-iframe-example').style.borderColor = color;
  }
}

function onPlayerReady(event) {
	document.getElementById('existing-iframe-example').style.borderColor = '#FF6D00';
}

function onPlayerStateChange(event) {
	changeBorderColor(event.data);
}

function addPlayer() {
	alert('Adding the Player!');
	player = new YT.Player('existing-iframe-example', {
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}


document.addEventListener('lazybeforeunveil', function(e) {
	var element = e.target,
		clone = element.cloneNode(true),
		parent = element.parentNode;
	
	clone.src = element.getAttribute('data-src');
	clone.classList.remove('lazyload', 'lazylading');
	clone.classList.add('lazyloaded');
	parent.insertBefore(clone, element);
	element.remove();
	ytPromise.then(addPlayer);
});

