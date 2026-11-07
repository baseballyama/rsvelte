import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Teko&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<main class="svelte-1m16zh0"><div class="canvas-container svelte-1m16zh0"><!></div> <h1 class="svelte-1m16zh0">SVADER</h1></main>`);

export default function _page($$anchor) {
	var main = root_1();

	$.head('1m16zh0', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	var div = $.child(main);
	var node = $.child(div);

	WebGlShader(node, {
		get code() {
			return shaderCode;
		},

		parameters: [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" }
		]
	});

	$.reset(div);
	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}