import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	atan,
	Fn,
	frontFacing,
	If,
	output,
	PI2,
	positionLocal,
	uniform,
	vec4
} from 'three/tsl';

import { Color } from 'three/webgpu';

const defaultStartAngle = 0;
const defaultArcAngle = 0.5 * Math.PI;
const defaultColor = 'black';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'arcAngle',
	'sliceColor',
	'startAngle',
	'ref'
]);

export default function SliceMaterial($$anchor, $$props) {
	$.push($$props, true);

	let arcAngle = $.prop($$props, 'arcAngle', 3, defaultArcAngle),
		sliceColor = $.prop($$props, 'sliceColor', 3, defaultColor),
		startAngle = $.prop($$props, 'startAngle', 3, defaultStartAngle),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const uArcAngle = uniform(defaultArcAngle);
	const uColor = uniform(new Color(defaultColor));
	const uStartAngle = uniform(defaultStartAngle);
	const angle = atan(positionLocal.y, positionLocal.x).sub(uStartAngle).mod(PI2);
	const inAngle = angle.greaterThan(0).and(angle.lessThan(uArcAngle));

	const outputNodeFn = Fn(() => {
		inAngle.discard();

		If(frontFacing.not(), () => {
			output.assign(vec4(uColor, 1.0));
		});

		return output;
	});

	const shadow = vec4(0.0, 0.0, 0.0, 1.0);

	const castShadowNodeFn = Fn(() => {
		inAngle.discard();

		return shadow;
	});

	$.user_effect(() => {
		uArcAngle.value = arcAngle();
		uColor.value.set(sliceColor());
		uStartAngle.value = startAngle();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(outputNodeFn);
		let $1 = $.derived(castShadowNodeFn);

		$.component(node, () => T.MeshPhysicalNodeMaterial, ($$anchor, T_MeshPhysicalNodeMaterial) => {
			T_MeshPhysicalNodeMaterial($$anchor, $.spread_props(
				{
					get outputNode() {
						return $.get($0);
					},

					get castShadowNode() {
						return $.get($1);
					}
				},
				() => props,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}