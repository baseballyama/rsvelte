import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';

export default function No_base01_input($$anchor, $$props) {
	$.push($$props, true);
	goto('/foo');
	goto('/user:42');
	$.pop();
}