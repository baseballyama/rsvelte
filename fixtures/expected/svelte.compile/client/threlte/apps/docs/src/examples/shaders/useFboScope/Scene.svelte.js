import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Sky } from '@threlte/extras';
import Ducks from './world/Ducks.svelte';
import Island from './world/Island.svelte';
import Water from './world/Water.svelte';
import Controls, { baseFov } from './Controls.svelte';
import LensView from './scope/LensView.svelte';
import Scope from './scope/Scope.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 1.5, 20],
			get fov() {
				return baseFov;
			},

			children: ($$anchor, $$slotProps) => {
				{
					const children = ($$anchor, $$arg0) => {
						let ref = () => ($$arg0?.()).ref;

						LensView($$anchor, {
							get scope() {
								return ref();
							}
						});
					};

					Scope($$anchor, { children, $$slots: { default: true } });
				}
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Controls(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Sky(node_2, { elevation: 0.5, azimuth: 130 });

	var node_3 = $.sibling(node_2, 2);

	Water(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Island(node_4, {
		scale: 0.2,
		'position.x': -5,
		'position.y': -0.01,
		'position.z': 0
	});

	var node_5 = $.sibling(node_4, 2);

	Ducks(node_5, {});
	$.append($$anchor, fragment);
}