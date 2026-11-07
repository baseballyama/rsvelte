import * as $ from 'svelte/internal/server';

export default function Command_wrapper($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div${$.attr_style('', { position: 'relative', width: '100%' })}><div${$.attr_style('', {
		height: '475px',
		width: '100%',
		position: 'absolute',
		top: '0',
		left: '0'
	})}>`);

	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}