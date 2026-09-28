import * as $ from 'svelte/internal/server';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

export default function _page($$renderer) {
	WebGlShader($$renderer, {
		width: '10000px',
		height: '10000px',
		code: shaderCode,
		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" }
		],

		children: ($$renderer) => {
			$$renderer.push(`<div class="fallback">WebGL not supported in this environment.</div>`);
		},
		$$slots: { default: true }
	});
}