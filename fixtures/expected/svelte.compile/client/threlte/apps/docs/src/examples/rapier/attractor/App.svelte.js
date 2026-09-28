import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { World, Debug } from '@threlte/rapier';
import BasicScene from './BasicScene.svelte';
import AdvancedScene from './AdvancedScene.svelte';
import { Pane, Slider, TabGroup, TabPage, Checkbox, Button } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="svelte-1gzrqsy">It seems your browser<br/> doesn't support WASM.<br/> I'm sorry.</p>`);
var root_3 = $.from_html(`<!> <div class="svelte-1gzrqsy"><!></div>`, 1);

export default function App($$anchor) {
	const gravityTypes = ['static', 'linear', 'newtonian'];
	let scene = $.state(void 0);
	let showHelper = $.state(false);
	let gravityType = $.state($.proxy(gravityTypes[0]));
	let strengthLeft = $.state(1);
	let strengthCenter = $.state(1);
	let strengthRight = $.state(1);
	let tabIndex = $.state(0);
	var fragment = root_3();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Attractor',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'Reset',
				$$events: { click: () => $.get(scene)?.reset() }
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'Debug',
				get value() {
					return $.get(showHelper);
				},

				set value($$value) {
					$.set(showHelper, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			TabGroup(node_3, {
				get selectedIndex() {
					return $.get(tabIndex);
				},

				set selectedIndex($$value) {
					$.set(tabIndex, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					TabPage(node_4, {
						title: 'Basic',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							Slider(node_5, {
								label: 'Strength left',
								min: -5,
								max: 5,
								get value() {
									return $.get(strengthLeft);
								},

								set value($$value) {
									$.set(strengthLeft, $$value, true);
								}
							});

							var node_6 = $.sibling(node_5, 2);

							Slider(node_6, {
								label: 'Strength center',
								min: -5,
								max: 5,
								get value() {
									return $.get(strengthCenter);
								},

								set value($$value) {
									$.set(strengthCenter, $$value, true);
								}
							});

							var node_7 = $.sibling(node_6, 2);

							Slider(node_7, {
								label: 'Strength right',
								min: -5,
								max: 5,
								get value() {
									return $.get(strengthRight);
								},

								set value($$value) {
									$.set(strengthRight, $$value, true);
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_4, 2);

					TabPage(node_8, {
						title: 'Advanced',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_9 = $.first_child(fragment_4);

							Button(node_9, {
								label: 'Set Gravity Type',
								title: 'static',
								$$events: {
									click: () => {
										$.set(gravityType, gravityTypes[0], true);
									}
								}
							});

							var node_10 = $.sibling(node_9, 2);

							Button(node_10, {
								label: '',
								title: 'linear',
								$$events: {
									click: () => {
										$.set(gravityType, gravityTypes[1], true);
									}
								}
							});

							var node_11 = $.sibling(node_10, 2);

							Button(node_11, {
								label: '',
								title: 'newtonian',
								$$events: {
									click: () => {
										$.set(gravityType, gravityTypes[2], true);
									}
								}
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_12 = $.child(div);

	Canvas(node_12, {
		children: ($$anchor, $$slotProps) => {
			{
				const fallback = ($$anchor) => {
					HTML($$anchor, {
						transform: true,
						children: ($$anchor, $$slotProps) => {
							var p = root_2();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => [0, $.get(tabIndex) == 1 ? 0 : -3, 0]);

				World($$anchor, {
					get gravity() {
						return $.get($0);
					},
					fallback,
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_13 = $.first_child(fragment_7);

						{
							var consequent = ($$anchor) => {
								Debug($$anchor, {});
							};

							$.if(node_13, ($$render) => {
								if ($.get(showHelper)) $$render(consequent);
							});
						}

						var node_14 = $.sibling(node_13, 2);

						{
							var consequent_1 = ($$anchor) => {
								$.bind_this(
									AdvancedScene($$anchor, {
										get type() {
											return $.get(gravityType);
										}
									}),
									($$value) => $.set(scene, $$value, true),
									() => $.get(scene)
								);
							};

							var alternate = ($$anchor) => {
								$.bind_this(
									BasicScene($$anchor, {
										get strengthLeft() {
											return $.get(strengthLeft);
										},

										get strengthCenter() {
											return $.get(strengthCenter);
										},

										get strengthRight() {
											return $.get(strengthRight);
										}
									}),
									($$value) => $.set(scene, $$value, true),
									() => $.get(scene)
								);
							};

							$.if(node_14, ($$render) => {
								if ($.get(tabIndex) == 1) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_7);
					},
					$$slots: { fallback: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}