import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState } from '$app/navigation';

export default function PushState_no_base01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = "/foo";

	pushState('/foo');
	pushState(value);
	$.pop();
}