import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as reserved from './reserved.remote';

var root = $.from_html(`<p id="reserved-result"> </p> <button id="reserved-run">run</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let result = $.state('pending');

	async function run() {
		const del = await reserved.delete();
		const cls = await reserved.class();
		const ret = await reserved.return();

		$.set(result, `${del}/${cls}/${ret}`);
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, $.get(result)));
	$.delegated('click', button, run);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);