import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_ternary_resolve_absolute01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		pushState(condition ? resolve('/foo') : 'https://example.com');
		pushState(condition ? '' : 'https://example.com');
		pushState(condition ? 'https://example.com' : 'https://other.com');
	});
}