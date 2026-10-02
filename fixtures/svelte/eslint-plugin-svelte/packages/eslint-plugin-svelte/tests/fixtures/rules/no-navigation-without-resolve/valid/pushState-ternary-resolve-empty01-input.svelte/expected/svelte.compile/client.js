import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_empty01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;

	pushState(condition ? resolve('/foo') : '');
	pushState(condition ? '' : resolve('/foo'));
	pushState(condition ? '' : '');

	const url = condition ? resolve('/foo') : '';

	pushState(url);

	const resolved = resolve('/foo');

	pushState(condition ? resolved : '');
	$.pop();
}