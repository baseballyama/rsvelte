import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { PlaneGeometry } from 'three';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'length',
	'segments',
	'ref'
]);

export default function BackdropGeometry($$anchor, $$props) {
	$.push($$props, true);

	let length = $.prop($$props, 'length', 3, 1),
		segments = $.prop($$props, 'segments', 3, 20),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const easeInExpo = (x) => {
		return +(x !== 0) * 2 ** (10 * x - 10);
	};

	const geometry = $.derived(() => {
		const geometry = new PlaneGeometry(1, 1, segments(), segments());
		const position = geometry.getAttribute('position');
		const s = segments() + 1;
		const offset = 0.5;
		let i = 0;

		for (let x = 0; x < s; x += 1) {
			for (let y = 0; y < s; y += 1) {
				const xOverSegments = x / segments();

				position.setXYZ(i, xOverSegments - offset + +(x === 0) * -1 * length(), y / segments() - offset, easeInExpo(xOverSegments));
				i += 1;
			}
		}

		position.needsUpdate = true;
		geometry.computeVertexNormals();
		geometry.rotateZ(0.5 * Math.PI);
		geometry.rotateX(-0.5 * Math.PI);

		return geometry;
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return $.get(geometry);
			}
		},
		() => rest,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}
	));

	$.pop();
}