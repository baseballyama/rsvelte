import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { BVHSplitStrategy } from '@threlte/extras';
import { Pane, Checkbox, List, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const options = $.proxy({
		enabled: true,
		strategy: BVHSplitStrategy.SAH,
		indirect: false,
		verbose: false,
		maxDepth: 40,
		maxLeafTris: 20,
		setBoundingBox: true,
		firstHitOnly: false,
		helper: false
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'bvh',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'enabled',
				get value() {
					return options.enabled;
				},

				set value($$value) {
					options.enabled = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'helper',
				get value() {
					return options.helper;
				},

				set value($$value) {
					options.helper = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'firstHitOnly',
				get value() {
					return options.firstHitOnly;
				},

				set value($$value) {
					options.firstHitOnly = $$value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				label: 'setBoundingBox',
				get value() {
					return options.setBoundingBox;
				},

				set value($$value) {
					options.setBoundingBox = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => ({
					SAH: BVHSplitStrategy.SAH,
					CENTER: BVHSplitStrategy.CENTER,
					AVERAGE: BVHSplitStrategy.AVERAGE
				}));

				List(node_5, {
					label: 'strategy',
					get options() {
						return $.get($0);
					},

					get value() {
						return options.strategy;
					},

					set value($$value) {
						options.strategy = $$value;
					}
				});
			}

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'maxDepth',
				step: 1,
				get value() {
					return options.maxDepth;
				},

				set value($$value) {
					options.maxDepth = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'maxLeafTris',
				step: 1,
				get value() {
					return options.maxLeafTris;
				},

				set value($$value) {
					options.maxLeafTris = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	Canvas(node_8, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, $.spread_props(() => options));
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}