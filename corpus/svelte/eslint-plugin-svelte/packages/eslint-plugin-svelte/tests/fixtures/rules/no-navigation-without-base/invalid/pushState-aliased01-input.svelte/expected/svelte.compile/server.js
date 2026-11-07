import * as $ from 'svelte/internal/server';
import { pushState as alias } from '$app/navigation';

export default function PushState_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		alias('/foo');
	});
}