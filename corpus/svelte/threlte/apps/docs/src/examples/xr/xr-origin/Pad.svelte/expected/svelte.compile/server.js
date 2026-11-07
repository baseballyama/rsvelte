import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Text } from '@threlte/extras';

export default function Pad($$renderer, $$props) {
	let { active = false, color, label, onclick, position } = $$props;

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position,
			onclick,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.y': 0.012,
						'rotation.x': -Math.PI / 2,
						children: ($$renderer) => {
							if (T.CircleGeometry) {
								$$renderer.push('<!--[-->');
								T.CircleGeometry($$renderer, { args: [0.38, 48] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color: active ? color : '#111827',
									emissive: color,
									emissiveIntensity: active ? 1.1 : 0.25,
									metalness: 0.1,
									roughness: 0.4
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.y': 0.13,
						castShadow: true,
						children: ($$renderer) => {
							if (T.CylinderGeometry) {
								$$renderer.push('<!--[-->');
								T.CylinderGeometry($$renderer, { args: [0.055, 0.055, 0.26, 24] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color,
									emissive: color,
									emissiveIntensity: 0.2,
									metalness: 0.2,
									roughness: 0.45
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.y': 0.021,
						'rotation.x': -Math.PI / 2,
						raycast: () => false,
						children: ($$renderer) => {
							if (T.RingGeometry) {
								$$renderer.push('<!--[-->');
								T.RingGeometry($$renderer, { args: [0.11, 0.15, 32] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshStandardMaterial($$renderer, {
									color: active ? '#ecfeff' : '#d1d5db',
									emissive: active ? '#67e8f9' : '#374151',
									emissiveIntensity: active ? 0.8 : 0.1,
									side: 2
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Text($$renderer, {
					color: active ? '#f9fafb' : '#d1d5db',
					fontSize: 0.11,
					anchorX: 'center',
					anchorY: 'bottom',
					position: [0, 0.32, 0],
					raycast: () => false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(label)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}