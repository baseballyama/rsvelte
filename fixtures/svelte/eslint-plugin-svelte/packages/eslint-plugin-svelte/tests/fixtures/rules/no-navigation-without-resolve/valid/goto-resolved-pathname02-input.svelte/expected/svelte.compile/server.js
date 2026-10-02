import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Goto_resolved_pathname02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function navigate(href) {
			goto(href);
		}
	});
}