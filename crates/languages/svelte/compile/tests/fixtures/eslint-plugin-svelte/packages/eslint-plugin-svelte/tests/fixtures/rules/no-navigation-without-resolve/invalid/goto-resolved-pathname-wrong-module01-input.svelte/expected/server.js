import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';

export default function Goto_resolved_pathname_wrong_module01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { href } = $$props;

		goto(href);
	});
}