import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createPageTitle } from '$doclib/util.js';
import vars from './vars-defaults.js';

var root = $.from_html(`<tr><td class="varname svelte-bmkt69"> </td><td class="svelte-bmkt69"> </td></tr>`);
var root_1 = $.from_html(`<h2>CSS Variables</h2> <table class="svelte-bmkt69"><thead><tr><th class="svelte-bmkt69">Variable</th><th class="svelte-bmkt69">Default</th></tr></thead><tbody></tbody></table>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	$.head('bmkt69', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('CSS Variables')]
		);
	});

	var table = $.sibling($.first_child(fragment), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => vars, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let v = () => $.get($$array)[0];
		let def = () => $.get($$array)[1];
		var tr = root();
		var td = $.child(tr);
		var text = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text, v());
			$.set_text(text_1, def());
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.append($$anchor, fragment);
	$.pop();
}