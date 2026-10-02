import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './rename-prop-with-slot-events.svelte';

export default function Rename_slot_events_importer($$anchor) {
	A($$anchor, {
		prop: 1,
		$$events: { click: (e) => e },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const aSlot = $.derived(() => $$slotProps.aSlot);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(aSlot)));
				$.append($$anchor, text);
			}
		}
	});
}