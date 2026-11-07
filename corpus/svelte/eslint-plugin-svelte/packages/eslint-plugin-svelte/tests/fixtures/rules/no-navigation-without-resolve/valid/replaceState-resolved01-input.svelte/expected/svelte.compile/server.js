import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolved01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = resolve('/foo/');

		replaceState(resolve('/foo/'));
		replaceState(value);
	});
}