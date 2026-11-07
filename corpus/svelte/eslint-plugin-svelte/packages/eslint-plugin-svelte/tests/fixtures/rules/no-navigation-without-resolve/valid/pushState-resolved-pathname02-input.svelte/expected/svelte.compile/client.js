import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState } from '$app/navigation';

export default function PushState_resolved_pathname02_input($$anchor, $$props) {
	$.push($$props, true);

	function navigate(href) {
		pushState(href);
	}

	$.pop();
}