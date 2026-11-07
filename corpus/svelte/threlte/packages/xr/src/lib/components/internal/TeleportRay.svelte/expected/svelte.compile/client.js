import 'svelte/internal/disclose-version';
import { Vector3, QuadraticBezierCurve3, Vector2 } from 'three';
import * as $ from 'svelte/internal/client';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { T, useTask, useThrelte } from '@threlte/core';
import { teleportIntersection } from '../../internal/state.svelte.js';

const rayStart = new Vector3();
const rayMidpoint = new Vector3();
const curve = new QuadraticBezierCurve3();
const vec3 = new Vector3();
const v2_1 = new Vector2();
const v2_2 = new Vector2();
var root = $.from_html(`<!> <!>`, 1);

export default function TeleportRay($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	const rayDivisions = 40;
	const positions = new Float32Array(rayDivisions * 3);
	const lineGeometry = new LineGeometry();
	const intersection = $.derived(() => teleportIntersection[$$props.handedness]);
	let firstRender = true;

	const setCurvePoints = (alpha = 0.3) => {
		if ($.get(intersection) === undefined) return;

		const rayEnd = $.get(intersection).point;

		$$props.targetRay.getWorldPosition(rayStart);
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

	$.user_effect(() => {
		if ($.get(intersection) === undefined) firstRender = true;
	});

	useTask(
		() => {
			setCurvePoints();
		},
		{ running: () => $.get(intersection) !== undefined }
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(intersection) !== undefined);

				T($$anchor, {
					get is() {
						return Line2;
					},

					get attach() {
						return scene;
					},

					get visible() {
						return $.get($0);
					},
					'position.z': -0.01,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						T(node_2, {
							get is() {
								return lineGeometry;
							}
						});

						var node_3 = $.sibling(node_2, 2);

						T(node_3, {
							get is() {
								return LineMaterial;
							},
							linewidth: 3
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}