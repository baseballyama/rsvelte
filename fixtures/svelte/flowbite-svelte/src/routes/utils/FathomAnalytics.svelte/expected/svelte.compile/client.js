import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<script src="https://cdn.usefathom.com/script.js" defer=""></script><!>`, 1));
var root_1 = $.from_html(`<h2>You need to provide FATHOM_ID in .env file.</h2>`);

export default function FathomAnalytics($$anchor, $$props) {
	let FATHOM_ID = $.prop($$props, 'FATHOM_ID', 3, "");
	var fragment_1 = $.comment();

	$.head('m1cvrr', ($$anchor) => {
		var fragment = root();
		var script = $.first_child(fragment);
		var node = $.sibling(script);

		$.template_effect(() => $.set_attribute(script, 'data-site', FATHOM_ID()));
		$.append($$anchor, fragment);
	});

	var node_1 = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			var h2 = root_1();

			$.append($$anchor, h2);
		};

		$.if(node_1, ($$render) => {
			if (!FATHOM_ID()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment_1);
}