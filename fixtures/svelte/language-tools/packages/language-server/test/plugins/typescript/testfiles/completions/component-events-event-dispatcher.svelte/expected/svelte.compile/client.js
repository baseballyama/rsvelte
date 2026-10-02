import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

export default function Component_events_event_dispatcher($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	$.pop();
	/**abc*/
}