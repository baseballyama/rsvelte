import * as $ from 'svelte/internal/server';
import Code from './Code.svelte';

export default function Example($$renderer, $$props) {
	let { width = '100%', aspectRatio = '1', files = [], children } = $$props;

	$$renderer.push(`<div class="svelte-3hti2i"${$.attr_style('', { 'max-width': width, 'aspect-ratio': aspectRatio })}>`);
	children($$renderer);
	$$renderer.push(`<!----></div> `);
	Code($$renderer, { copy: true, files });
	$$renderer.push(`<!---->`);
}