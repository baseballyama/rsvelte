import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Pane, TabGroup, TabPage } from '$lib';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>No pane</p>`);
var root_2 = $.from_html(`<p> </p> <p> </p> <!>`, 1);

export default function TestTabIndexBinding($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let mode = 0;

	let tabIndex = 1;

	function cycleMode() {
		mode = (mode + 1) % 3;
	}

	var fragment = root_2();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var node = $.sibling(p_1, 2);

	{
		var consequent = ($$anchor) => {
			Pane($$anchor, {
				position: 'draggable',
				storePositionLocally: false,
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
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							TabPage(node_1, {
								title: 'A',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							TabPage(node_2, {
								title: 'B',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var consequent_1 = ($$anchor) => {
			Pane($$anchor, {
				position: 'inline',
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
							var fragment_8 = root();
							var node_3 = $.first_child(fragment_8);

							TabPage(node_3, {
								title: 'A',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							TabPage(node_4, {
								title: 'B',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if (mode === 0) $$render(consequent); else if (mode === 1) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => {
		$.set_text(text, `Mode: ${mode ?? ''}`);
		$.set_text(text_1, `TabIndex: ${tabIndex ?? ''}`);
	});

	$.append($$anchor, fragment);
}