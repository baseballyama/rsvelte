import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<button type="button"> </button>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const set = $.derived(() => $$slotProps.set);
				const key = $.derived(() => $$slotProps.key);
				const item = $.derived(() => $$slotProps.item);
				var button = root();
				var text = $.only_child(button);

				$.template_effect(() => $.set_text(text, `Set ${$.get(key) ?? ''}-${$.get(item) ?? ''}`));
				$.event('click', button, () => $.get(set)(`value-${$.get(key)}-${$.get(item)}`));
				$.append($$anchor, button);
			}
		}
	});
}