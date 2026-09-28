import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import { createCollapseState } from "./root.svelte.js";

var root = $.from_html(`<div class="*:border-kui-light-gray-200 dark:*:border-kui-dark-gray-400 last:border-kui-light-gray-200 dark:last:border-kui-dark-gray-400
 w-full *:border-t last:border-b"><!></div>`);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	let multiple = $.prop($$props, 'multiple', 3, false);
	const collapseState = createCollapseState({ multiple: multiple(), item: [] });

	setContext("collapse", collapseState);

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}