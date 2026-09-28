import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=SUSE:wght@800&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<main class="svelte-1wbdv87"><div class="canvas-container svelte-1wbdv87"><!></div> <h1 class="svelte-1wbdv87">SVADER</h1></main>`);

export default function _page($$anchor) {
	const color = /** @type {const} */ ([0.8, 0.3, 0.0]);

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 */
	function rgbString(r, g, b) {
		return `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
	}

	var main = root_1();

	$.head('1wbdv87', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	var div = $.child(main);
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" },
			{ name: "u_time", value: "time" },
			{ name: "u_color", type: "vec3", value: color }
		]);

		WebGlShader(node, {
			get code() {
				return shaderCode;
			},

			get parameters() {
				return $.get($0);
			}
		});
	}

	$.reset(div);

	var h1 = $.sibling(div, 2);
	let styles;

	$.reset(main);
	$.template_effect(($0) => styles = $.set_style(h1, '', styles, { '--color': $0 }), [() => rgbString(...color)]);
	$.append($$anchor, main);
}