import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";
import logo from "./logoDark.png";

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,400;1,800&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<main class="svelte-i2fmny"><div class="canvas-container svelte-i2fmny"><!></div> <div class="text svelte-i2fmny"><img alt="S" class="svelte-i2fmny"/> <h1 class="svelte-i2fmny">SVADER</h1></div></main>`);

export default function _page($$anchor) {
	var main = root_1();

	$.head('i2fmny', ($$anchor) => {
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
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" }
		]
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var img = $.child(div_1);

	$.next(2);
	$.reset(div_1);
	$.reset(main);
	$.template_effect(() => $.set_attribute(img, 'src', logo));
	$.append($$anchor, main);
}