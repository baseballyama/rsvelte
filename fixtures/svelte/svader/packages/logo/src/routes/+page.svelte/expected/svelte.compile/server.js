import * as $ from 'svelte/internal/server';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";
import logo from "./logoDark.png";

export default function _page($$renderer) {
	$.head('i2fmny', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,400;1,800&amp;display=swap" rel="stylesheet"/>`);
	});

	$$renderer.push(`<main class="svelte-i2fmny"><div class="canvas-container svelte-i2fmny">`);

	WebGlShader($$renderer, {
		code: shaderCode,
		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" }
		]
	});

	$$renderer.push(`<!----></div> <div class="text svelte-i2fmny"><img${$.attr('src', logo)} alt="S" class="svelte-i2fmny"/> <h1 class="svelte-i2fmny">SVADER</h1></div></main>`);
}