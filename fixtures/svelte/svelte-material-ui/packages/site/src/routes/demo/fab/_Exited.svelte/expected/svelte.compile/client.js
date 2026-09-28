import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Icon } from '@smui/fab';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div></div> <div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _Exited($$anchor) {
	let clicked = $.state(0);
	let exited = $.state(false);
	let exitedPrimary = $.state(false);
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		onclick: () => $.update(clicked),
		get exited() {
			return $.get(exited);
		},

		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('favorite');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Exited');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(exited);
					},

					set checked($$value) {
						$.set(exited, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_2);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var div_4 = $.child(div_3);
	var node_2 = $.child(div_4);

	Fab(node_2, {
		color: 'primary',
		onclick: () => $.update(clicked),
		get exited() {
			return $.get(exitedPrimary);
		},

		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('favorite');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_3 = $.child(div_5);

	{
		const label = ($$anchor) => {
			$.next();

			var text_3 = $.text('Exited');

			$.append($$anchor, text_3);
		};

		FormField(node_3, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(exitedPrimary);
					},

					set checked($$value) {
						$.set(exitedPrimary, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_5);
	$.reset(div_3);

	var pre = $.sibling(div_3, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}