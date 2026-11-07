import * as $ from 'svelte/internal/server';

export default function Link_rel_external01_input($$renderer) {
	const value = 'whatever';
	const href = 'whatever';
	const external = 'external';
	const rel = 'external';

	$$renderer.push(`<a href="whatever" rel="external">Click me!</a> <a href="whatever" rel="external">Click me!</a> <a${$.attr('href', value)} rel="external">Click me!</a> <a${$.attr('href', href)} rel="external">Click me!</a> <a href="whatever" rel="external">Click me!</a> <a href="whatever"${$.attr('rel', external)}>Click me!</a> <a href="whatever"${$.attr('rel', rel)}>Click me!</a> <a href="whatever" rel="noopener external noreferrer">Click me!</a>`);
}