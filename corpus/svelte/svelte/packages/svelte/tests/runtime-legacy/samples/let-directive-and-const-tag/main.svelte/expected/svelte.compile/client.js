import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './component.svelte';

export default function Main($$anchor) {
	Component($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const data = $.derived(() => $$slotProps.data);
				const thing = $.derived(() => $.get(data));

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(thing)));
				$.append($$anchor, text);
			}
		}
	});
}