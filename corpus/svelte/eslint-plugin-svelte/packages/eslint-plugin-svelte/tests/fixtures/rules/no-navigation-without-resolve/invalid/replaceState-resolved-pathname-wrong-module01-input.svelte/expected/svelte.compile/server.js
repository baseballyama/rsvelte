import * as $ from 'svelte/internal/server';
import { replaceState } from '$app/navigation';

export default function ReplaceState_resolved_pathname_wrong_module01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { href } = $$props;

		replaceState(href);
	});
}