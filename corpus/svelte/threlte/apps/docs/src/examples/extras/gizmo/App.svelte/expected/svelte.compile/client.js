import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import { Gizmo, OrbitControls } from '@threlte/extras';
import { Folder, List, Pane, Slider, ThemeUtils } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="svelte-1ucsjry"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let type = $.state('sphere');
	let speed = $.state(1);
	let placement = $.state('bottom-left');
	let size = $.state(86);
	let left = $.state(10);
	let top = $.state(10);
	let right = $.state(10);
	let bottom = $.state(10);
	let center = $.state($.proxy([0, 0, 0]));
	var fragment = root_3();
	var node = $.first_child(fragment);

	Pane(node, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'Gizmo',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				label: 'type',
				options: { sphere: 'sphere', cube: 'cube' },
				get value() {
					return $.get(type);
				},

				set value($$value) {
					$.set(type, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'speed',
				min: 0.1,
				max: 1,
				get value() {
					return $.get(speed);
				},

				set value($$value) {
					$.set(speed, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			List(node_3, {
				label: 'placement',
				options: [
					'top-left',
					'top-center',
					'top-right',
					'center-left',
					'center-center',
					'center-right',
					'bottom-left',
					'bottom-center',
					'bottom-right'
				],

				get value() {
					return $.get(placement);
				},

				set value($$value) {
					$.set(placement, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'size',
				min: 20,
				max: 350,
				step: 1,
				get value() {
					return $.get(size);
				},

				set value($$value) {
					$.set(size, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Folder(node_5, {
				title: 'offset',
				expanded: false,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					Slider(node_6, {
						label: 'top',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(top);
						},

						set value($$value) {
							$.set(top, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Slider(node_7, {
						label: 'left',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(left);
						},

						set value($$value) {
							$.set(left, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Slider(node_8, {
						label: 'right',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(right);
						},

						set value($$value) {
							$.set(right, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Slider(node_9, {
						label: 'bottom',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(bottom);
						},

						set value($$value) {
							$.set(bottom, $$value, true);
						}
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
	var node_10 = $.child(div);

	Canvas(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_11 = $.first_child(fragment_3);

			$.component(node_11, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [20, 20, 20],
					fov: 36,
					target: [0, 0, 0],
					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, {
							onchange: (event) => {
								$.set(center, event.target.target.toArray(), true);
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => ({
										top: $.get(top),
										left: $.get(left),
										bottom: $.get(bottom),
										right: $.get(right)
									}));

									Gizmo($$anchor, {
										get type() {
											return $.get(type);
										},

										get speed() {
											return $.get(speed);
										},

										get placement() {
											return $.get(placement);
										},

										get size() {
											return $.get(size);
										},

										get offset() {
											return $.get($0);
										}
									});
								}
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_11, 2);

			Scene(node_12, {
				get center() {
					return $.get(center);
				}
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}