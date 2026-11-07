import * as $ from 'svelte/internal/server';
import { base as alias } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_aliased01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line prefer-template -- Testing both variants
		goto(alias + '/foo/');

		goto(`${alias}/foo/`);
	});
}