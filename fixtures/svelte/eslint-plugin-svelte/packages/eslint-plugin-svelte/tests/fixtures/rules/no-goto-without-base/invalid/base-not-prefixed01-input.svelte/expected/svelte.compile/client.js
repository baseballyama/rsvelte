import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_not_prefixed01_input($$anchor, $$props) {
	$.push($$props, true);
	goto('/foo/' + base);
	goto(`/foo/${base}`);
	$.pop();
}