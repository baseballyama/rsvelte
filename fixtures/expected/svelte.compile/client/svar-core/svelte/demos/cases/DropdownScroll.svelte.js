import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, DatePicker } from "../../src/index";

var root = $.from_html(`<div class="container svelte-1ozhjsx" style="height: 150px;overflow: auto;"><div style="width:100%;height:700px;"><!></div></div>`);

var root_1 = $.from_html(`<div class="demo-box"><h3>DatePicker in a scrollable container.</h3> <p>Click to show and scroll the container. <b>trackScroll</b> closes dropdown
		on scroll</p> <p><!></p> <p><b>inline</b> dropdown mode</p> <p><!></p></div>`);

export default function DropdownScroll($$anchor) {
	var div = root_1();
	var p = $.sibling($.child(div), 4);
	var node = $.child(p);

	Field(node, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			DatePicker(node_1, { dropdown: { trackScroll: true } });
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var p_1 = $.sibling(p, 4);
	var node_2 = $.child(p_1);

	Field(node_2, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root();
			var div_4 = $.child(div_3);
			var node_3 = $.child(div_4);

			DatePicker(node_3, { dropdown: { inline: true } });
			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.reset(p_1);
	$.reset(div);
	$.append($$anchor, div);
}