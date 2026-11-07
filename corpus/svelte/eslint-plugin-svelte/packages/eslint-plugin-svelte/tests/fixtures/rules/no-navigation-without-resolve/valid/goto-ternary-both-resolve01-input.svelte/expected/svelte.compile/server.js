import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_ternary_both_resolve01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const condition = true;
		const url = condition ? resolve('/foo') : resolve('/bar');
		const resolved = resolve('/foo');

		goto(condition ? resolve('/foo') : resolve('/bar'));
		goto(url);
		goto(condition ? resolved : resolve('/bar'));
	});
}