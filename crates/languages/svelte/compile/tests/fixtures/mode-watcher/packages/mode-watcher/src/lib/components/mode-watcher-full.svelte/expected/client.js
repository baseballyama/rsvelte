import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setInitialMode } from "../mode.js";

var root = $.from_html(`<meta name="theme-color"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Mode_watcher_full($$anchor, $$props) {
	$.push($$props, true);

	let trueNonce = $.prop($$props, 'trueNonce', 3, "");

	$.head('77tzhh', ($$anchor) => {
		var fragment = root_1();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.template_effect(() => $.set_attribute(meta, 'content', $$props.themeColors.dark));
				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if ($$props.themeColors) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		$.html(node_1, () => `<script${trueNonce() ? ` nonce=${trueNonce()}` : ""}>(` + setInitialMode.toString() + `)(` + JSON.stringify($$props.initConfig) + `);</script>`);
		$.append($$anchor, fragment);
	});

	$.pop();
}