import * as $ from 'svelte/internal/server';
import { base as alias } from '$app/paths';

export default function Link_base_aliased01_input($$renderer) {
	$$renderer.push(`<a${$.attr('href', alias + '/foo/')}>Click me!</a>; <a${$.attr('href', `${alias}/foo/`)}>Click me!</a>;`);
}