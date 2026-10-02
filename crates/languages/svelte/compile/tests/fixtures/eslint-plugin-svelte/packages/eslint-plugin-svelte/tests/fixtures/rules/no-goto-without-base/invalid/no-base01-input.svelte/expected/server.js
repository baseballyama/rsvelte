import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function No_base01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		goto('/foo');
		goto('/user:42');
	});
}