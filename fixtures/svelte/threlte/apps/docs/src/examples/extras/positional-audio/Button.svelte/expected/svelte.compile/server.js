import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Edges, Text, useCursor } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { MathUtils } from 'three';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text, onClick, $$slots, $$events, ...rest } = $$props;
		const buttonOffsetY = new Spring(0);
		let buttonColor = '#111111';
		let textColor = '#eedbcb';
		const { onPointerEnter, onPointerLeave } = useCursor();

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, $.spread_props([
				rest,
				{
					children: ($$renderer) => {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								'position.y': 0.05 - buttonOffsetY.current,
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											onclick: onClick,
											onpointerenter: (e) => {
												e.stopPropagation();
												buttonColor = '#eedbcb';
												textColor = '#111111';
												onPointerEnter();
											},

											onpointerleave: (e) => {
												e.stopPropagation();
												buttonColor = '#111111';
												textColor = '#eedbcb';
												buttonOffsetY.set(0);
												onPointerLeave();
											},

											onpointerdown: (e) => {
												e.stopPropagation();
												buttonOffsetY.set(0.05);
											},

											onpointerup: (e) => {
												e.stopPropagation();
												buttonOffsetY.set(0);
											},

											children: ($$renderer) => {
												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, { args: [1.2, 0.1, 0.8] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: buttonColor });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { color: 'black', raycast: () => null });
												$$renderer.push(`<!---->`);
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
										renderOrder: -100,
										ignorePointer: true,
										color: textColor,
										text,
										'rotation.x': MathUtils.DEG2RAD * -90,
										'position.y': 0.055,
										fontSize: 0.35,
										anchorX: '50%',
										anchorY: '50%'
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
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}