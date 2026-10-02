import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_ternary_resolve_absolute01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		replaceState(condition ? resolve('/foo') : 'https://example.com');
		replaceState(condition ? '' : 'https://example.com');
		replaceState(condition ? 'https://example.com' : 'https://other.com');
	});
}