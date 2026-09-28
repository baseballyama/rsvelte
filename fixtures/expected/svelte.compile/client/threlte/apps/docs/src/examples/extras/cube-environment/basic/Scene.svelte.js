import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CubeEnvironment, OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let environmentIsBackground = $.prop($$props, 'environmentIsBackground', 3, true),
		materialMetalness = $.prop($$props, 'materialMetalness', 3, 1),
		materialRoughness = $.prop($$props, 'materialRoughness', 3, 0),
		useEnvironment = $.prop($$props, 'useEnvironment', 3, true);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => T.TorusGeometry, ($$anchor, T_TorusGeometry) => {
					T_TorusGeometry($$anchor, { args: [1, 0.4, 36, 192] });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get metalness() {
							return materialMetalness();
						},

						get roughness() {
							return materialRoughness();
						}
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			CubeEnvironment($$anchor, {
				get isBackground() {
					return environmentIsBackground();
				},

				get urls() {
					return $$props.environmentUrls;
				}
			});
		};

		$.if(node_4, ($$render) => {
			if (useEnvironment()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}