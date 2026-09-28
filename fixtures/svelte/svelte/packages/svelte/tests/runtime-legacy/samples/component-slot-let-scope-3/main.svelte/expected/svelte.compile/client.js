import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p slot="foo"> </p>`);
var root_2 = $.from_html(`<p slot="bar"></p>`);

export default function Main($$anchor) {
	let count = 42;

	Nested($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const count = $.derived(() => $$slotProps.count);
				var p = root();
				var text = $.only_child(p);

				$.template_effect(() => $.set_text(text, `count in default slot: ${$.get(count) ?? ''}`));
				$.append($$anchor, p);
			},

			foo: ($$anchor, $$slotProps) => {
				const count = $.derived(() => $$slotProps.count);
				var p_1 = root_1();
				var text_1 = $.only_child(p_1);

				$.template_effect(() => $.set_text(text_1, `count in foo slot: ${$.get(count) ?? ''}`));
				$.append($$anchor, p_1);
			},

			bar: ($$anchor, $$slotProps) => {
				var p_2 = root_2();

				p_2.textContent = 'count in bar slot: 42';
				$.append($$anchor, p_2);
			}
		}
	});
}