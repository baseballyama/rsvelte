import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1eanhih"><!></div>`, 1);

export default function App($$anchor) {
	let shadowOpacity = $.state(0.5);
	let meshOpacity = $.state(0.5);
	let overrideOpacity = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'ShadowAlpha',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'material opacity',
				min: 0,
				max: 1,
				step: 0.01,
				get value() {
					return $.get(meshOpacity);
				},

				set value($$value) {
					$.set(meshOpacity, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'override shadow opacity',
				get value() {
					return $.get(overrideOpacity);
				},

				set value($$value) {
					$.set(overrideOpacity, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => !$.get(overrideOpacity));

				Slider(node_3, {
					label: 'shadow opacity',
					min: 0,
					max: 1,
					step: 0.01,
					get disabled() {
						return $.get($0);
					},

					get value() {
						return $.get(shadowOpacity);
					},

					set value($$value) {
						$.set(shadowOpacity, $$value, true);
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => $.get(overrideOpacity) ? $.get(shadowOpacity) : undefined);

				Scene($$anchor, {
					get meshOpacity() {
						return $.get(meshOpacity);
					},

					get shadowOpacity() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}