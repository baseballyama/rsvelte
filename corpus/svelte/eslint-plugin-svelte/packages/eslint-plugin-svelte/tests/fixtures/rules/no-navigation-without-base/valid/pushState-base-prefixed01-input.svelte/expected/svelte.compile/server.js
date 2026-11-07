import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_prefixed01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value1 = base + '/foo/';
		const value2 = `${base}/foo/`;

		// eslint-disable-next-line prefer-template -- Testing both variants
		pushState(base + '/foo/');

		pushState(`${base}/foo/`);
		pushState(value1);
		pushState(value2);
	});
}