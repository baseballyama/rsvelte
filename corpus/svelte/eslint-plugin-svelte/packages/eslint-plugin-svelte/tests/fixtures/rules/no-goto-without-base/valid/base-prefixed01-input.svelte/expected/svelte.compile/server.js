import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_prefixed01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		goto(base + '/foo/');

		goto(`${base}/foo/`);
	});
}