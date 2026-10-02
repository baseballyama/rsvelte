import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState } from '$app/navigation';

export default function PushState_resolved_pathname_wrong_module01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState($$props.href);
	$.pop();
}