import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { AsciiRenderer } from '@threlte/extras';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-1obhc4a"><!></div>`, 1);

export default function App($$anchor) {
	let color = $.state(false);
	const options = $.derived(() => ({ color: $.get(color) }));
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'render on update',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'color',
				get value() {
					return $.get(color);
				},

				set value($$value) {
					$.set(color, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let asciiEffect = () => ($$arg0?.()).asciiEffect;

					Scene($$anchor, {
						get asciiEffect() {
							return asciiEffect();
						}
					});
				};

				AsciiRenderer($$anchor, {
					autoRender: false,
					get options() {
						return $.get(options);
					},
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}