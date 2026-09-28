import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

var root = $.from_html(`<div class="fallback">WebGL not supported in this environment.</div>`);

export default function _page($$anchor) {
	WebGlShader($$anchor, {
		width: '500px',
		height: '500px',
		get code() {
			return shaderCode;
		},

		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" }
		],

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}