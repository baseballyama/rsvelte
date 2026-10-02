import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";

var root = $.from_html(`<div><!> <button>Increment</button></div> <div><!> <button>Increment</button></div> <div><!> <button>Increment</button></div>`, 1);

export default function Main($$anchor) {
	let c = 0;
	let d = 0;
	let e = 0;
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Nested(node, {
		props: ['hello', 'world'],
		$$slots: {
			main: ($$anchor, $$slotProps) => {
				const pair = $.derived(() => $$slotProps.value);
				const foo = $.derived(() => $$slotProps.data);
				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(pair)[0] ?? ''} ${$.get(pair)[1] ?? ''} ${c ?? ''} ${$.get(foo) ?? ''}`));
				$.append($$anchor, text);
			}
		}
	});

	var button = $.sibling(node, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Nested(node_1, {
		props: ['hello', 'world'],
		$$slots: {
			main: ($$anchor, $$slotProps) => {
				const value = $.derived(() => {
					let [a, b] = $$slotProps.value;

					return { a, b };
				});

				const foo = $.derived(() => $$slotProps.data);
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, `${$.get(value).a ?? ''} ${$.get(value).b ?? ''} ${d ?? ''} ${$.get(foo) ?? ''}`));
				$.append($$anchor, text_1);
			}
		}
	});

	var button_1 = $.sibling(node_1, 2);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Nested(node_2, {
		props: { a: 'hello', b: 'world' },
		$$slots: {
			main: ($$anchor, $$slotProps) => {
				const value_1 = $.derived(() => {
					let { a, b } = $$slotProps.value;

					return { a, b };
				});

				const foo = $.derived(() => $$slotProps.data);
				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, `${$.get(value_1).a ?? ''} ${$.get(value_1).b ?? ''} ${e ?? ''} ${$.get(foo) ?? ''}`));
				$.append($$anchor, text_2);
			}
		}
	});

	var button_2 = $.sibling(node_2, 2);

	$.reset(div_2);

	$.event('click', button, () => {
		c += 1;
	});

	$.event('click', button_1, () => {
		d += 1;
	});

	$.event('click', button_2, () => {
		e += 1;
	});

	$.append($$anchor, fragment);
}