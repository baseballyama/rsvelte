import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GenericPopout from './GenericPopout.svelte';

export default function Nested_props3_input($$anchor, $$props) {
	$.push($$props, true);

	GenericPopout($$anchor, {
		get position() {
			return $$props.wrapper.position;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}