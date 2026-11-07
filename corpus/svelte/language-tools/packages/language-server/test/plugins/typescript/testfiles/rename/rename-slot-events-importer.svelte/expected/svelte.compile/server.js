import * as $ from 'svelte/internal/server';
import A from './rename-prop-with-slot-events.svelte';

export default function Rename_slot_events_importer($$renderer) {
	A($$renderer, {
		prop: 1,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { aSlot }) => {
				$$renderer.push(`<!---->${$.escape(aSlot)}`);
			}
		}
	});
}