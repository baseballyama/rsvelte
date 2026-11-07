import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_ternary_resolve_absolute01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;

	replaceState(condition ? resolve('/foo') : 'https://example.com');
	replaceState(condition ? '' : 'https://example.com');
	replaceState(condition ? 'https://example.com' : 'https://other.com');
	$.pop();
}