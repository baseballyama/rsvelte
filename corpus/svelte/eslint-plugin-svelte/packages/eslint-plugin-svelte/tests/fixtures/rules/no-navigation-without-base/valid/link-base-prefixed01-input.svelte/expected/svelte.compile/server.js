import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function Link_base_prefixed01_input($$renderer) {
	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	$$renderer.push(`<a${$.attr('href', base + '/foo/')}>Click me!</a> <a${$.attr('href', `${base}/foo/`)}>Click me!</a> <a${$.attr('href', value1)}>Click me!</a> <a${$.attr('href', value2)}>Click me!</a>`);
}