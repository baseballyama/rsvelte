import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function Thruster($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => useTexture([smoke, fire]), null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [smokeMap, fireMap] = $.get($$source);

			return { smokeMap, fireMap };
		});

		var smokeMap = $.derived(() => $.get($$value).smokeMap);
		var fireMap = $.derived(() => $.get($$value).fireMap);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			let $0 = $.derived(() => 90 * DEG2RAD);

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get 'rotation.x'() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							const children = ($$anchor, $$arg0) => {
								let system = () => ($$arg0?.()).system;

								ThrusterController($$anchor, {
									get system() {
										return system();
									},

									get active() {
										return $$props.active;
									}
								});
							};

							let $0 = $.derived(() => new MeshBasicMaterial({ map: $.get(smokeMap), transparent: true }));
							let $1 = $.derived(() => new IntervalValue(1, 3));
							let $2 = $.derived(() => new ConstantValue(2));
							let $3 = $.derived(() => new IntervalValue(0.2, 0.4));
							let $4 = $.derived(() => new IntervalValue(0, 360 * DEG2RAD));
							let $5 = $.derived(() => new ConstantColor(new Vector4(1, 1, 1, 1)));
							let $6 = $.derived(() => new ConstantValue(200));
							let $7 = $.derived(() => new ConeEmitter({ radius: 0.05, angle: 10 * DEG2RAD }));

							let $8 = $.derived(() => [
								new ColorOverLife(new Gradient(
									[
										[new Vector3(...hexToRange('#493B32')), 0],
										[new Vector3(...rgbToRange(38, 38, 38)), 0.2],
										[new Vector3(1, 1, 1), 1]
									],
									[[1, 0], [0, 1]]
								)),
								new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.1, 2.1, 5), 0]]))
							]);

							ParticleSystem(node_2, {
								get material() {
									return $.get($0);
								},
								duration: 1,
								looping: true,
								get startLife() {
									return $.get($1);
								},

								get startSpeed() {
									return $.get($2);
								},

								get startSize() {
									return $.get($3);
								},

								get startRotation() {
									return $.get($4);
								},

								get startColor() {
									return $.get($5);
								},
								worldSpace: true,
								get emissionOverTime() {
									return $.get($6);
								},

								get shape() {
									return $.get($7);
								},
								uTileCount: 1,
								vTileCount: 1,
								get renderMode() {
									return RenderMode.BillBoard;
								},
								rendererEmitterSettings: { followLocalOrigin: true },
								get behaviors() {
									return $.get($8);
								},
								children,
								$$slots: { default: true }
							});
						}

						var node_3 = $.sibling(node_2, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let system = () => ($$arg0?.()).system;

								ThrusterController($$anchor, {
									get system() {
										return system();
									},

									get active() {
										return $$props.active;
									}
								});
							};

							let $0 = $.derived(() => new MeshBasicMaterial({
								map: $.get(fireMap),
								transparent: true,
								blending: AdditiveBlending
							}));

							let $1 = $.derived(() => new IntervalValue(0.2, 0.4));
							let $2 = $.derived(() => new ConstantValue(2));
							let $3 = $.derived(() => new IntervalValue(0.2, 0.3));
							let $4 = $.derived(() => new IntervalValue(0, 360 * DEG2RAD));
							let $5 = $.derived(() => new ConstantColor(new Vector4(...hexToRange('#FFFFFF'), 1)));
							let $6 = $.derived(() => new ConstantValue(150));
							let $7 = $.derived(() => new ConeEmitter({ radius: 0.05, angle: 10 * DEG2RAD }));

							let $8 = $.derived(() => [
								new ColorOverLife(new Gradient(
									[
										[new Vector3(...hexToRange('#FFFFFF')), 0],
										[new Vector3(...hexToRange('#FFFFFF')), 1]
									],
									[[1, 0], [0, 1]]
								)),
								new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.1, 1.2, 3), 0]]))
							]);

							ParticleSystem(node_3, {
								get material() {
									return $.get($0);
								},
								duration: 1,
								looping: true,
								get startLife() {
									return $.get($1);
								},

								get startSpeed() {
									return $.get($2);
								},

								get startSize() {
									return $.get($3);
								},

								get startRotation() {
									return $.get($4);
								},

								get startColor() {
									return $.get($5);
								},
								worldSpace: true,
								get emissionOverTime() {
									return $.get($6);
								},

								get shape() {
									return $.get($7);
								},
								uTileCount: 1,
								vTileCount: 1,
								get renderMode() {
									return RenderMode.BillBoard;
								},
								rendererEmitterSettings: { followLocalOrigin: true },
								get behaviors() {
									return $.get($8);
								},
								children,
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}