import * as $ from 'svelte/internal/server';
import { pushState } from '$app/navigation';

export default function PushState_resolved_pathname02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function navigate(href) {
			pushState(href);
		}
	});
}