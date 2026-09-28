import * as $ from 'svelte/internal/server';

export default function Color_indicator($$renderer, $$props) {
	let { color } = $$props;

	$$renderer.push(`<span class="inline-block size-3 border border-border/50"${$.attr_style(`background-color: ${$.stringify(color)}`)}></span>`);
}