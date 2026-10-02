import * as $ from 'svelte/internal/server';
import { replaceState as alias } from '$app/navigation';

export default function ReplaceState_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		alias('/foo');
	});
}