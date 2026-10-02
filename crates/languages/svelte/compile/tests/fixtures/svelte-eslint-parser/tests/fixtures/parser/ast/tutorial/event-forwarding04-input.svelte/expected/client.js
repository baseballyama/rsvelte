import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Event_forwarding04_input($$anchor, $$props) {
	Inner($$anchor, {
		$$events: {
			message: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}