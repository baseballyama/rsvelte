import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils, Group } from 'three';
import { useTask, T } from '@threlte/core';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'speed',
	'floatIntensity',
	'floatingRange',
	'rotationSpeed',
	'rotationIntensity',
	'seed',
	'ref',
	'children'
]);

export default function Float($$anchor, $$props) {
	$.push($$props, true);

	let speed = $.prop($$props, 'speed', 3, 1),
		floatIntensity = $.prop($$props, 'floatIntensity', 3, 1),
		floatingRange = $.prop($$props, 'floatingRange', 19, () => [-0.1, 0.1]),
		rotationSpeed = $.prop($$props, 'rotationSpeed', 3, 0),
		rotationIntensity = $.prop($$props, 'rotationIntensity', 3, 0),
		seed = $.prop($$props, 'seed', 19, () => 10_000 * Math.random()),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const outerGroup = new Group();
	const group = new Group();
	let now = untrack(() => seed());
	const map = MathUtils.mapLinear;
	let fSpeed = $.derived(() => Array.isArray(speed()) ? speed() : [speed(), speed(), speed()]);

	let fIntensity = $.derived(() => Array.isArray(floatIntensity())
		? floatIntensity()
		: [floatIntensity(), floatIntensity(), floatIntensity()]);

	let fRange = $.derived(() => floatingRange().length === 3 ? floatingRange() : [[0, 0], floatingRange(), [0, 0]]);

	// Rotation
	let rSpeed = $.derived(() => Array.isArray(rotationSpeed())
		? rotationSpeed()
		: [rotationSpeed(), rotationSpeed(), rotationSpeed()]);

	let rIntensity = $.derived(() => Array.isArray(rotationIntensity())
		? rotationIntensity()
		: [
			rotationIntensity(),
			rotationIntensity(),
			rotationIntensity()
		]);

	useTask((delta) => {
		now += delta;
		group.position.x = map(Math.sin(now / 4 * $.get(fSpeed)[0]) / 10, -0.1, 0.1, ...$.get(fRange)[0]) * $.get(fIntensity)[0];
		group.position.y = map(Math.sin(now / 4 * $.get(fSpeed)[1]) / 10, -0.1, 0.1, ...$.get(fRange)[1]) * $.get(fIntensity)[1];
		group.position.z = map(Math.sin(now / 4 * $.get(fSpeed)[2]) / 10, -0.1, 0.1, ...$.get(fRange)[2]) * $.get(fIntensity)[2];
		group.rotation.x = Math.cos(now / 4 * $.get(rSpeed)[0]) / 8 * $.get(rIntensity)[0];
		group.rotation.y = Math.sin(now / 4 * $.get(rSpeed)[1]) / 8 * $.get(rIntensity)[1];
		group.rotation.z = Math.sin(now / 4 * $.get(rSpeed)[2]) / 20 * $.get(rIntensity)[2];
		group.updateMatrix();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return outerGroup;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				T($$anchor, {
					get is() {
						return group;
					},
					matrixAutoUpdate: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: group }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}