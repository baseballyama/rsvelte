import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import { NoToneMapping } from 'three';
import { OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative h-screen w-screen"><!></div>`);

export default function App($$anchor) {
	let innerWidth = 0;
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			{
				let $0 = $.derived(() => innerWidth / 500);

				$.component(node_1, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
					T_OrthographicCamera($$anchor, {
						makeDefault: true,
						'position.z': 1000,
						get zoom() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							OrbitControls($$anchor, {});
						},
						$$slots: { default: true }
					});
				});
			}

			var node_2 = $.sibling(node_1, 2);

			Scene(node_2, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_window_size('innerWidth', ($$value) => innerWidth = $$value);
	$.append($$anchor, div);
}