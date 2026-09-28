import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Point, List, Checkbox, Folder } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-2lw10l"><!></div> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const defaults = {
		frequency: 1,
		axis: [0, 1, 0],
		forceDirectionEnabled: false,
		forceDirection: [1, 0, 0],
		timeEnabled: false,
		time: 0
	};

	const presets = {
		plant: {
			...defaults,
			speed: 2.5,
			factor: 0.3,
			noise: 0.4,
			pulse: 0.4,
			drift: 0.4,
			bendiness: 0.4,
			anchorEnabled: true,
			anchor: 0.76
		},
		orb: {
			...defaults,
			speed: 2.5,
			factor: 3,
			noise: 0.1,
			pulse: 0.1,
			drift: 0.1,
			bendiness: 0.5,
			anchorEnabled: false,
			anchor: 0
		},
		flowers: {
			...defaults,
			speed: 5,
			factor: 3,
			noise: 0.75,
			pulse: 0.75,
			drift: 0.75,
			bendiness: 1,
			anchorEnabled: true,
			anchor: 0
		}
	};

	let subject = $.state('plant');
	let options = $.state($.proxy(presets.plant));

	$.user_effect(() => {
		$.set(options, presets[$.get(subject)], true);
	});

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => $.get(options).anchorEnabled ? $.get(options).anchor : undefined);
				let $1 = $.derived(() => $.get(options).forceDirectionEnabled ? $.get(options).forceDirection : undefined);
				let $2 = $.derived(() => $.get(options).timeEnabled ? $.get(options).time : undefined);

				Scene($$anchor, $.spread_props(
					{
						get subject() {
							return $.get(subject);
						}
					},
					() => $.get(options),
					{
						get anchor() {
							return $.get($0);
						},

						get forceDirection() {
							return $.get($1);
						},

						get time() {
							return $.get($2);
						}
					}
				));
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Pane(node_1, {
		title: 'Wobble',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_2 = $.first_child(fragment_2);

			List(node_2, {
				label: 'subject',
				options: { Plant: 'plant', Orb: 'orb', Flowers: 'flowers' },
				get value() {
					return $.get(subject);
				},

				set value($$value) {
					$.set(subject, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'speed',
				min: 0,
				max: 5,
				step: 0.01,
				get value() {
					return $.get(options).speed;
				},

				set value($$value) {
					$.get(options).speed = $$value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'factor',
				min: 0,
				max: 3,
				step: 0.01,
				get value() {
					return $.get(options).factor;
				},

				set value($$value) {
					$.get(options).factor = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'frequency',
				min: 0.1,
				max: 5,
				step: 0.01,
				get value() {
					return $.get(options).frequency;
				},

				set value($$value) {
					$.get(options).frequency = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'noise',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(options).noise;
				},

				set value($$value) {
					$.get(options).noise = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'pulse',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(options).pulse;
				},

				set value($$value) {
					$.get(options).pulse = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Slider(node_8, {
				label: 'drift',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(options).drift;
				},

				set value($$value) {
					$.get(options).drift = $$value;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Slider(node_9, {
				label: 'bendiness',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(options).bendiness;
				},

				set value($$value) {
					$.get(options).bendiness = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Point(node_10, {
				label: 'axis',
				min: -1,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(options).axis;
				},

				set value($$value) {
					$.get(options).axis = $$value;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Folder(node_11, {
				title: 'anchor',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_12 = $.first_child(fragment_3);

					Checkbox(node_12, {
						label: 'enabled',
						get value() {
							return $.get(options).anchorEnabled;
						},

						set value($$value) {
							$.get(options).anchorEnabled = $$value;
						}
					});

					var node_13 = $.sibling(node_12, 2);

					{
						let $0 = $.derived(() => !$.get(options).anchorEnabled);

						Slider(node_13, {
							label: 'along axis',
							min: -2,
							max: 4,
							step: 0.01,
							get disabled() {
								return $.get($0);
							},

							get value() {
								return $.get(options).anchor;
							},

							set value($$value) {
								$.get(options).anchor = $$value;
							}
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_11, 2);

			Folder(node_14, {
				title: 'forceDirection',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_15 = $.first_child(fragment_4);

					Checkbox(node_15, {
						label: 'enabled',
						get value() {
							return $.get(options).forceDirectionEnabled;
						},

						set value($$value) {
							$.get(options).forceDirectionEnabled = $$value;
						}
					});

					var node_16 = $.sibling(node_15, 2);

					{
						let $0 = $.derived(() => !$.get(options).forceDirectionEnabled);

						Point(node_16, {
							label: 'xyz',
							min: -1,
							max: 1,
							step: 0.01,
							get disabled() {
								return $.get($0);
							},

							get value() {
								return $.get(options).forceDirection;
							},

							set value($$value) {
								$.get(options).forceDirection = $$value;
							}
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_14, 2);

			Folder(node_17, {
				title: 'time',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_18 = $.first_child(fragment_5);

					Checkbox(node_18, {
						label: 'external',
						get value() {
							return $.get(options).timeEnabled;
						},

						set value($$value) {
							$.get(options).timeEnabled = $$value;
						}
					});

					var node_19 = $.sibling(node_18, 2);

					{
						let $0 = $.derived(() => !$.get(options).timeEnabled);

						Slider(node_19, {
							label: 'seconds',
							min: 0,
							max: 30,
							step: 0.01,
							get disabled() {
								return $.get($0);
							},

							get value() {
								return $.get(options).time;
							},

							set value($$value) {
								$.get(options).time = $$value;
							}
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}