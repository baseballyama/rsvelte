import * as $ from 'svelte/internal/server';

export default function Ternary02_input($$renderer) {
	$$renderer.push(`<div${$.attr_style(` position: ${$.stringify(position)}; ${pointerEvents === false ? 'pointer-events:none;' : ''} `, { top: position === "absolute" ? "20px" : null })}></div>`);
}