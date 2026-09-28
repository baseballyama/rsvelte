import * as $ from 'svelte/internal/server';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let val = 0.75;

		$$renderer.push(`<main class="svelte-1jcq176"><h1 class="svelte-1jcq176">SLIDE ME</h1> <span class="svelte-1jcq176"><div class="canvas-container svelte-1jcq176">`);

		WebGpuShader($$renderer, {
			code: shaderCode,
			parameters: [
				{ label: "Resolution", binding: 0, value: "resolution" },
				{ label: "Offset", binding: 1, value: "offset" },
				{ label: "Scale", binding: 2, value: "scale" },
				{ label: "Value", binding: 3, value: new Float32Array([val]) }
			]
		});

		$$renderer.push(`<!----></div> <input type="range" min="0" max="1" step="0.01"${$.attr('value', val)} class="svelte-1jcq176"/></span></main>`);
	});
}