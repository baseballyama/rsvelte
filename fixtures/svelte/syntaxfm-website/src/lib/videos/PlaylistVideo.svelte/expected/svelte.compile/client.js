import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><a class="svelte-7mgmi5"><img class="thumbnail svelte-7mgmi5"/> <h3 class="h6 svelte-7mgmi5"> </h3></a></div>`);

export default function PlaylistVideo($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var a = $.child(div);
	var img = $.child(a);
	var h3 = $.sibling(img, 2);
	var text = $.only_child(h3, true);

	$.reset(a);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `/videos/${$$props.playlist.slug}/${$$props.video.slug}`);
		$.set_attribute(img, 'src', $$props.video.thumbnail);
		$.set_attribute(img, 'alt', $$props.video.title);
		$.set_text(text, $$props.video.title);
	});

	$.append($$anchor, div);
	$.pop();
}