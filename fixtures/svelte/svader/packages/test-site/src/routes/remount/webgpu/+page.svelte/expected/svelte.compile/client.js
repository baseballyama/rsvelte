import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WebGpuShader } from "svader";
import shaderCode from "./shader.wgsl?raw";

var root = $.from_html(`<div class="fallback">WebGPU not supported in this environment.</div>`);
var root_1 = $.from_html(`<label for="show">Show</label> <input id="show" type="checkbox"/> <!>`, 1);

export default function _page($$anchor) {
	let show = $.state(true);
	var fragment = root_1();
	var input = $.sibling($.first_child(fragment), 2);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
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
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.bind_checked(input, () => $.get(show), ($$value) => $.set(show, $$value));
	$.append($$anchor, fragment);
}