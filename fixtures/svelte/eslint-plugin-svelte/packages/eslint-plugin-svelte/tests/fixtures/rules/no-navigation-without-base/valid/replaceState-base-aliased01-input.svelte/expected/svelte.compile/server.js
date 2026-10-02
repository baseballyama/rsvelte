import * as $ from 'svelte/internal/server';
import { base as alias } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		replaceState(alias + '/foo/');

		replaceState(`${alias}/foo/`);
	});
}