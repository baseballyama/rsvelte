import * as $ from 'svelte/internal/server';

import {
	BufferGeometry,
	Mesh,
	WireframeGeometry,
	BufferAttribute,
	Uniform,
	Color
} from 'three';

import { setWireframeOverride } from './material.js';
import { isInstanceOf, useParent } from '@threlte/core';

const getBarycentricCoordinates = (geometry, removeEdge) => {
	const position = geometry.getAttribute('position');
	const array = new Float32Array(position.count * 3);
	const Q = removeEdge ? 1 : 0;

	for (let i = 0, l = array.length; i < l; i += 9) {
		const even = i / 9 % 2 === 0;

		if (even) {
			array[i + 2] = 1;
			array[i + 4] = 1;
			array[i + 6] = 1;
			array[i + 8] = Q;
		} else {
			array[i + 1] = 1;
			array[i + 5] = 1;
			array[i + 6] = 1;
			array[i + 8] = Q;
		}
	}

	return new BufferAttribute(array, 3);
};

const createWireframeGeometry = (geometry, simplify) => {
	const wireframeGeometry = geometry.index ? geometry.toNonIndexed() : geometry.clone();

	if (!wireframeGeometry.getAttribute('position')) {
		wireframeGeometry.dispose();

		return undefined;
	}

	const newBarycentric = getBarycentricCoordinates(wireframeGeometry, simplify);

	wireframeGeometry.setAttribute('barycentric', newBarycentric);

	return wireframeGeometry;
};

export default function Wireframe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { simplify = false, $$slots, $$events, ...rest } = $$props;
		const parent = useParent();
		const fillOpacity = new Uniform(0);
		const strokeOpacity = new Uniform(0);
		const fillMix = new Uniform(0);
		const thickness = new Uniform(0);
		const colorBackfaces = new Uniform(false);
		const dashInvert = new Uniform(true);
		const dash = new Uniform(false);
		const dashRepeats = new Uniform(0);
		const dashLength = new Uniform(0);
		const squeeze = new Uniform(false);
		const squeezeMin = new Uniform(0);
		const squeezeMax = new Uniform(0);
		const stroke = new Uniform(new Color());
		const backfaceStroke = new Uniform(new Color());
		const fill = new Uniform(new Color());

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
		// Disallow WireframeGeometry
	});
}