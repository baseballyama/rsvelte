import * as $ from 'svelte/internal/server';

export default function ErrorIcon($$renderer, $$props) {
	let { primary = '#ff4b4b', secondary = '#fff' } = $$props;

	$$renderer.push(`<div class="svelte-1rqrtk7"${$.attr_style('', { '--primary': primary, '--secondary': secondary })}></div>`);
}