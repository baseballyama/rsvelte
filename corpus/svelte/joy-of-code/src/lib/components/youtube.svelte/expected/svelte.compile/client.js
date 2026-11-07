import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><lite-youtube></lite-youtube></div>`, 2);

export default function Youtube($$anchor, $$props) {
	var div = root();
	var lite_youtube = $.child(div);

	$.template_effect(() => $.set_custom_element_data(lite_youtube, 'videoid', $$props.id));
	$.template_effect(() => $.set_custom_element_data(lite_youtube, 'playlabel', $$props.title));
	$.reset(div);
	$.append($$anchor, div);
}