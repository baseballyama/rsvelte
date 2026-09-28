import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useTask } from '@threlte/core';

import {
	Bounds,
	CameraControls,
	OrbitControls,
	Sparkles,
	TrackballControls,
	useGltf,
	useSuspense,
	useTexture
} from '@threlte/extras';

import {
	Color,
	DoubleSide,
	MeshBasicMaterial,
	MeshPhongMaterial,
	ShaderMaterial,
	Uniform
} from 'three';

import vertexShader from './vertex';
import fragmentShader from './fragment';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $texture = () => $.store_get(texture, '$texture', $$stores);
	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const Controls = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false, enablePan: false });
			};

			var consequent_1 = ($$anchor) => {
				CameraControls($$anchor, {});
			};

			var consequent_2 = ($$anchor) => {
				TrackballControls($$anchor, {});
			};

			$.if(node, ($$render) => {
				if ($$props.controls === 'orbit') $$render(consequent); else if ($$props.controls === 'camera') $$render(consequent_1, 1); else if ($$props.controls === 'trackball') $$render(consequent_2, 2);
			});
		}

		$.append($$anchor, fragment);
	};

	const suspend = useSuspense();
	const gltf = suspend(useGltf('/models/portal/portal.glb'));

	const texture = suspend(useTexture('/models/portal/portal_baked.jpg', {
		transform(result) {
			result.flipY = false;

			return result;
		}
	}));

	const poleLightMaterial = new MeshBasicMaterial({ color: 0xff_ff_e5 });
	const bakedMaterial = new MeshPhongMaterial();

	const portalLightMaterial = new ShaderMaterial({
		uniforms: {
			uTime: new Uniform(0),
			uColorStart: new Uniform(new Color('#1E88E5')),
			uColorEnd: new Uniform(new Color('#5E35B1'))
		},
		side: DoubleSide,
		vertexShader,
		fragmentShader
	});

	$.user_effect(() => {
		if ($texture()) {
			bakedMaterial.map = $texture();
		}
	});

	useTask((dt) => {
		portalLightMaterial.uniforms.uTime.value += dt;
	});

	var fragment_4 = root();
	var node_1 = $.first_child(fragment_4);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_2 = $.first_child(fragment_5);

			$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.x': 20,
					'position.y': 10,
					'position.z': -20,
					fov: 50,
					children: ($$anchor, $$slotProps) => {
						Controls($$anchor);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_3 = $.first_child(fragment_7);

			$.component(node_3, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
				T_OrthographicCamera($$anchor, {
					makeDefault: true,
					'position.x': 20,
					'position.y': 10,
					'position.z': -20,
					zoom: 50,
					children: ($$anchor, $$slotProps) => {
						Controls($$anchor);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_1, ($$render) => {
			if ($$props.camera === 'perspective') $$render(consequent_3); else if ($$props.camera === 'orthographic') $$render(consequent_4, 1);
		});
	}

	var node_4 = $.sibling(node_1, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_5 = ($$anchor) => {
			Bounds($$anchor, {
				get margin() {
					return $$props.margin;
				},

				get animate() {
					return $$props.animate;
				},

				get enabled() {
					return $$props.enabled;
				},

				children: ($$anchor, $$slotProps) => {
					T($$anchor, {
						get is() {
							return $gltf().scene;
						},

						oncreate: (ref) => {
							ref.traverse((child) => {
								if (!isInstanceOf(child, 'Mesh')) {
									return;
								}

								if (child.name === 'Portal') {
									child.material = portalLightMaterial;
								} else if (child.name === 'LampLight1' || child.name === 'LampLight2') {
									child.material = poleLightMaterial;
								} else {
									child.material = bakedMaterial;
								}
							});
						},

						children: ($$anchor, $$slotProps) => {
							Sparkles($$anchor, { position: [0, 0.8, 0], size: 4, scale: [4, 1.5, 4] });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($gltf()) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment_4);
	$.pop();
	$$cleanup();
}