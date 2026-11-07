import * as $ from 'svelte/internal/server';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

export default function _page($$renderer) {
	$.head('1bv6x0d', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Teko&amp;display=swap" rel="stylesheet"/>`);
	});

	$$renderer.push(`<main class="svelte-1bv6x0d"><div class="canvas-container svelte-1bv6x0d">`);

	WebGpuShader($$renderer, {
		code: shaderCode,
		parameters: [
			{ label: "Resolution", binding: 0, value: "resolution" },
			{ label: "Offset", binding: 1, value: "offset" }
		]
	});

	$$renderer.push(`<!----></div> <h1 class="svelte-1bv6x0d">SVADER</h1></main>`);
}