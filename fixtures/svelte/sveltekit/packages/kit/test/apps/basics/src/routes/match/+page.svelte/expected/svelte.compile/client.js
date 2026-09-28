import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { match } from '$app/paths';
import { onMount } from 'svelte';
import { testPaths } from './const';

var root = $.from_html(`<div class="result"> </div>`);
var root_1 = $.from_html(`<h1>Match Test</h1> <div id="server-results"></div> <div id="client-results"></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {Array<{ path: string; result: { id: import('$app/types').RouteId; params: Record<string, import('@sveltejs/kit/params').ParamValue> } | null }>} */
	const clientResults = $.proxy([]);

	onMount(async () => {
		for (const path of testPaths) {
			const result = await match(path);

			clientResults.push({ path, result });
		}
	});

	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);

	$.each(div, 21, () => $$props.data.serverResults, $.index, ($$anchor, $$item) => {
		let path = () => $.get($$item).path;
		let result = () => $.get($$item).result;
		var div_1 = root();
		var text = $.only_child(div_1, true);

		$.template_effect(
			($0) => {
				$.set_attribute(div_1, 'data-path', path());
				$.set_text(text, $0);
			},
			[() => JSON.stringify(result())]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);

	var div_2 = $.sibling(div, 2);

	$.each(div_2, 21, () => clientResults, $.index, ($$anchor, $$item) => {
		let path = () => $.get($$item).path;
		let result = () => $.get($$item).result;
		var div_3 = root();
		var text_1 = $.only_child(div_3, true);

		$.template_effect(
			($0) => {
				$.set_attribute(div_3, 'data-path', path());
				$.set_text(text_1, $0);
			},
			[() => JSON.stringify(result())]
		);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}