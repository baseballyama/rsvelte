import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_prefixed01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value1 = base + '/foo/';
		const value2 = `${base}/foo/`;

		// eslint-disable-next-line prefer-template -- Testing both variants
		replaceState(base + '/foo/');

		replaceState(`${base}/foo/`);
		replaceState(value1);
		replaceState(value2);
	});
}