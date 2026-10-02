import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pushState as alias } from '$app/navigation';

export default function PushState_aliased01_input($$anchor, $$props) {
	$.push($$props, true);
	alias('/foo');
	$.pop();
}