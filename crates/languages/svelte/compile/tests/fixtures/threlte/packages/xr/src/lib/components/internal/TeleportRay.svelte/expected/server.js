import * as $ from 'svelte/internal/server';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { T, useTask, useThrelte } from '@threlte/core';
import { teleportIntersection } from '../../internal/state.svelte.js';
import { Vector3, QuadraticBezierCurve3, Vector2 } from 'three';

const rayStart = new Vector3();
const rayMidpoint = new Vector3();
const curve = new QuadraticBezierCurve3();
const vec3 = new Vector3();
const v2_1 = new Vector2();
const v2_2 = new Vector2();

export default function TeleportRay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { handedness, targetRay, children } = $$props;
		const { scene } = useThrelte();
		const rayDivisions = 40;
		const positions = new Float32Array(rayDivisions * 3);
		const lineGeometry = new LineGeometry();
		const intersection = $.derived(() => teleportIntersection[handedness]);
		let firstRender = true;

		const setCurvePoints = (alpha = 0.3) => {
			if (intersection() === undefined) return;

			const rayEnd = intersection().point;

			targetRay.getWorldPosition(rayStart);
			rayMidpoint.x = (rayStart.x + rayEnd.x) / 2;
			rayMidpoint.y = (rayStart.y + rayEnd.y) / 2;
			rayMidpoint.z = (rayStart.z + rayEnd.z) / 2;

			const arc = Math.log1p(v2_1.set(rayStart.x, rayStart.z).distanceTo(v2_2.set(rayEnd.x, rayEnd.z)));

			// Create an arc
			rayMidpoint.y += arc;

			if (firstRender) {
				curve.v0.copy(rayStart);
				curve.v1.copy(rayMidpoint);
				curve.v2.copy(rayEnd);
				firstRender = false;
			} else {
				curve.v0.lerp(rayStart, alpha);
				curve.v1.lerp(rayMidpoint, alpha);
				curve.v2.lerp(rayEnd, alpha);
			}

			for (let i = 0, j = 0; i < rayDivisions; (i += 1, j += 3)) {
				const t = i / rayDivisions;

				curve.getPoint(t, vec3);
				positions[j + 0] = vec3.x;
				positions[j + 1] = vec3.y;
				positions[j + 2] = vec3.z;
			}

			lineGeometry.setPositions(positions);
		};

		useTask(
			() => {
				setCurvePoints();
			},
			{ running: () => intersection() !== undefined }
		);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			T($$renderer, {
				is: Line2,
				attach: scene,
				visible: intersection() !== undefined,
				'position.z': -0.01,
				children: ($$renderer) => {
					T($$renderer, { is: lineGeometry });
					$$renderer.push(`<!----> `);
					T($$renderer, { is: LineMaterial, linewidth: 3 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}