import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Goto_ignored01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto('/foo');
	});
}