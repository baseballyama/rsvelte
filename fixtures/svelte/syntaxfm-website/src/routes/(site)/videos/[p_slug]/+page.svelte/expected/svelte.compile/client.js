import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a><img class="thumbnail svelte-2d02k7"/> <h3 class="h6 svelte-2d02k7"> </h3></a>`);
var root_1 = $.from_html(`<h1 class="h3"> </h1> <div class="playlist-grid grid svelte-2d02k7"></div>`, 1);

export default function _page($$anchor, $$props) {
	let playlist = $.derived(() => $$props.data.playlist);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var h1 = $.first_child(fragment_1);
			var text = $.only_child(h1, true);
			var div = $.sibling(h1, 2);

			$.each(div, 21, () => $.get(playlist).videos, $.index, ($$anchor, $$item) => {
				let video = () => $.get($$item).video;
				var a = root();
				var img = $.child(a);
				var h3 = $.sibling(img, 2);
				var text_1 = $.only_child(h3, true);

				$.reset(a);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `/videos/${$.get(playlist).slug}/${video().slug}`);
					$.set_attribute(img, 'src', video().thumbnail);
					$.set_attribute(img, 'alt', video().title);
					$.set_text(text_1, video().title);
				});

				$.append($$anchor, a);
			});

			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(playlist).title));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(playlist)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}