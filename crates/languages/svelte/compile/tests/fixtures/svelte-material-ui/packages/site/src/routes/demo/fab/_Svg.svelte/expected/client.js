import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiPlus } from '@mdi/js';
import Fab, { Icon } from '@smui/fab';

var root = $.from_svg(`<path fill="currentColor" class="svelte-1ut572z"></path>`);
var root_1 = $.from_html(`<div class="flexy svelte-1ut572z"><div class="margins svelte-1ut572z"><!></div></div> <pre class="status svelte-1ut572z"> </pre>`, 1);

export default function _Svg($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		onclick: () => $.update(clicked),
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '2 2 20 20',
				children: ($$anchor, $$slotProps) => {
					var path = root();

					$.template_effect(() => $.set_attribute(path, 'd', mdiPlus));
					$.append($$anchor, path);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}