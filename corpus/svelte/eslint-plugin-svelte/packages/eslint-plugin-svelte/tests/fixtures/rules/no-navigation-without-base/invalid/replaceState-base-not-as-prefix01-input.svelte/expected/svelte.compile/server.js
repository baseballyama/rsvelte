import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_not_as_prefix01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		replaceState('/foo/' + base);
		replaceState(`/foo/${base}`);
	});
}