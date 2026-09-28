import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span> </span>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.thing);
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(thing)));
				$.append($$anchor, span);
			},

			thing: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.thing);
				var span_1 = root();
				var text_1 = $.only_child(span_1, true);

				$.template_effect(() => $.set_text(text_1, $.get(thing)));
				$.append($$anchor, span_1);
			}
		}
	});
}