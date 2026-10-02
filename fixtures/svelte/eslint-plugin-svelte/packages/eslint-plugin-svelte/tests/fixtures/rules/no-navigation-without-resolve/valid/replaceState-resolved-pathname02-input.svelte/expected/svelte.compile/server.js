import * as $ from 'svelte/internal/server';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolved_pathname02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function navigate(href) {
			replaceState(href);
		}
	});
}