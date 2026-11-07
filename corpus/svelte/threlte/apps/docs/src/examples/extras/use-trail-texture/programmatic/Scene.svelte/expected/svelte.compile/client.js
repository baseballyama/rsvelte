import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, isInstanceOf } from '@threlte/core';
import { useTrailTexture, useTexture, transitions, createTransition } from '@threlte/extras';
import { cubicInOut } from 'svelte/easing';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	transitions();

	const paintings = [
		'/textures/paintings/klimt.jpg',
		'/textures/paintings/vangogh.jpg',
		'/textures/paintings/caravaggio.jpg',
		'/textures/paintings/swan.jpg'
	];

	const allLoaded = Promise.all(paintings.map((src) => useTexture(src)));

	let size = $.prop($$props, 'size', 3, 256),
		maxAge = $.prop($$props, 'maxAge', 3, 3500),
		radius = $.prop($$props, 'radius', 3, 0.2),
		intensity = $.prop($$props, 'intensity', 3, 1),
		interpolate = $.prop($$props, 'interpolate', 3, 2),
		smoothing = $.prop($$props, 'smoothing', 3, 0.9),
		minForce = $.prop($$props, 'minForce', 3, 0.3);

	const { texture: trailTexture, setTrail } = useTrailTexture(() => ({
		size: size(),
		radius: radius(),
		maxAge: maxAge(),
		intensity: intensity(),
		interpolate: interpolate(),
		smoothing: smoothing(),
		minForce: minForce(),
		ease: $$props.ease
	}));

	const fade = createTransition((ref) => {
		if (!isInstanceOf(ref, 'Material')) return;

		ref.transparent = true;
		ref.needsUpdate = true;

		return {
			duration: 1500,
			easing: cubicInOut,
			tick: (t) => {
				ref.opacity = t;
			}
		};
	});

	const noise = new SimplexNoise();
	let index = $.state(0);
	let elapsed = 0;
	const swapInterval = 6;
	let time = 0;

	useTask((delta) => {
		time += delta * 0.5;

		const x = 0.5 + noise.noise(time, 0) * 0.4;
		const y = 0.5 + noise.noise(0, time) * 0.4;

		setTrail(x, y);
		elapsed += delta;

		if (elapsed >= swapInterval) {
			elapsed = 0;
			$.set(index, ($.get(index) + 1) % paintings.length);
		}
	});

	let fgIndex = $.derived(() => ($.get(index) + 1) % paintings.length);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, position: [0, 0, 1.8], fov: 45 });
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => allLoaded, null, ($$anchor, maps) => {
		var fragment_1 = root();
		var node_2 = $.first_child(fragment_1);

		$.key(node_2, () => $.get(index), ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						$.component(node_4, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, { args: [1.6, 1.6] });
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, {
								get map() {
									return $.get(maps)[$.get(index)];
								},
								transparent: true,
								get transition() {
									return fade;
								}
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		});

		var node_6 = $.sibling(node_2, 2);

		$.key(node_6, () => $.get(fgIndex), ($$anchor) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					'position.z': 0.001,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
							T_PlaneGeometry_1($$anchor, { args: [1.6, 1.6] });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
							T_MeshBasicMaterial_1($$anchor, {
								get map() {
									return $.get(maps)[$.get(fgIndex)];
								},
								transparent: true,
								get alphaMap() {
									return trailTexture;
								},

								get transition() {
									return fade;
								}
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}