import * as $ from 'svelte/internal/server';
import * as paths from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_namespace_import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		pushState(paths.base + '/foo/');

		pushState(`${paths.base}/foo/`);
	});
}