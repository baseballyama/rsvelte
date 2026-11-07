import * as $ from 'svelte/internal/server';

export default function Ternary02_output($$renderer) {
	$$renderer.push(`<div${$.attr_style(` ${pointerEvents === false ? 'pointer-events:none;' : ''} `, { position, top: position === "absolute" ? "20px" : null })}></div>`);
}