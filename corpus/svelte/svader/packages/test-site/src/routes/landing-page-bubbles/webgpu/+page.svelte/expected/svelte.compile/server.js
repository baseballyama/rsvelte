import * as $ from 'svelte/internal/server';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const color = /** @type {const} */ ([0.8, 0.3, 0.0]);

		/**
		 * @param {number} r
		 * @param {number} g
		 * @param {number} b
		 */
		function rgbString(r, g, b) {
			return `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
		}

		$.head('1hz7ps', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=SUSE:wght@800&amp;display=swap" rel="stylesheet"/>`);
		});

		$$renderer.push(`<main class="svelte-1hz7ps"><div class="canvas-container svelte-1hz7ps">`);

		WebGpuShader($$renderer, {
			code: shaderCode,
			parameters: [
				{ label: "Offset", binding: 0, value: "offset" },
				{ label: "Scale", binding: 1, value: "scale" },
				{ label: "Time", binding: 2, value: "time" },
				{ label: "Color", binding: 3, value: new Float32Array(color) }
			]
		});

		$$renderer.push(`<!----></div> <h1 class="svelte-1hz7ps"${$.attr_style('', { '--color': rgbString(...color) })}>SVADER</h1></main>`);
	});
}