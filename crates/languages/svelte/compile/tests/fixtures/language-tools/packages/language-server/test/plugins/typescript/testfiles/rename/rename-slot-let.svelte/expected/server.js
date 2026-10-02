import * as $ from 'svelte/internal/server';
import A from './rename-prop-with-slot-events.svelte';

export default function Rename_slot_let($$renderer) {
	A($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { aSlot, hi }) => {
				$$renderer.push(`<!---->${$.escape(aSlot)}`);
			}
		}
	});
}