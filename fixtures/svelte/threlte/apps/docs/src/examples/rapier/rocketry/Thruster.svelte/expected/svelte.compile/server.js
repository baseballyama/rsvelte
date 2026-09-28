import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useTexture } from '@threlte/extras';
import { AdditiveBlending, MeshBasicMaterial } from 'three';

import {
	Bezier,
	ColorOverLife,
	ConeEmitter,
	ConstantColor,
	ConstantValue,
	DEG2RAD,
	Gradient,
	IntervalValue,
	PiecewiseBezier,
	RenderMode,
	SizeOverLife,
	Vector3,
	Vector4
} from 'three.quarks';

import fire from './assets/fire3.png?url';
import smoke from './assets/smoke.png?url';
import ParticleSystem from './quarks/ParticleSystem.svelte';
import ThrusterController from './ThrusterController.svelte';

export default function Thruster($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { active } = $$props;

		const rgbToRange = (r, g, b) => {
			return [r / 255, g / 255, b / 255];
		};

		/**
		 * Accepts a hex string like #C84427
		 * @param hex
		 */
		const hexToRange = (hex) => {
			// Remove the '#' if present
			hex = hex.replace(/^#/, '');

			// Parse the hex string
			const bigint = parseInt(hex, 16);

			// Extract r, g, b values
			const r = bigint >> 16 & 255;

			const g = bigint >> 8 & 255;
			const b = bigint & 255;

			// Convert to 0-1 range
			return [r / 255, g / 255, b / 255];
		};

		$.await($$renderer, useTexture([smoke, fire]), () => {}, ([smokeMap, fireMap]) => {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					'rotation.x': 90 * DEG2RAD,
					children: ($$renderer) => {
						{
							function children($$renderer, { system }) {
								ThrusterController($$renderer, { system, active });
							}

							ParticleSystem($$renderer, {
								material: new MeshBasicMaterial({ map: smokeMap, transparent: true }),
								duration: 1,
								looping: true,
								startLife: new IntervalValue(1, 3),
								startSpeed: new ConstantValue(2),
								startSize: new IntervalValue(0.2, 0.4),
								startRotation: new IntervalValue(0, 360 * DEG2RAD),
								startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
								worldSpace: true,
								emissionOverTime: new ConstantValue(200),
								shape: new ConeEmitter({ radius: 0.05, angle: 10 * DEG2RAD }),
								uTileCount: 1,
								vTileCount: 1,
								renderMode: RenderMode.BillBoard,
								rendererEmitterSettings: { followLocalOrigin: true },
								behaviors: [
									new ColorOverLife(new Gradient(
										[
											[new Vector3(...hexToRange('#493B32')), 0],
											[new Vector3(...rgbToRange(38, 38, 38)), 0.2],
											[new Vector3(1, 1, 1), 1]
										],
										[[1, 0], [0, 1]]
									)),
									new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.1, 2.1, 5), 0]]))
								],
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { system }) {
								ThrusterController($$renderer, { system, active });
							}

							ParticleSystem($$renderer, {
								material: new MeshBasicMaterial({ map: fireMap, transparent: true, blending: AdditiveBlending }),
								duration: 1,
								looping: true,
								startLife: new IntervalValue(0.2, 0.4),
								startSpeed: new ConstantValue(2),
								startSize: new IntervalValue(0.2, 0.3),
								startRotation: new IntervalValue(0, 360 * DEG2RAD),
								startColor: new ConstantColor(new Vector4(...hexToRange('#FFFFFF'), 1)),
								worldSpace: true,
								emissionOverTime: new ConstantValue(150),
								shape: new ConeEmitter({ radius: 0.05, angle: 10 * DEG2RAD }),
								uTileCount: 1,
								vTileCount: 1,
								renderMode: RenderMode.BillBoard,
								rendererEmitterSettings: { followLocalOrigin: true },
								behaviors: [
									new ColorOverLife(new Gradient(
										[
											[new Vector3(...hexToRange('#FFFFFF')), 0],
											[new Vector3(...hexToRange('#FFFFFF')), 1]
										],
										[[1, 0], [0, 1]]
									)),
									new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.1, 1.2, 3), 0]]))
								],
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]-->`);
	});
}