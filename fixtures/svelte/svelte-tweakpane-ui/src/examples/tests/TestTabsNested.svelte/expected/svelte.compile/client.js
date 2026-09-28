import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Pane, TabGroup, TabPage } from '$lib';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>No pane</p>`);
var root_2 = $.from_html(`<p> </p> <p> </p> <p> </p> <!>`, 1);

export default function TestTabsNested($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let mode = 0;

	let tabIndexA = 0;
	let tabIndexB = 1;

	function cycleMode() {
		mode = (mode + 1) % 3;
	}

	var fragment = root_2();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);
	var node = $.sibling(p_2, 2);

	{
		var consequent = ($$anchor) => {
			Pane($$anchor, {
				position: 'draggable',
				storePositionLocally: false,
				title: 'Controls',
				children: ($$anchor, $$slotProps) => {
					TabGroup($$anchor, {
						get selectedIndex() {
							return tabIndexA;
						},

						set selectedIndex($$value) {
							tabIndexA = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							TabPage(node_1, {
								title: 'A',
								children: ($$anchor, $$slotProps) => {
									TabGroup($$anchor, {
										get selectedIndex() {
											return tabIndexB;
										},

										set selectedIndex($$value) {
											tabIndexB = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_2 = $.first_child(fragment_5);

											TabPage(node_2, {
												title: 'A',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
												},
												$$slots: { default: true }
											});

											var node_3 = $.sibling(node_2, 2);

											TabPage(node_3, {
												title: 'B',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_1, 2);

							TabPage(node_4, {
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
							return tabIndexA;
						},

						set selectedIndex($$value) {
							tabIndexA = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_5 = $.first_child(fragment_11);

							TabPage(node_5, {
								title: 'A',
								children: ($$anchor, $$slotProps) => {
									TabGroup($$anchor, {
										get selectedIndex() {
											return tabIndexB;
										},

										set selectedIndex($$value) {
											tabIndexB = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_13 = root();
											var node_6 = $.first_child(fragment_13);

											TabPage(node_6, {
												title: 'A',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
												},
												$$slots: { default: true }
											});

											var node_7 = $.sibling(node_6, 2);

											TabPage(node_7, {
												title: 'B',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_5, 2);

							TabPage(node_8, {
								title: 'B',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, { title: 'Cycle Mode', $$events: { click: cycleMode } });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var p_3 = root_1();

			$.append($$anchor, p_3);
		};

		$.if(node, ($$render) => {
			if (mode === 0) $$render(consequent); else if (mode === 1) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => {
		$.set_text(text, `Mode: ${mode ?? ''}`);
		$.set_text(text_1, `TabIndexA: ${tabIndexA ?? ''}`);
		$.set_text(text_2, `TabIndexB: ${tabIndexB ?? ''}`);
	});

	$.append($$anchor, fragment);
}