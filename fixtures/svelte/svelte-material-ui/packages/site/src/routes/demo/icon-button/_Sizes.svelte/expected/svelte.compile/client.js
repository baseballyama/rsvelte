import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiWrench } from '@mdi/js';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_svg(`<path fill="currentColor"></path>`);
var root_1 = $.from_html(`<div style="display: flex; align-items: center;"><!>&nbsp;(normal = standard icon button size)</div> <div style="display: flex; align-items: center;"><!>&nbsp;(mini = same size as mini FAB)</div> <div style="display: flex; align-items: center;"><!>&nbsp;(button = same height as button)</div> <pre class="status"> </pre>`, 1);

export default function _Sizes($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	IconButton(node, {
		onclick: () => $.update(clicked),
		size: 'normal',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path = root();

					$.template_effect(() => $.set_attribute(path, 'd', mdiWrench));
					$.append($$anchor, path);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	IconButton(node_1, {
		onclick: () => $.update(clicked),
		size: 'mini',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_1 = root();

					$.template_effect(() => $.set_attribute(path_1, 'd', mdiWrench));
					$.append($$anchor, path_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	IconButton(node_2, {
		onclick: () => $.update(clicked),
		size: 'button',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_2 = root();

					$.template_effect(() => $.set_attribute(path_2, 'd', mdiWrench));
					$.append($$anchor, path_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_2);

	var pre = $.sibling(div_2, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}