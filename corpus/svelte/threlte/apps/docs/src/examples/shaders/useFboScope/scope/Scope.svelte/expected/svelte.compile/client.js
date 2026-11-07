import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, MathUtils } from 'three';
import { T } from '@threlte/core';
import { useGltf } from '@threlte/extras';
import { Tween } from 'svelte/motion';
import { scoping } from '../Controls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Scope($$anchor, $$props) {
	$.push($$props, true);

	const $scoping = () => $.store_get(scoping, '$scoping', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const group = new Group();
	const gltf = useGltf('/models/scope.glb');
	const rotationX = new Tween(-3);
	const position = new Tween([0.4, -0.15, -1]);

	$.user_pre_effect(() => {
		if ($scoping()) {
			rotationX.set(0);
			position.set([0, 0, -0.496]);
		} else {
			rotationX.set(-3);
			position.set([0.4, -0.15, -1]);
		}
	});

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * rotationX.current);

		T($$anchor, {
			get is() {
				return group;
			},
			dispose: false,
			scale: 0.02,
			get position() {
				return position.current;
			},

			get 'rotation.y'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.await(node, () => gltf, null, ($$anchor, $$source) => {
					var $$value = $.derived(() => {
						var { nodes, materials } = $.get($$source);

						return { nodes, materials };
					});

					var nodes = $.derived(() => $.get($$value).nodes);
					var materials = $.derived(() => $.get($$value).materials);
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							get geometry() {
								return $.get(nodes).Object_2.geometry;
							},

							get material() {
								return $.get(materials).initialShadingGroup;
							},
							rotation: [-Math.PI / 2, 0, 0]
						});
					});

					$.append($$anchor, fragment_2);
				});

				var node_2 = $.sibling(node, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: group }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}