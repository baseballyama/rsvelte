import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GenericPopout from './GenericPopout.svelte';

export default function Nested_props2_input($$anchor, $$props) {
	GenericPopout($$anchor, {
		get position() {
			return $$props.position;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}