import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Sky } from '../lib/index.js';
import Gamepad from './Gamepad.svelte';
import MountedGamepad from './MountedGamepad.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	let listenToGamepad = true;
	let mountGamepad = false;
	var fragment = root_1();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'g') {
			listenToGamepad = !listenToGamepad;
		}

		if (e.key === 'm') {
			mountGamepad = !mountGamepad;
		}
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Gamepad($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (browser && mountGamepad) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			MountedGamepad($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if (listenToGamepad) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 3, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node_2, 2);

	Sky(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Grid(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_6 = $.first_child(fragment_4);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { transparent: true, color: 'white' });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}