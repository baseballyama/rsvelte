import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="loadingmessage"> </p>`);
var root_1 = $.from_html(`<h2 class="routetitle">Loading</h2> <p id="pleasewait">Please wait…</p> <!>`, 1);

export default function Loading($$anchor, $$props) {
	$.push($$props, true);

	let params = $.prop($$props, 'params', 3, null);
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Message is ${params().message ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (params() && params().message) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}