import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, Float, HTML, useGltf, OrbitControls } from '@threlte/extras';
import { MathUtils } from 'three';
import Geometries from './Geometries.svelte';
import { RoundedPlaneGeometry } from './RoundedPlaneGeometry';

var root = $.from_html(`<div class="phone-wrapper svelte-t1fkn5" style="border-radius:1rem"><iframe title="" width="100%" height="100%" frameborder="0"></iframe></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gltf = useGltf('/models/phone/phone.glb');
	const phoneGeometry = $.derived(() => $gltf()?.nodes.phone.geometry);
	const url = window.origin;
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [50, -30, 30],
			fov: 20,
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			},
			makeDefault: true,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.3 });
	});

	var node_2 = $.sibling(node_1, 2);

	Environment(node_2, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_3 = $.sibling(node_2, 2);

	Float(node_3, {
		scale: 0.7,
		floatIntensity: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);
				let $1 = $.derived(() => new RoundedPlaneGeometry(10.5, 21.3, 1.6));

				HTML(node_4, {
					get 'rotation.y'() {
						return $.get($0);
					},
					'position.x': 1.2,
					transform: true,
					occlude: 'blending',
					get geometry() {
						return $.get($1);
					},

					children: ($$anchor, $$slotProps) => {
						var div = root();
						var iframe = $.only_child(div);

						$.template_effect(() => $.set_attribute(iframe, 'src', url));
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							scale: 5.65,
							get geometry() {
								return $.get(phoneGeometry);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: '#FF3F00', metalness: 0.9, roughness: 0.1 });
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_5, ($$render) => {
					if ($.get(phoneGeometry)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_3, 2);

	Geometries(node_8, {});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}