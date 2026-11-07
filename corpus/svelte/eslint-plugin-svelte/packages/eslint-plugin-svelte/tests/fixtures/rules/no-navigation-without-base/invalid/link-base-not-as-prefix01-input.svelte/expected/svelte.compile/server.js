import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function Link_base_not_as_prefix01_input($$renderer) {
	$$renderer.push(`<a${$.attr('href', '/foo/' + base)}>Click me!</a> <a${$.attr('href', `/foo/${base}`)}>Click me!</a>`);
}