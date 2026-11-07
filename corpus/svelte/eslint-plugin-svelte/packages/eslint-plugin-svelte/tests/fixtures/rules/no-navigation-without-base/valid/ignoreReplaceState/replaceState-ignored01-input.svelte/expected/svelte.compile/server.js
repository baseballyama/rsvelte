import * as $ from 'svelte/internal/server';
import { replaceState } from '$app/navigation';

export default function ReplaceState_ignored01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		replaceState('/foo');
	});
}