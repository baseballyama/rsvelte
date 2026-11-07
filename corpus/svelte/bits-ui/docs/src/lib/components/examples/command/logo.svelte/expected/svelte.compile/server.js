import * as $ from 'svelte/internal/server';

export default function Logo($$renderer, $$props) {
	let { size = "20px", children } = $$props;

	$$renderer.push(`<div class="blurLogo"${$.attr_style('', { width: size, height: size })}><div class="bg" aria-hidden="true">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div> <div class="inner">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}