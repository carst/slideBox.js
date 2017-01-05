// jshint ignore: start

function scrollToTarget(target) {
	
	if (target.length) {
		$('html,body').animate({
			scrollTop: target.offset().top - 42
		}, 750);
		return false;
	}
} 


function smoothScrolling() {
	
	$('a[href*="#"]:not([href="#"])').on('click', function () {
	
		if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

			scrollToTarget(target);
		}
	});
	
}

$(function () {
	
	smoothScrolling();
});