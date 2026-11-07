import * as $ from 'svelte/internal/server';
import { replaceState } from '$app/navigation';

export default function ReplaceState_no_base01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = "/foo";

		replaceState('/foo');
		replaceState(value);
	});
}