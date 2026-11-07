import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Generics from './generics.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Generics(node, {
		a: ['a', 'b'],
		b: 'anchor',
		c: false,
		$$events: { b: (e) => e.detail === 'str' },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const a = $.derived(() => $$slotProps.a);
				const b = $.derived(() => $$slotProps.b);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(a) === 'str'}${$.get(b) === 'anchor'}`));
				$.append($$anchor, text);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Generics(node_1, {
		a: [{ a: 1, b: 1 }],
		b: 'asd',
		c: '',
		$$events: { b: (e) => e.detail === true },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const a = $.derived(() => $$slotProps.a);

				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(a) === true));
				$.append($$anchor, text_1);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Generics(node_2, {
		a: ['a', 'b'],
		b: 'anchor',
		c: false,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const b = $.derived(() => $$slotProps.b);

				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, $.get(b) === 'big'));
				$.append($$anchor, text_2);
			}
		}
	});

	$.append($$anchor, fragment);
}