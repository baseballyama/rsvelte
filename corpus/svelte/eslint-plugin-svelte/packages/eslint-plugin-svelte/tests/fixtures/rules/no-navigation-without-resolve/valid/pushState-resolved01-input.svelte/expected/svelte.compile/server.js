import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_resolved01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = resolve('/foo/');

		pushState(resolve('/foo/'));
		pushState(value);
	});
}