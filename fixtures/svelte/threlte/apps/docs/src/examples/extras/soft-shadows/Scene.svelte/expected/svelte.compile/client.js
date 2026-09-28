import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, OrbitControls, SoftShadows } from '@threlte/extras';
import Suzanne from './Suzanne.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 8, 15],
			fov: 36,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableZoom: false, enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Suzanne(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [5, 8, 4],
			castShadow: true,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.bias': 0.0001
		});
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			SoftShadows($$anchor, {
				get size() {
					return $$props.size;
				},

				get focus() {
					return $$props.focus;
				},

				get samples() {
					return $$props.samples;
				}
			});
		};

		$.if(node_3, ($$render) => {
			if ($$props.enabled) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	Environment(node_4, {
		url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr'
	});

	$.append($$anchor, fragment);
}