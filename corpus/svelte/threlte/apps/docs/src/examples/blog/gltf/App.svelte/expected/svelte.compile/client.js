import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, ThemeUtils, Separator } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-zc9cpk"><!></div> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let settings = $.proxy({
		wireframe: false,
		background: false,
		border: true,
		enemy: false,
		player: false,
		potion: false,
		turtle: true,
		heart: true,
		runeState: false,
		runeHost: false,
		runeEffect: false
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get settings() {
					return settings;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Pane(node_1, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'GLTF file',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			Checkbox(node_2, {
				label: 'wireframe',
				get value() {
					return settings.wireframe;
				},

				set value($$value) {
					settings.wireframe = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Separator(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				label: 'border',
				get value() {
					return settings.border;
				},

				set value($$value) {
					settings.border = $$value;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Checkbox(node_5, {
				label: 'heart',
				get value() {
					return settings.heart;
				},

				set value($$value) {
					settings.heart = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Checkbox(node_6, {
				label: 'turtle',
				get value() {
					return settings.turtle;
				},

				set value($$value) {
					settings.turtle = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Checkbox(node_7, {
				label: 'player',
				get value() {
					return settings.player;
				},

				set value($$value) {
					settings.player = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Checkbox(node_8, {
				label: 'enemy',
				get value() {
					return settings.enemy;
				},

				set value($$value) {
					settings.enemy = $$value;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Checkbox(node_9, {
				label: 'potion',
				get value() {
					return settings.potion;
				},

				set value($$value) {
					settings.potion = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Checkbox(node_10, {
				label: 'host rune',
				get value() {
					return settings.runeHost;
				},

				set value($$value) {
					settings.runeHost = $$value;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Checkbox(node_11, {
				label: 'effect rune',
				get value() {
					return settings.runeEffect;
				},

				set value($$value) {
					settings.runeEffect = $$value;
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}