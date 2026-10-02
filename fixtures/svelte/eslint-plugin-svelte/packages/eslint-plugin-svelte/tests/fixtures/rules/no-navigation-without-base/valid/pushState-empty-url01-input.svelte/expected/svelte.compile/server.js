import * as $ from 'svelte/internal/server';
import { pushState } from '$app/navigation';

export default function PushState_empty_url01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pushState('');
		pushState(``);
	});
}