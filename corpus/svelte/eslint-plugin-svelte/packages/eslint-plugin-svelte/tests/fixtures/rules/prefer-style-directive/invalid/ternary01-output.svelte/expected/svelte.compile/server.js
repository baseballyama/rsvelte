import * as $ from 'svelte/internal/server';

export default function Ternary01_output($$renderer) {
	$$renderer.push(`<div${$.attr_style(` ${position === 'absolute' ? 'top: 20px;' : ''} `, {
		position,
		'pointer-events': pointerEvents === false ? 'none' : null
	})}></div> <div${$.attr_style('', { top: position === "absolute" ? "20px" : null })}></div>`);
}