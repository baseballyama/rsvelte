import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_partial_resolve01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pushState(resolve('/foo') + '/bar');
		pushState('/foo' + resolve('/bar'));
	});
}