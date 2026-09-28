import * as $ from 'svelte/internal/server';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

export default function _page($$renderer) {
	WebGpuShader($$renderer, {
		width: '10000px',
		height: '10000px',
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
}