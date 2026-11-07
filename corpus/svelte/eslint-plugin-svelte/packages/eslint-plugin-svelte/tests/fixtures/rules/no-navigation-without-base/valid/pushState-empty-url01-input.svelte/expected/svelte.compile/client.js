import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState } from '$app/navigation';

export default function PushState_empty_url01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState('');
	pushState(``);
	$.pop();
}