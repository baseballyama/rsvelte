import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Teko&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<main class="svelte-1bv6x0d"><div class="canvas-container svelte-1bv6x0d"><!></div> <h1 class="svelte-1bv6x0d">SVADER</h1></main>`);

export default function _page($$anchor) {
	var main = root_1();

	$.head('1bv6x0d', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	var div = $.child(main);
	var node = $.child(div);

	WebGpuShader(node, {
		get code() {
			return shaderCode;
		},

		parameters: [
			{ label: "Resolution", binding: 0, value: "resolution" },
			{ label: "Offset", binding: 1, value: "offset" }
		]
	});

	$.reset(div);
	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}