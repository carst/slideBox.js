// jshint ignore: start

function htmlEscape(str) {
	
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function formatCode() {
	
	var $codeblocks = $('.codeblock');
	
	$codeblocks.each(function() {
		
		var $codeblock = $(this),
			html = $codeblock.html();
		
		html = htmlEscape(html
			.replace('<!--', '')
			.replace('-->', '')
			.replace('/*', '<!--')
			.replace('*/', '-->'));
			
		//html = htmlEscape(html);
		//console.log(html);
		
		$codeblock.replaceWith(html);
		
	});
} 

$(function () {
	
	formatCode();
});