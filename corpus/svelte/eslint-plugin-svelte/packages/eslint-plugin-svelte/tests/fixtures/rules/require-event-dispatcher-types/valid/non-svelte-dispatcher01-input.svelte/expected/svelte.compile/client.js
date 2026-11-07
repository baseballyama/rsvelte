import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from './unknown';

export default function Non_svelte_dispatcher01_input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	$.pop();
}