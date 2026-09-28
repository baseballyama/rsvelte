import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Icon } from "../../src/index";
import { icons } from "../data/icons";

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="demo-box"><h3>Icons</h3> <!></div>`);

export default function Icon_1($$anchor, $$props) {
	$.push($$props, true);

	const arrs = [];

	// split icons in block of 10 icons each
	for (let i = 0; i < icons.length; i += 16) {
		arrs.push(icons.slice(i, i + 16));
	}

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	$.each(node, 17, () => arrs, $.index, ($$anchor, subset) => {
		var div_1 = root();

		$.each(div_1, 21, () => $.get(subset), $.index, ($$anchor, icon) => {
			Icon($$anchor, {
				get title() {
					return $.get(icon);
				},

				get css() {
					return $.get(icon);
				}
			});
		});

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}