import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGlShader } from "svader";
import shaderCode from "./shader.frag?raw";

var root = $.from_html(`<main class="svelte-1sp0hbd"><h1 class="svelte-1sp0hbd">SLIDE ME</h1> <span class="svelte-1sp0hbd"><div class="canvas-container svelte-1sp0hbd"><!></div> <input type="range" min="0" max="1" step="0.01" class="svelte-1sp0hbd"/></span></main>`);

export default function _page($$anchor) {
	let val = $.state(0.75);
	var main = root();
	var span = $.sibling($.child(main), 2);
	var div = $.child(span);
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			{ name: "u_resolution", value: "resolution" },
			{ name: "u_offset", value: "offset" },
			{ name: "u_scale", value: "scale" },
			{ name: "u_value", type: "float", value: $.get(val) }
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

	var input = $.sibling(div, 2);

	$.remove_input_defaults(input);
	$.reset(span);
	$.reset(main);
	$.bind_value(input, () => $.get(val), ($$value) => $.set(val, $$value));
	$.append($$anchor, main);
}