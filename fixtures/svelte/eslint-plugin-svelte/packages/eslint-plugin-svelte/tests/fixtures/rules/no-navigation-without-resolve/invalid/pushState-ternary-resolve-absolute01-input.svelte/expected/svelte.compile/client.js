import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_absolute01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;

	pushState(condition ? resolve('/foo') : 'https://example.com');
	pushState(condition ? '' : 'https://example.com');
	pushState(condition ? 'https://example.com' : 'https://other.com');
	$.pop();
}