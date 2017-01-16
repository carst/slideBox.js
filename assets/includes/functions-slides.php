<?php

function insert_slides($post, $gallery=false, $slug=false) {

	if (!$slug) $slug = $post->post_name;
	//var_dump($slug);
	
	if (!$gallery) {
		$gallery = new Gallery($post->ID);
	}
	if (!$gallery->size) $gallery->size = 'thumbnail';
	if (!$gallery->img_class) $gallery->img_class = 'slide box-col col-4 fixed-ratio ratio-1-1'; ?>
	
	<div id="<?=$slug?>" class="slide-box"><?
	insert_images($gallery);
	?></div><?
	
	insert_controls();
	
}


function insert_controls($show_slides=false) {
	
	$controls_class = $show_slides ? ' controls-show' : ' controls-hide';
	$slide_widget_class = $show_slides ? '' : ' widget-hide';
	//$close_widget_class = is_single() ? '' : ' widget-hide'; ?>

		<nav class="controls<?=$controls_class?>">
			<a class="slide-widget widget close<?=$slide_widget_class?>" href="#"></a>
			<a class="slide-widget widget arrow prev disabled<?=$slide_widget_class?>" href="#">‹</a>
			<a class="slide-widget widget arrow next<?=$slide_widget_class?>" href="#">›</a>
		</nav><?
}
	

function insert_pager($items=array()) { ?>

			<ul class="pager pager-inline"><?
		foreach ($items as $index=>$item) {
			$no = $index + 1;
			$item_class = ($index === 0) ? $no . ' active' : $no; ?>
				<li><a class="number <?=$item_class?>" href="#" title="<?=$item->title?>"><?=$no?></a></li><?
		} ?>
			</ul><?
}

?>