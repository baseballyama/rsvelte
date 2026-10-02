import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_partial_resolve01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		replaceState(resolve('/foo') + '/bar');
		replaceState('/foo' + resolve('/bar'));
	});
}