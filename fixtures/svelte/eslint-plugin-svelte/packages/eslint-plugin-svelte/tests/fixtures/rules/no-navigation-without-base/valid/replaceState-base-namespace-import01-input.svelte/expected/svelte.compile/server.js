import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		replaceState(paths.base + '/foo/');

		replaceState(`${paths.base}/foo/`);
	});
}