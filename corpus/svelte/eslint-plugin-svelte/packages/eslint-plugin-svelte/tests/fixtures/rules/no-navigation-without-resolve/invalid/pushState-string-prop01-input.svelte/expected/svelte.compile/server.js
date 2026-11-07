import * as $ from 'svelte/internal/server';
import { pushState } from '$app/navigation';

export default function PushState_string_prop01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { href } = $$props;

		pushState(href);
	});
}