import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { BufferGeometry, BufferAttribute } from 'three';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'points',
	'shape',
	'shapeFunction',
	'ref',
	'children'
]);

export default function MeshLineGeometry($$anchor, $$props) {
	$.push($$props, true);

	let points = $.prop($$props, 'points', 19, () => []),
		shape = $.prop($$props, 'shape', 3, 'none'),
		shapeFn = $.prop($$props, 'shapeFunction', 3, () => 1),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const pointCount = $.derived(() => points().length);
	const { invalidate } = useThrelte();
	const positions = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 6), 3));
	const previous = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 6), 3));
	const next = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 6), 3));
	const counters = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 2), 1));
	const side = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 2), 1));
	const width = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 2), 1));
	const uv = $.derived(() => new BufferAttribute(new Float32Array($.get(pointCount) * 4), 2));
	const indices = $.derived(() => new BufferAttribute(new Uint32Array($.get(pointCount) * 6), 1));
	const shapeFunction = $.derived(() => shape() === 'taper' ? (p) => 4 * p * (1 - p) : shapeFn());
	const geometry = new BufferGeometry();

	$.user_pre_effect(() => {
		const lastIndex = $.get(pointCount) - 1 || 1;

		for (let i = 0, i2 = 0, i3 = 0; i < $.get(pointCount); (i += 1, i2 += 2, i3 += 6)) {
			$.get(counters).setX(i2, i / $.get(pointCount));
			$.get(counters).setX(i2 + 1, i / $.get(pointCount));
			$.get(side).setX(i2, 1);
			$.get(side).setX(i2 + 1, -1);

			const w = shape() === 'none' ? 1 : $.get(shapeFunction)(i / lastIndex);

			$.get(width).setX(i2, w);
			$.get(width).setX(i2 + 1, w);
			$.get(uv).setXYZW(i2, i / lastIndex, 0, i / lastIndex, 1);

			if (i < $.get(pointCount) - 1) {
				const n = i * 2;

				$.get(indices).setX(i3 + 0, n + 0);
				$.get(indices).setX(i3 + 1, n + 1);
				$.get(indices).setX(i3 + 2, n + 2);
				$.get(indices).setX(i3 + 3, n + 2);
				$.get(indices).setX(i3 + 4, n + 1);
				$.get(indices).setX(i3 + 5, n + 3);
			}
		}

		geometry.setAttribute('position', $.get(positions));
		geometry.setAttribute('previous', $.get(previous));
		geometry.setAttribute('next', $.get(next));
		geometry.setAttribute('counters', $.get(counters));
		geometry.setAttribute('side', $.get(side));
		geometry.setAttribute('width', $.get(width));
		geometry.setAttribute('uv', $.get(uv));
		geometry.setIndex($.get(indices));
		$.get(width).needsUpdate = true;
		invalidate();
	});

	$.user_pre_effect(() => {
		if (points().length === 0) return;

		let positionIndex = 0;
		let previousIndex = 0;
		let nextIndex = 0;
		const p1 = points()[0];

		$.get(previous).setXYZ(previousIndex, p1.x, p1.y, p1.z);
		previousIndex += 1;
		$.get(previous).setXYZ(previousIndex, p1.x, p1.y, p1.z);
		previousIndex += 1;

		for (let i = 0; i < $.get(pointCount); i++) {
			const p = points()[i];

			$.get(positions).setXYZ(positionIndex, p.x, p.y, p.z);
			positionIndex += 1;
			$.get(positions).setXYZ(positionIndex, p.x, p.y, p.z);
			positionIndex += 1;

			if (i < $.get(pointCount) - 1) {
				$.get(previous).setXYZ(previousIndex, p.x, p.y, p.z);
				previousIndex += 1;
				$.get(previous).setXYZ(previousIndex, p.x, p.y, p.z);
				previousIndex += 1;
			}

			if (i > 0) {
				$.get(next).setXYZ(nextIndex, p.x, p.y, p.z);
				nextIndex += 1;
				$.get(next).setXYZ(nextIndex, p.x, p.y, p.z);
				nextIndex += 1;
			}
		}

		const p2 = points()[$.get(pointCount) - 1];

		$.get(next).setXYZ(nextIndex, p2.x, p2.y, p2.z);
		nextIndex += 1;
		$.get(next).setXYZ(nextIndex, p2.x, p2.y, p2.z);
		nextIndex += 1;
		$.get(positions).needsUpdate = true;
		$.get(previous).needsUpdate = true;
		$.get(next).needsUpdate = true;
		geometry.computeBoundingSphere();
		invalidate();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return geometry;
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
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: geometry }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}