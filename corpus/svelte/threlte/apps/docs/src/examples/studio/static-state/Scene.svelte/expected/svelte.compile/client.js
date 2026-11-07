import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useStaticState } from '@threlte/studio/extensions';
import Box from './Box.svelte';
import { SceneConfig } from './config.svelte';
import Icosahedron from './Icosahedron.svelte';
import Sphere from './Sphere.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const staticStateExtension = useStaticState();

	staticStateExtension.enableEditor();

	const config = new SceneConfig();
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			fov: 33.75,
			position: [0, 2, 10],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [3, 10, 7],
			get intensity() {
				return config.directionalLightIntensity;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {
			get intensity() {
				return config.ambientLightIntensity;
			}
		});
	});

	var node_3 = $.sibling(node_2, 2);

	Icosahedron(node_3, { position: [-2, 0, 0] });

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent = ($$anchor) => {
			Box($$anchor, { position: [0, 0, 0] });
		};

		$.if(node_4, ($$render) => {
			if (config.showBox) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	Sphere(node_5, { position: [2, 0, 0] });
	$.append($$anchor, fragment);
	$.pop();
}