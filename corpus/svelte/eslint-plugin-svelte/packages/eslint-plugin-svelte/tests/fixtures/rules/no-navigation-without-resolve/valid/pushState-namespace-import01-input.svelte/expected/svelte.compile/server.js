import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pushState(paths.resolve('/foo/'));
	});
}