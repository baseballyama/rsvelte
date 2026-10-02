import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_empty01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		pushState(condition ? resolve('/foo') : '');
		pushState(condition ? '' : resolve('/foo'));
		pushState(condition ? '' : '');

		const url = condition ? resolve('/foo') : '';

		pushState(url);

		const resolved = resolve('/foo');

		pushState(condition ? resolved : '');
	});
}