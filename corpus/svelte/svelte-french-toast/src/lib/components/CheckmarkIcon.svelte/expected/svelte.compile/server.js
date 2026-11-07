import * as $ from 'svelte/internal/server';

export default function CheckmarkIcon($$renderer, $$props) {
	let { primary = '#61d345', secondary = '#fff' } = $$props;

	$$renderer.push(`<div class="svelte-1fonl50"${$.attr_style('', { '--primary': primary, '--secondary': secondary })}></div>`);
}