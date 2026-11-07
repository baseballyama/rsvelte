import * as $ from 'svelte/internal/server';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

export default function _page($$renderer) {
	let show = true;

	$$renderer.push(`<label for="show">Show</label> <input id="show" type="checkbox"${$.attr('checked', show, true)}/> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		WebGpuShader($$renderer, {
			width: '500px',
			height: '500px',
			code: shaderCode,
			parameters: [
				{ label: "Resolution", binding: 0, value: "resolution" },
				{ label: "Offset", binding: 1, value: "offset" }
			],

			children: ($$renderer) => {
				$$renderer.push(`<div class="fallback">WebGPU not supported in this environment.</div>`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}