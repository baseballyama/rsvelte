import * as $ from 'svelte/internal/server';

export default function LoaderIcon($$renderer, $$props) {
	let { primary = '#616161', secondary = '#e0e0e0' } = $$props;

	$$renderer.push(`<div class="svelte-1s5buy2"${$.attr_style('', { '--primary': primary, '--secondary': secondary })}></div>`);
}