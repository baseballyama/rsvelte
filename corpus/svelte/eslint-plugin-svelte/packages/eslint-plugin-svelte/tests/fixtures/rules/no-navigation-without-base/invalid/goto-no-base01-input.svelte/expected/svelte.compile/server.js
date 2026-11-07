import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Goto_no_base01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = "/foo";

		goto('/foo');
		goto(value);
	});
}