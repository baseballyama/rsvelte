import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SceneConfig } from './config.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);

export default function Icosahedron($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const sceneConfig = new SceneConfig();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, $.spread_props(() => props, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
					T_IcosahedronGeometry($$anchor, {});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get color() {
							return sceneConfig.color;
						},
						transparent: true,
						get opacity() {
							return sceneConfig.opacity;
						},
						alphaToCoverage: true
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}