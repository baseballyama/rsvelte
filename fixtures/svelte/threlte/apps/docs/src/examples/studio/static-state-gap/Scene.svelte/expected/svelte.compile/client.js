import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { StaticState } from '@threlte/studio';
import { useStaticState } from '@threlte/studio/extensions';
import Box from './Box.svelte';
import Icosahedron from './Icosahedron.svelte';
import Sphere from './Sphere.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const staticStateExtension = useStaticState();

	staticStateExtension.enableEditor();

	class SceneConfig extends StaticState {
		#gap = /**
		 * @min 1.5
		 * @max 5
		 */
		$.state(2);

		get gap() {
			return $.get(this.#gap);
		}

		set gap(value) {
			$.set(this.#gap, value, true);
		}
	}

	const sceneConfig = new SceneConfig();
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [-sceneConfig.gap, 0, 0]);

		Icosahedron(node, {
			get position() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	Box(node_1, { position: [0, 0, 0] });

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => [sceneConfig.gap, 0, 0]);

		Sphere(node_2, {
			get position() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			fov: 33.75,
			position: [0, 2, 10],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 7], intensity: 2.7 });
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.13 });
	});

	$.append($$anchor, fragment);
	$.pop();
}