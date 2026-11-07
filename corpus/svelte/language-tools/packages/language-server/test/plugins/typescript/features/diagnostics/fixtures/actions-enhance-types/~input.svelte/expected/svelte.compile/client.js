import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div foo="valid"></div> <div></div> <div foo="valid"></div>`, 1);

export default function Input($$anchor) {
	function action(node) {
		node;

		return {
			// TODO: replace this with the Svelte interface generic once it lands in Svelte
			$$_attributes: {
				foo: 'string',
				'on:bar': (e) => {
					e;
				}
			}
		};
	}

	function onBar(e) {
		e;
	}

	function onWrongBar(e) {
		e;
	}

	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => action?.($$node));
	$.effect(() => $.event('bar', div, onBar));

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'foo', 1);
	$.action(div_1, ($$node) => action?.($$node));
	$.effect(() => $.event('bar', div_1, onBar));

	var div_2 = $.sibling(div_1, 2);

	$.action(div_2, ($$node) => action?.($$node));
	$.effect(() => $.event('bar', div_2, onWrongBar));
	$.append($$anchor, fragment);
}