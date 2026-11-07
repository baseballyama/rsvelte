import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.css";
import { navigating } from "$app/stores";
import { expoOut } from "svelte/easing";
import { slide } from "svelte/transition";

var root = $.from_html(`<div class="fixed w-full top-0 right-0 left-0 h-1 z-50 bg-primary"></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	const $navigating = () => $.store_get(navigating, '$navigating', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(1, div, () => slide, () => ({ delay: 100, duration: 12000, axis: "x", easing: expoOut }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($navigating()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$$cleanup();
}