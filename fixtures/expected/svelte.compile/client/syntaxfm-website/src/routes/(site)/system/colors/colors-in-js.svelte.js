import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div><h2>Computed CSS Variables</h2> <!></div>`);

export default function Colors_in_js($$anchor, $$props) {
	$.push($$props, true);

	let colors = $.prop($$props, 'colors', 31, () => $.proxy([['load', 'ing']]));

	if (browser) {
		const wrapper = document.querySelector('.theme-wrapper');

		if (wrapper) {
			const variables = getComputedStyle(wrapper);

			colors(Object.values(variables).filter((value) => {
				return value.startsWith('--');
			}).map((variableName) => {
				return [variableName, variables.getPropertyValue(variableName)];
			}));
		}
	}

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	$.each(node, 17, colors, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let val = () => $.get($$array)[0];
		let key = () => $.get($$array)[1];
		var p = root();
		let styles;
		var text = $.only_child(p);

		$.template_effect(() => {
			styles = $.set_style(p, '', styles, { background: key() });
			$.set_text(text, `${val() ?? ''} ${key() ?? ''}`);
		});

		$.append($$anchor, p);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}