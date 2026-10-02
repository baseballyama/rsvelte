import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './_ExcludeAndPrefixFilterComponent.svelte';

export default function _ExcludeAndPrefixFilter($$anchor) {
	let disabled = $.state(false);

	MyComponent($$anchor, {
		class: 'my-class',
		get button$disabled() {
			return $.get(disabled);
		},
		button$onclick: () => $.set(disabled, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Click Me Only Once');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}