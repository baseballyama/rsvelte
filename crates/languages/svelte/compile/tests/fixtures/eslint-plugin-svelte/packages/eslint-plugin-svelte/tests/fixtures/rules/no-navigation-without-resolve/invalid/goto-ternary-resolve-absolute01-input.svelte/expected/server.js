import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_ternary_resolve_absolute01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;

		goto(condition ? resolve('/foo') : 'https://example.com');
		goto(condition ? 'https://example.com' : resolve('/foo'));
		goto(condition ? 'https://example.com' : 'https://other.com');
	});
}