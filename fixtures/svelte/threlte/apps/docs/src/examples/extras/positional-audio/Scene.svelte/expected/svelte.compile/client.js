import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { AudioListener, Environment, interactivity, OrbitControls } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { MathUtils } from 'three';
import Speaker from './Speaker.svelte';
import Turntable from './Turntable.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let volume = $.state(0);
	let isPlaying = $.state(false);
	const smoothVolume = new Spring(0);

	$.user_effect(() => {
		smoothVolume.set($.get(volume));
	});

	const { size } = useThrelte();
	let zoom = $.derived(() => $size().width / 18);

	interactivity({
		filter: (hits) => {
			// only return first hit, we don't care
			// about propagation in this example
			return hits.slice(0, 1);
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			get zoom() {
				return $.get(zoom);
			},
			makeDefault: true,
			position: [6, 9, 9],
			oncreate: (ref) => {
				ref.lookAt(0, 1.5, 0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * 80);

					OrbitControls(node_2, {
						get autoRotate() {
							return $.get(isPlaying);
						},
						autoRotateSpeed: 0.5,
						enableDamping: true,
						get maxPolarAngle() {
							return $.get($0);
						},
						'target.y': 1.5
					});
				}

				var node_3 = $.sibling(node_2, 2);

				AudioListener(node_3, {});
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

		$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				receiveShadow: true,
				get 'rotation.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					$.component(node_5, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [10, 64] });
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: '#333333' });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_7 = $.sibling(node_4, 2);

	Turntable(node_7, {
		get isPlaying() {
			return $.get(isPlaying);
		},

		set isPlaying($$value) {
			$.set(isPlaying, $$value, true);
		},

		get volume() {
			return $.get(volume);
		},

		set volume($$value) {
			$.set(volume, $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * -7);

		Speaker(node_8, {
			'position.x': 6,
			get 'rotation.y'() {
				return $.get($0);
			},

			get volume() {
				return $.get(volume);
			}
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * 7);

		Speaker(node_9, {
			'position.x': -6,
			get 'rotation.y'() {
				return $.get($0);
			},

			get volume() {
				return $.get(volume);
			}
		});
	}

	var node_10 = $.sibling(node_9, 2);

	$.component(node_10, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			castShadow: true,
			'shadow.camera.left': -10,
			'shadow.camera.bottom': -10,
			'shadow.camera.right': 10,
			'shadow.camera.top': 10,
			position: [10, 20, 8],
			intensity: 0.3
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}