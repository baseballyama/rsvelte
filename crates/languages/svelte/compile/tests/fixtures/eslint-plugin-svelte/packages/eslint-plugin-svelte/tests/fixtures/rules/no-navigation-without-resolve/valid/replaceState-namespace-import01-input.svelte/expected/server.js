import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		replaceState(paths.resolve('/foo/'));
	});
}