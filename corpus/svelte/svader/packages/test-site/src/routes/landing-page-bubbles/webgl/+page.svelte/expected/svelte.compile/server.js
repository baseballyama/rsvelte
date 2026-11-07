import * as $ from 'svelte/internal/server';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

export default function _page($$renderer) {
	const color = /** @type {const} */ ([0.8, 0.3, 0.0]);

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 */
	function rgbString(r, g, b) {
		return `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
	}

	$.head('1wbdv87', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=SUSE:wght@800&amp;display=swap" rel="stylesheet"/>`);
	});

	$$renderer.push(`<main class="svelte-1wbdv87"><div class="canvas-container svelte-1wbdv87">`);

	WebGlShader($$renderer, {
		code: shaderCode,
		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" },
			{ name: "u_time", value: "time" },
			{ name: "u_color", type: "vec3", value: color }
		]
	});

	$$renderer.push(`<!----></div> <h1 class="svelte-1wbdv87"${$.attr_style('', { '--color': rgbString(...color) })}>SVADER</h1></main>`);
}