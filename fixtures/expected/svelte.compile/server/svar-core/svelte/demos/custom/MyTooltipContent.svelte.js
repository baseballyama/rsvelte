import * as $ from 'svelte/internal/server';

export default function MyTooltipContent($$renderer, $$props) {
	const { x, y, value } = $$props;

	$$renderer.push(`<div style="padding: 4px 8px; color: #8df;"><div><b>Value</b>: ${$.escape(value)}</div> <div><b>X</b>: ${$.escape(x)}</div> <div><b>Y</b>: ${$.escape(y)}</div></div>`);
}