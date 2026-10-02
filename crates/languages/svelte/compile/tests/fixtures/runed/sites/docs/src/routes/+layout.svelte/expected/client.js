import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.css";
import { siteConfig } from "$lib/config/site";
import { useSiteConfig } from "@svecodocs/kit";
import { dev } from "$app/environment";

var root = $.with_script($.from_html(`<script defer="" data-domain="runed.dev" src="https://server.hj.run/js/script.js"></script><!>`, 1));

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	useSiteConfig(() => siteConfig);

	var fragment_2 = $.comment();

	$.head('12evr8a', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var node_1 = $.sibling($.first_child(fragment_1));

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (!dev) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_2 = $.first_child(fragment_2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment_2);
	$.pop();
}