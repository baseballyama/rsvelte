import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function Goto_resolved_pathname02_input($$anchor, $$props) {
	$.push($$props, true);

	function navigate(href) {
		goto(href);
	}

	$.pop();
}