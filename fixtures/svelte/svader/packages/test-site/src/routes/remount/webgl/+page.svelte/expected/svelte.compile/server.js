import * as $ from 'svelte/internal/server';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

export default function _page($$renderer) {
	let show = true;

	$$renderer.push(`<label for="show">Show</label> <input id="show" type="checkbox"${$.attr('checked', show, true)}/> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		WebGlShader($$renderer, {
			width: '500px',
			height: '500px',
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
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}