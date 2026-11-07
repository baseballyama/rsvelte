import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Surfaces from './Surfaces.svelte';
import { OrbitControls, Sky, useDraco, useGltf } from '@threlte/extras';
import { PointLight } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { T, useTask } from '@threlte/core';
import { XR, Controller, Hand } from '@threlte/xr';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const noise = new SimplexNoise();
	const light1 = new PointLight();
	const light2 = new PointLight();
	let torchX = $.state(0);
	let torchZ = $.state(0);
	const dracoLoader = useDraco();

	const gltf = useGltf('/models/xr/ruins.glb', { dracoLoader }).then((gltf) => {
		gltf.scene.traverse((node) => {
			node.castShadow = true;
			node.receiveShadow = true;
		});

		$.set(torchX, gltf.nodes.Torch1.position.x, true);
		$.set(torchZ, gltf.nodes.Torch1.position.z, true);

		return gltf;
	});

	let time = 0;

	useTask((delta) => {
		time += delta / 5;

		const x = noise.noise(time, 0) / 10;
		const y = noise.noise(0, time) / 10;
		const lightPositionX = $.get(torchX) + x;
		const lightPositionZ = $.get(torchZ) + y;

		light1.position.x = lightPositionX;
		light2.position.x = lightPositionX;
		light1.position.z = lightPositionZ;
		light2.position.z = lightPositionZ;
	});

	var fragment = root_2();
	var node_1 = $.first_child(fragment);

	{
		const fallback = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.y': 1.8,
					'position.z': 1.5,
					oncreate: (ref) => ref.lookAt(0, 1.8, 0),
					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, { target: [0, 1.8, 0], enablePan: false, enableZoom: false });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		XR(node_1, {
			fallback,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_3 = $.first_child(fragment_3);

				Controller(node_3, { left: true });

				var node_4 = $.sibling(node_3, 2);

				Controller(node_4, { right: true });

				var node_5 = $.sibling(node_4, 2);

				Hand(node_5, { left: true });

				var node_6 = $.sibling(node_5, 2);

				Hand(node_6, { right: true });
				$.append($$anchor, fragment_3);
			},
			$$slots: { fallback: true, default: true }
		});
	}

	var node_7 = $.sibling(node_1, 2);

	$.await(node_7, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { scene, nodes } = $.get($$source);

			return { scene, nodes };
		});

		var scene = $.derived(() => $.get($$value).scene);
		var nodes = $.derived(() => $.get($$value).nodes);
		var fragment_4 = root_1();
		var node_8 = $.first_child(fragment_4);

		T(node_8, {
			get is() {
				return $.get(scene);
			}
		});

		var node_9 = $.sibling(node_8, 2);

		{
			let $0 = $.derived(() => $.get(nodes).Torch1.position.y + 0.45);

			T(node_9, {
				get is() {
					return light1;
				},
				intensity: 8,
				color: 'red',
				get 'position.y'() {
					return $.get($0);
				}
			});
		}

		var node_10 = $.sibling(node_9, 2);

		{
			let $0 = $.derived(() => $.get(nodes).Candles1.position.y + 0.45);

			T(node_10, {
				get is() {
					return light2;
				},
				intensity: 4,
				color: 'red',
				get 'position.y'() {
					return $.get($0);
				}
			});
		}

		$.append($$anchor, fragment_4);
	});

	var node_11 = $.sibling(node_7, 2);

	Sky(node_11, { elevation: -3, rayleigh: 8, azimuth: -90 });

	var node_12 = $.sibling(node_11, 2);

	Surfaces(node_12, {
		get showSurfaces() {
			return $$props.showSurfaces;
		},

		get showBlockers() {
			return $$props.showBlockers;
		}
	});

	var node_13 = $.sibling(node_12, 2);

	$.component(node_13, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.25 });
	});

	var node_14 = $.sibling(node_13, 2);

	$.component(node_14, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			intensity: 0.5,
			position: [5, 5, 1],
			castShadow: true,
			'shadow.camera.top': 50,
			'shadow.camera.right': 50,
			'shadow.camera.left': -50,
			'shadow.camera.bottom': -50,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.far': 10
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}