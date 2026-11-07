import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_base_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		goto(paths.base + '/foo/');

		goto(`${paths.base}/foo/`);
	});
}