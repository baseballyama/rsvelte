import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import Robot from './Robot.svelte';
import { Grid } from '@threlte/extras';
import { Vector3 } from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 4, 15],
			fov: 50,
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => new Vector3(0, 0, 0));

		Grid(node_1, {
			cellColor: 'yellow',
			sectionColor: 'orange',
			infiniteGrid: true,
			fadeDistance: 10,
			get fadeOrigin() {
				return $.get($0);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 5, 5], intensity: 1.5 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.5 });
	});

	var node_4 = $.sibling(node_3, 2);

	Robot(node_4, {
		action: 'Walking',
		position: [-4, 0, 0],
		oncreate: (ref) => {
			ref.lookAt(0, 0, 0);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Robot(node_5, { action: 'Running', position: [0, 0, 0] });

	var node_6 = $.sibling(node_5, 2);

	Robot(node_6, {
		action: 'Dance',
		position: [4, 0, 0],
		oncreate: (ref) => {
			ref.lookAt(0, 0, 0);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}