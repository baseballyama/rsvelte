import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { OrbitControls, View } from '@threlte/extras';
import { Color } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();

	scene.background = new Color('white');

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.HemisphereLight, ($$anchor, T_HemisphereLight) => {
		T_HemisphereLight($$anchor, { args: [0xaaaaaa, 0x444444, 3] });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { args: [0xffffff, 1.5], position: [2, 4, 2] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 18, () => [0xff7eb6, 0x82cfff, 0xa7f0ba], (color) => color, ($$anchor, color, index) => {
		var fragment_1 = $.comment();
		var node_3 = $.first_child(fragment_1);

		{
			let $0 = $.derived(() => ($.get(index) - 1) * 1.2);

			$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					get 'position.x'() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_4 = $.first_child(fragment_2);

						$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, { args: [0.6, 0.6, 0.6] });
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, {
								get color() {
									return color;
								},
								flatShading: true
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	var node_6 = $.sibling(node_2, 2);

	View(node_6, {
		get dom() {
			return $$props.minimap;
		},

		get scene() {
			return scene;
		},

		children: ($$anchor, $$slotProps) => {
			OrbitControls($$anchor, { autoRotate: true });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}