import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_not_as_prefix01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pushState('/foo/' + base);
		pushState(`/foo/${base}`);
	});
}