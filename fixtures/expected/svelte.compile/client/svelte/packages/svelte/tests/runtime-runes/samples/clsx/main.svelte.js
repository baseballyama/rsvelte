import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./child.svelte";

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <!> <!> <!> <!> <!> <applied-to-custom-element></applied-to-custom-element> <button>update</button>`, 3);

export default function Main($$anchor) {
	let foo = $.state('foo');
	let bar = $.state(null);
	let spread = { class: { foo: true, bar: false } };
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, $.clsx({ foo: true, bar: false }), 'svelte-k25eyx');

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, $.clsx(['foo', false && 'bar']), 'svelte-k25eyx');

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);

	$.attribute_effect(div_4, () => ({ ...spread }), void 0, void 0, void 0, 'svelte-k25eyx');

	var node = $.sibling(div_4, 2);

	Child(node, { class: { foo: true, bar: false } });

	var node_1 = $.sibling(node, 2);

	Child(node_1, { class: ['foo', false && 'bar'] });

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => ({ foo: $.get(foo), bar: $.get(bar) }));

		Child(node_2, {
			get class() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => [$.get(foo), $.get(bar)]);

		Child(node_3, {
			get class() {
				return $.get($0);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	Child(node_4, $.spread_props(() => spread));

	var applied_to_custom_element = $.sibling(node_4, 2);
	var button = $.sibling(applied_to_custom_element, 2);

	$.template_effect(() => {
		$.set_class(div_2, 1, $.clsx({ foo: $.get(foo), bar: $.get(bar) }), 'svelte-k25eyx');
		$.set_class(div_3, 1, $.clsx([$.get(foo), $.get(bar)]), 'svelte-k25eyx');
		$.set_class(applied_to_custom_element, 1, $.clsx({ foo: $.get(foo), bar: $.get(bar) }), 'svelte-k25eyx');
	});

	$.delegated('click', button, () => {
		$.set(foo, null);
		$.set(bar, 'bar');
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);