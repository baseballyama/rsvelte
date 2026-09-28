import * as $ from 'svelte/internal/server';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

export default function _page($$renderer) {
	let val = 0.75;

	$$renderer.push(`<main class="svelte-1sp0hbd"><h1 class="svelte-1sp0hbd">SLIDE ME</h1> <span class="svelte-1sp0hbd"><div class="canvas-container svelte-1sp0hbd">`);

	WebGlShader($$renderer, {
		code: shaderCode,
		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" },
			{ name: "u_value", type: "float", value: val }
		]
	});

	$$renderer.push(`<!----></div> <input type="range" min="0" max="1" step="0.01"${$.attr('value', val)} class="svelte-1sp0hbd"/></span></main>`);
}