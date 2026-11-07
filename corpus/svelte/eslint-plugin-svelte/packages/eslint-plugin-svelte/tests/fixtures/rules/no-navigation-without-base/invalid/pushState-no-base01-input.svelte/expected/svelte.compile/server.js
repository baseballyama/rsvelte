import * as $ from 'svelte/internal/server';
import { pushState } from '$app/navigation';

export default function PushState_no_base01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = "/foo";

		pushState('/foo');
		pushState(value);
	});
}