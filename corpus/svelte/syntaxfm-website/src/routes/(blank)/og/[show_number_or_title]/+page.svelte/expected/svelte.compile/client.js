import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ShowOg from './ShowOg.svelte';

var root = $.from_html(`<div class="og-container svelte-1xzslwa"><!></div>`);

export default function _page($$anchor, $$props) {
	let show = $.derived(() => $$props.data.show);

	// This sucks but the type error made no sense.
	// Was using the exact query to generate the type
	let show_casted = $.derived(() => $.get(show));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ShowOg(node_1, {
				get show() {
					return $.get(show_casted);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}