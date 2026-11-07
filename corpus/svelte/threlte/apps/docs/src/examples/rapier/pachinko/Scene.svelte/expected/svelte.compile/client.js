import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Bounds, SoftShadows } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import Balls from './Balls.svelte';
import Cabinet from './Cabinet.svelte';
import ControlPanelHUD from './ControlPanelHUD.svelte';
import Frame from './Frame.svelte';
import Launcher from './Launcher.svelte';
import Pegs from './Pegs.svelte';
import Pockets from './Pockets.svelte';
import Windmills from './Windmills.svelte';
import { CABINET_WIDTH, CROWN_Y, FIELD_HEIGHT } from './gameState.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	SoftShadows(node, {});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => CROWN_Y + 1);
		let $1 = $.derived(() => -FIELD_HEIGHT);
		let $2 = $.derived(() => -CABINET_WIDTH);

		$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
			T_DirectionalLight($$anchor, {
				position: [4, 8, 6],
				intensity: 2,
				castShadow: true,
				'shadow.mapSize.width': 1024,
				'shadow.mapSize.height': 1024,
				get 'shadow.camera.top'() {
					return $.get($0);
				},

				get 'shadow.camera.bottom'() {
					return $.get($1);
				},

				get 'shadow.camera.left'() {
					return $.get($2);
				},

				get 'shadow.camera.right'() {
					return CABINET_WIDTH;
				}
			});
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.PointLight, ($$anchor, T_PointLight) => {
		T_PointLight($$anchor, {
			position: [0, 0, 4],
			intensity: 20,
			color: '#ff4488',
			distance: 12
		});
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, fov: 40, position: [3, 0, 18] });
	});

	var node_5 = $.sibling(node_4, 2);

	Bounds(node_5, {
		animate: false,
		margin: 0.1,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_6 = $.first_child(fragment_1);

			Cabinet(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			Frame(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			Pegs(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			Windmills(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			Pockets(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			Launcher(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ControlPanelHUD(node_12, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_5, 2);

	Balls(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		$.if(node_14, ($$render) => {
			if ($$props.debug) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}