import * as $ from 'svelte/internal/server';
import { base as alias } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		pushState(alias + '/foo/');

		pushState(`${alias}/foo/`);
	});
}