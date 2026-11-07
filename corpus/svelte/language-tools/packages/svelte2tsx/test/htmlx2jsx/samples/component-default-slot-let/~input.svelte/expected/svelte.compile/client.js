import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Input($$anchor) {
	Component($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const n = $.derived(() => $$slotProps.name);
				const thing = $.derived(() => $$slotProps.thing);
				var h1 = root();
				var text = $.only_child(h1);

				$.template_effect(() => $.set_text(text, `Hello ${$.get(thing) ?? ''} ${$.get(n) ?? ''}`));
				$.append($$anchor, h1);
			}
		}
	});
}