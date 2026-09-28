import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, Grid, OrbitControls, ShadowAlpha, transitions } from '@threlte/extras';
import { fade, scale } from './transitions';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	transitions();

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => scale(0));

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						castShadow: true,
						get transition() {
							return $.get($0);
						},
						'position.y': 1,
						'position.x': -1.5,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
								T_SphereGeometry($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
								T_MeshStandardMaterial($$anchor, { transparent: true, color: 'red' });
							});

							var node_4 = $.sibling(node_3, 2);

							ShadowAlpha(node_4, {});
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.red) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					castShadow: true,
					'position.y': 1,
					'position.x': 1.5,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_7 = $.first_child(fragment_4);

						$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry_1) => {
							T_SphereGeometry_1($$anchor, {});
						});

						var node_8 = $.sibling(node_7, 2);

						{
							let $0 = $.derived(fade);

							$.component(node_8, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
								T_MeshToonMaterial($$anchor, {
									transparent: true,
									get transition() {
										return $.get($0);
									},
									color: 'blue'
								});
							});
						}

						var node_9 = $.sibling(node_8, 2);

						ShadowAlpha(node_9, {});
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_5, ($$render) => {
			if ($$props.blue) $$render(consequent_1);
		});
	}

	var node_10 = $.sibling(node_5, 2);

	Environment(node_10, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 3, 10],
			fov: 30,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					target: [0, 0.8, 0],
					enableZoom: false,
					enablePan: false
				});
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [10, 10, 10],
			castShadow: true,
			intensity: Math.PI / 2
		});
	});

	var node_13 = $.sibling(node_12, 2);

	$.component(node_13, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.1 });
	});

	var node_14 = $.sibling(node_13, 2);

	Grid(node_14, { sectionColor: '#374668', cellColor: '#374668' });

	var node_15 = $.sibling(node_14, 2);

	$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			receiveShadow: true,
			'position.y': -0.01,
			scale: 20,
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_16 = $.first_child(fragment_6);

				$.component(node_16, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, {});
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: '#0F141F' });
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}