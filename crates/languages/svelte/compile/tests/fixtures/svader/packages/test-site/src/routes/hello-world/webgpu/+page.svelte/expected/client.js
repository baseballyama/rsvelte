import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

var root = $.from_html(`<div class="fallback">WebGPU not supported in this environment.</div>`);

export default function _page($$anchor) {
	WebGpuShader($$anchor, {
		width: '500px',
		height: '500px',
		get code() {
			return shaderCode;
		},

		parameters: [
			{ label: "Resolution", binding: 0, value: "resolution" },
			{ label: "Offset", binding: 1, value: "offset" }
		],

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}