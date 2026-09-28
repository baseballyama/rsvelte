import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BallInstance from './BallInstance.svelte';
import { Color } from 'three';
import { DirectionalLight } from 'three';
import { Instance, InstancedMesh, interactivity } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $viewportSize = () => $.store_get(viewportSize, '$viewportSize', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gap = 2.5;
	const limit = $.derived(() => $$props.size * $$props.size);
	const offset = $.derived(() => $$props.size * gap / 2);
	const startColor = new Color('blue');
	const endColor = new Color('yellow');

	const instances = $.derived(() => {
		const results = [];

		for (let i = 0; i < $.get(limit); i += 1) {
			const x = i % $$props.size * gap - $.get(offset);
			const z = Math.floor(i / $$props.size) * gap - $.get(offset);

			results.push(new BallInstance(startColor, endColor, x, z));
		}

		return results;
	});

	const { size: viewportSize } = useThrelte();
	const zoom = $.derived(() => $viewportSize().width / (1.5 * gap * $$props.size));

	interactivity({
		filter(items) {
			// only report the first intersection
			return items.slice(0, 1);
		}
	});

	const light = new DirectionalLight();
	const lightRadius = 10;
	const lightHeight = 5;
	let time = 0;

	useTask((delta) => {
		time += delta;

		const x = lightRadius * Math.cos(time);
		const z = lightRadius * Math.sin(time);

		light.position.set(x, lightHeight, z);
		light.lookAt(0, 0, 0);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [$$props.size, $$props.size, $$props.size]);

		$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
			T_OrthographicCamera($$anchor, {
				get position() {
					return $.get($0);
				},

				get zoom() {
					return $.get(zoom);
				},
				makeDefault: true,
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	InstancedMesh(node_1, {
		limit: 50 * 50,
		get range() {
			return $.get(limit);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
				T_SphereGeometry($$anchor, {});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
				T_MeshToonMaterial($$anchor, {});
			});

			var node_4 = $.sibling(node_3, 2);

			$.each(node_4, 17, () => $.get(instances), $.index, ($$anchor, instance) => {
				Instance($$anchor, {
					'rotation.x': 0.5 * Math.PI,
					get 'position.x'() {
						return $.get(instance).x;
					},

					get 'position.y'() {
						return $.get(instance).y.current;
					},

					get scale() {
						return $.get(instance).scale;
					},

					get 'position.z'() {
						return $.get(instance).z;
					},

					get color() {
						return $.get(instance).color;
					},

					onpointerenter: () => {
						$.get(instance).y.set(1);
					},

					onpointerleave: () => {
						$.get(instance).y.set(0);
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	T(node_5, {
		get is() {
			return light;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}