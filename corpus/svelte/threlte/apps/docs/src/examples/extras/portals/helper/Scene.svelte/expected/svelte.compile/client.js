import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { Grid, OrbitControls, TransformControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [10, 10, 10],
			makeDefault: true,
			fov: 30,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Grid(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let ref = () => ($$arg0?.()).ref;
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let helperA = () => ($$arg0?.()).ref;

					TransformControls($$anchor, {
						get object() {
							return ref();
						},
						onobjectChange: () => helperA().update()
					});
				};

				let $0 = $.derived(() => [ref()]);

				$.component(node_3, () => T.DirectionalLightHelper, ($$anchor, T_DirectionalLightHelper) => {
					T_DirectionalLightHelper($$anchor, {
						get attach() {
							return scene;
						},

						get args() {
							return $.get($0);
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
			T_DirectionalLight($$anchor, {
				color: '#FE3D00',
				intensity: 1,
				position: [1.5, 2, 0.5],
				children,
				$$slots: { default: true }
			});
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let ref = () => ($$arg0?.()).ref;
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let helperB = () => ($$arg0?.()).ref;

					TransformControls($$anchor, {
						get object() {
							return ref();
						},
						onobjectChange: () => helperB().update()
					});
				};

				let $0 = $.derived(() => [ref()]);

				$.component(node_5, () => T.DirectionalLightHelper, ($$anchor, T_DirectionalLightHelper_1) => {
					T_DirectionalLightHelper_1($$anchor, {
						get attach() {
							return scene;
						},

						get args() {
							return $.get($0);
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight_1) => {
			T_DirectionalLight_1($$anchor, {
				intensity: 0.5,
				color: '#2F7DC6',
				position: [-1, -2, 1],
				children,
				$$slots: { default: true }
			});
		});
	}

	var node_6 = $.sibling(node_4, 2);

	$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root();
				var node_7 = $.first_child(fragment_6);

				$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}