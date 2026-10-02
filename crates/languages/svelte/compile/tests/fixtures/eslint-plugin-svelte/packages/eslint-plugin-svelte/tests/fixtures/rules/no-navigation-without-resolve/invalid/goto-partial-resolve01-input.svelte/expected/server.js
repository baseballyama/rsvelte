import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_partial_resolve01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto(resolve('/foo') + '/bar');
		goto('/foo' + resolve('/bar'));
	});
}