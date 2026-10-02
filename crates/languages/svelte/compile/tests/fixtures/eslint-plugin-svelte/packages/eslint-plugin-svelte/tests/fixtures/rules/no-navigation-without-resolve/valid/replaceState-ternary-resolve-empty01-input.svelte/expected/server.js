import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_ternary_resolve_empty01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		replaceState(condition ? resolve('/foo') : '');
		replaceState(condition ? '' : resolve('/foo'));
		replaceState(condition ? '' : '');

		const url = condition ? resolve('/foo') : '';

		replaceState(url);

		const resolved = resolve('/foo');

		replaceState(condition ? resolved : '');
	});
}