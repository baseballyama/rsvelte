import * as $ from 'svelte/internal/server';

export default function Ternary01_input($$renderer) {
	$$renderer.push(`<div${$.attr_style(` position: ${$.stringify(position)}; ${position === 'absolute' ? 'top: 20px;' : ''} ${pointerEvents === false ? 'pointer-events:none;' : ''} `)}></div> <div${$.attr_style(position === "absolute" ? "top: 20px;" : "")}></div>`);
}