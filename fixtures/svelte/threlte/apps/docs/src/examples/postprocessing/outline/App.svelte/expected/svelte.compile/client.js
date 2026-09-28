import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CustomRenderer from './CustomRenderer.svelte';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { Mesh, Shape } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const mesh = new Mesh();
	let paused = $.state(false);

	const walls = [
		{
			height: 3,
			shape: new Shape().moveTo(3.5, -4.5).lineTo(3.5, -3.5).lineTo(5.5, -3.5).lineTo(5.5, -0.5).lineTo(-2.5, -0.5).lineTo(-2.5, 0.5).lineTo(5.5, 0.5).lineTo(5.5, 3.5).lineTo(-0.5, 3.5).lineTo(-0.5, 4.5).lineTo(6.5, 4.5).lineTo(6.5, -4.5)
		},

		{
			height: 3,
			shape: new Shape().moveTo(-6.5, -4.5).lineTo(-6.5, 4.5).lineTo(-3.5, 4.5).lineTo(-3.5, 3.5).lineTo(-5.5, 3.5).lineTo(-5.5, -3.5).lineTo(0.5, -3.5).lineTo(0.5, -4.5)
		}
	];

	// where is the mesh going?
	const positions = [
		[2, -2, 0],
		[-4, -2, 0],
		[-4, 2, 0],
		[-2, 2, 0],
		[-2, 6, 0],
		[-8, 6, 0],
		[-8, -6, 0],
		[2, -6, 0]
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'outline effect',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'paused',
				get value() {
					return $.get(paused);
				},

				set value($$value) {
					$.set(paused, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => !$.get(paused));

				Scene(node_2, {
					get play() {
						return $.get($0);
					},

					get mesh() {
						return mesh;
					},

					get walls() {
						return walls;
					},

					get positions() {
						return positions;
					}
				});
			}

			var node_3 = $.sibling(node_2, 2);

			CustomRenderer(node_3, {
				get mesh() {
					return mesh;
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}