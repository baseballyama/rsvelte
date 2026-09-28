import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Pane, TabGroup, TabPage } from '$lib';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p> <p> </p> <!>`, 1);

export default function TestTabIndexBindingAlt($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let draggable = true;

	let tabIndex;

	function toggleDraggable() {
		draggable = !draggable;
	}

	var fragment = root_1();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var node = $.sibling(p_1, 2);

	{
		let $0 = $.derived(() => draggable ? 'draggable' : 'fixed');

		Pane(node, {
			get position() {
				return $.get($0);
			},
			title: 'Controls',
			children: ($$anchor, $$slotProps) => {
				TabGroup($$anchor, {
					get selectedIndex() {
						return tabIndex;
					},

					set selectedIndex($$value) {
						tabIndex = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						TabPage(node_1, {
							title: 'A',
							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									title: 'Toggle Draggable',
									$$events: { click: toggleDraggable }
								});
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						TabPage(node_2, {
							title: 'B',
							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									title: 'Toggle Draggable',
									$$events: { click: toggleDraggable }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(() => {
		$.set_text(text, `Draggable: ${draggable ?? ''}`);
		$.set_text(text_1, `TabIndex: ${tabIndex ?? ''}`);
	});

	$.append($$anchor, fragment);
}