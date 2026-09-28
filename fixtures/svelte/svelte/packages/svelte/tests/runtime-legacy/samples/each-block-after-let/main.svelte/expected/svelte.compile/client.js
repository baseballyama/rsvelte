import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div> <!></div> <div><!></div> <div> <!></div>`, 1);

export default function Main($$anchor) {
	const value = ['a'];
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.child(div);
	var node = $.sibling(text);

	$.each(node, 17, () => value, $.index, ($$anchor, n) => {
		$.next();

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $.get(n)));
		$.append($$anchor, text_1);
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Child(node_1, {
		value: ['b'],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const value = $.derived(() => $$slotProps.value);

				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, $.get(value)[0]));
				$.append($$anchor, text_2);
			}
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text_3 = $.child(div_2);
	var node_2 = $.sibling(text_3);

	$.each(node_2, 17, () => value, $.index, ($$anchor, n) => {
		$.next();

		var text_4 = $.text();

		$.template_effect(() => $.set_text(text_4, $.get(n)));
		$.append($$anchor, text_4);
	});

	$.reset(div_2);

	$.template_effect(() => {
		$.set_text(text, `${value[0] ?? ''} `);
		$.set_text(text_3, `${value[0] ?? ''} `);
	});

	$.append($$anchor, fragment);
}