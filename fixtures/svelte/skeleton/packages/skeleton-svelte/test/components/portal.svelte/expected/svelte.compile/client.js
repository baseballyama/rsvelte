import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal } from '../../src/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div data-testid="child"></div>`);
var root_1 = $.from_html(`<div data-testid="parent"><!></div>`);

export default function Portal_1($$anchor, $$props) {
	const props = $.rest_props($$props, rest_excludes);
	var div = root_1();
	var node = $.child(div);

	Portal(node, $.spread_props(() => props, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	}));

	$.reset(div);
	$.append($$anchor, div);
}