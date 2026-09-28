import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Align, Environment, Float, OrbitControls, Text3DGeometry } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let align = () => ($$arg0?.()).align;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Text3DGeometry(node_2, $.spread_props({ font: '/fonts/Inter-semibold.blob' }, () => rest, {
							oncreate: () => {
								align()();
							}
						}));

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, {
								color: '#FD3F00',
								toneMapped: false,
								metalness: 1.0,
								roughness: 0.1
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		Align(node, { children, $$slots: { default: true } });
	}

	var node_4 = $.sibling(node, 2);

	Environment(node_4, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_5 = $.sibling(node_4, 2);

	Float(node_5, {
		rotationIntensity: [0, 3, 0],
		rotationSpeed: 1,
		floatingRange: [-5, 5],
		speed: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.component(node_6, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.y': 0,
					'position.z': 20,
					fov: 90,
					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, { enableDamping: true, enablePan: false, enableZoom: false });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}