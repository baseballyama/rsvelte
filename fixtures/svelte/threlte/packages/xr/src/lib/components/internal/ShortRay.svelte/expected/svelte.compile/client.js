import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { pointerState, teleportState, teleportIntersection } from '../../internal/state.svelte.js';

var root = $.from_html(`<!> <!>`, 1);

export default function ShortRay($$anchor, $$props) {
	$.push($$props, true);

	const hovering = $.derived(() => teleportState[$$props.handedness].hovering);
	const intersection = $.derived(() => teleportIntersection[$$props.handedness]);
	const visible = $.derived(() => pointerState[$$props.handedness].enabled || $.get(hovering) && $.get(intersection) === undefined);

	const vertexShader = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec2 uv;
    attribute vec3 position;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

	const fragmentShader = `
    precision mediump float;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, pow(vUv.y - 1.0, 2.0));
    }`;

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get visible() {
				return $.get(visible);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children);
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								'rotation.x': -Math.PI / 2,
								'position.z': -0.1,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
										T_CylinderGeometry($$anchor, { args: [0.002, 0.002, 0.2, 16, 1, false] });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.RawShaderMaterial, ($$anchor, T_RawShaderMaterial) => {
										T_RawShaderMaterial($$anchor, { transparent: true, vertexShader, fragmentShader });
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_1, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}