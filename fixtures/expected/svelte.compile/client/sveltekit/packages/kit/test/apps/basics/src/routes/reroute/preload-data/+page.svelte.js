import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preloadData } from '$app/navigation';

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<button>Preload</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {Record<string, any> | null} */
	let data = null;

	async function onClick() {
		const result = await preloadData('/reroute/preload-data/a');

		if (result.type === 'loaded') {
			data = result.data;
		}
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var pre = root();
			var text = $.only_child(pre, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(data, null, 2)]);
			$.append($$anchor, pre);
		};

		$.if(node, ($$render) => {
			if (data) $$render(consequent);
		});
	}

	$.delegated('click', button, onClick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);