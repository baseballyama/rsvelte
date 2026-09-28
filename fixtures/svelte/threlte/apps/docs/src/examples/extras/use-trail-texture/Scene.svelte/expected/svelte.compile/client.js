import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useTrailTexture, interactivity } from '@threlte/extras';
import { ShaderMaterial, Color, DoubleSide } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	let size = $.prop($$props, 'size', 3, 64),
		maxAge = $.prop($$props, 'maxAge', 3, 750),
		radius = $.prop($$props, 'radius', 3, 0.3),
		intensity = $.prop($$props, 'intensity', 3, 0.2),
		interpolate = $.prop($$props, 'interpolate', 3, 0),
		smoothing = $.prop($$props, 'smoothing', 3, 0),
		minForce = $.prop($$props, 'minForce', 3, 0.3),
		amount = $.prop($$props, 'amount', 3, 0.1);

	const { texture, onPointerMove } = useTrailTexture(() => ({
		size: size(),
		radius: radius(),
		maxAge: maxAge(),
		intensity: intensity(),
		interpolate: interpolate(),
		smoothing: smoothing(),
		minForce: minForce(),
		ease: $$props.ease
	}));

	function createMaterial(map) {
		return new ShaderMaterial({
			uniforms: {
				map: { value: map },
				color: { value: new Color('turquoise') },
				color2: { value: new Color('magenta') },
				amount: { value: amount() }
			},

			vertexShader: `
        uniform sampler2D map;
        uniform float amount;
        varying float vDisplace;
        void main() {
          float displace = texture2D(map, uv).r;
          vDisplace = displace;
          vec3 pos = position;
          pos.z += displace * amount;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,

			fragmentShader: `
        uniform vec3 color;
        uniform vec3 color2;
        varying float vDisplace;
        void main() {
          vec3 col = mix(color, color2, vDisplace);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
			wireframe: true,
			side: DoubleSide
		});
	}

	const material = createMaterial(texture);

	$.user_effect(() => {
		material.uniforms.amount.value = amount();
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, position: [0, 0, 2.5], fov: 45 });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'rotation.x': -Math.PI * 0.3,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						'rotation.z': Math.PI * 0.2,
						get onpointermove() {
							return onPointerMove;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
								T_PlaneGeometry($$anchor, { args: [2, 2, 32, 32] });
							});

							var node_4 = $.sibling(node_3, 2);

							T(node_4, {
								get is() {
									return material;
								}
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}