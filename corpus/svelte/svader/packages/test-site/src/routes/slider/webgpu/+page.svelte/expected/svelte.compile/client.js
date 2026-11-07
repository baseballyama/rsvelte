import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

var root = $.from_html(`<main class="svelte-1jcq176"><h1 class="svelte-1jcq176">SLIDE ME</h1> <span class="svelte-1jcq176"><div class="canvas-container svelte-1jcq176"><!></div> <input type="range" min="0" max="1" step="0.01" class="svelte-1jcq176"/></span></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let val = $.state(0.75);
	var main = root();
	var span = $.sibling($.child(main), 2);
	var div = $.child(span);
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			{ label: "Resolution", binding: 0, value: "resolution" },
			{ label: "Offset", binding: 1, value: "offset" },
			{ label: "Scale", binding: 2, value: "scale" },
			{
				label: "Value",
				binding: 3,
				value: new Float32Array([$.get(val)])
			}
		]);

		WebGpuShader(node, {
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
	$.pop();
}