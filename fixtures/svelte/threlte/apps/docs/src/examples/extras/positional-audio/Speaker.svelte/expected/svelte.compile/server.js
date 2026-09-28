import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { cubicIn, cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';

export default function Speaker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { volume = 0, $$slots, $$events, ...rest } = $$props;
		let jumpOffsetY = new Tween(0);
		let jumpRotationX = new Tween(0);
		let jumpRotationZ = new Tween(0);
		let isJumping = false;
		const randomSign = () => Math.round(Math.random()) * 2 - 1;

		const jump = () => {
			isJumping = true;

			const upDuration = 10 + Math.random() * 50;

			jumpOffsetY.set(0.2, { duration: upDuration, easing: cubicOut });
			jumpRotationX.set(Math.random() * 4 * randomSign(), { duration: upDuration, easing: cubicOut });
			jumpRotationZ.set(Math.random() * 4 * randomSign(), { duration: upDuration, easing: cubicOut });

			setTimeout(
				() => {
					const downDuration = 40 + Math.random() * 70;

					jumpOffsetY.set(0, { duration: downDuration, easing: cubicIn });
					jumpRotationX.set(0, { duration: downDuration, easing: cubicIn });
					jumpRotationZ.set(0, { duration: downDuration, easing: cubicIn });

					setTimeout(
						() => {
							isJumping = false;
						},
						downDuration * 1.5
					);
				},
				upDuration
			);
		};

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, $.spread_props([
				rest,
				{
					children: ($$renderer) => {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								'position.y': jumpOffsetY.current,
								'rotation.z': MathUtils.DEG2RAD * jumpRotationZ.current,
								'rotation.x': MathUtils.DEG2RAD * jumpRotationX.current,
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											castShadow: true,
											receiveShadow: true,
											'position.y': 2.5,
											children: ($$renderer) => {
												if (T.BoxGeometry) {
													$$renderer.push('<!--[-->');
													T.BoxGeometry($$renderer, { args: [3, 5, 3] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: '#eedbcb' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { color: 'black', scale: 1.001 });
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

									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											'position.z': 1.1,
											'position.y': 3.5,
											scale: 1 + volume,
											'rotation.x': MathUtils.DEG2RAD * -90,
											children: ($$renderer) => {
												if (T.ConeGeometry) {
													$$renderer.push('<!--[-->');
													T.ConeGeometry($$renderer, { args: [1, 1, 64] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { flatShading: true, color: '#111111' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { color: 'black', scale: 1.001, thresholdAngle: 20 });
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