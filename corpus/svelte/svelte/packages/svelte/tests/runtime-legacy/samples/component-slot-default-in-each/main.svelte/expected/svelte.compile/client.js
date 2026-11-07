import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const value = $.derived(() => $$slotProps.value);
				var div = root();
				var text = $.only_child(div);

				$.template_effect(() => $.set_text(text, `${$.get(item) ?? ''} - ${$.get(value) ?? ''}`));
				$.append($$anchor, div);
			}
		}
	});
}