import 'svelte/internal/disclose-version';

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
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'simplify']);

export default function Wireframe($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let simplify = $.prop($$props, 'simplify', 3, false),
		rest = $.rest_props($$props, rest_excludes);

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

	$.user_pre_effect(() => {
		fillOpacity.value = $$props.fillOpacity ?? 0;
	});

	$.user_pre_effect(() => {
		fillMix.value = $$props.fillMix ?? 0;
	});

	$.user_pre_effect(() => {
		strokeOpacity.value = $$props.strokeOpacity ?? 1;
	});

	$.user_pre_effect(() => {
		thickness.value = $$props.thickness ?? 1;
	});

	$.user_pre_effect(() => {
		colorBackfaces.value = $$props.colorBackfaces ?? false;
	});

	$.user_pre_effect(() => {
		dash.value = $$props.dash ?? false;
	});

	$.user_pre_effect(() => {
		dashInvert.value = $$props.dashInvert ?? true;
	});

	$.user_pre_effect(() => {
		dashRepeats.value = $$props.dashRepeats ?? 4;
	});

	$.user_pre_effect(() => {
		dashLength.value = $$props.dashLength ?? 0.5;
	});

	$.user_pre_effect(() => {
		squeeze.value = $$props.squeeze ?? false;
	});

	$.user_pre_effect(() => {
		squeezeMin.value = $$props.squeezeMin ?? 0.2;
	});

	$.user_pre_effect(() => {
		squeezeMax.value = $$props.squeezeMax ?? 1;
	});

	$.user_pre_effect(() => {
		stroke.value.set($$props.stroke ?? '#ff0000');
	});

	$.user_pre_effect(() => {
		fill.value.set($$props.fill ?? '#00ff00');
	});

	$.user_pre_effect(() => {
		backfaceStroke.value.set($$props.backfaceStroke ?? '#0000ff');
	});

	$.user_pre_effect(() => {
		const parentMesh = $parent();

		if (!isInstanceOf(parentMesh, 'Mesh')) {
			return;
		}

		if (!parentMesh.geometry) {
			console.error('Wireframe: Must be a child of a Mesh with a geometry.');

			return;
		}

		// Disallow WireframeGeometry
		if (parentMesh.geometry.type === 'WireframeGeometry') {
			console.error('Wireframe: WireframeGeometry is not supported.');

			return;
		}

		const originalGeometry = parentMesh.geometry;
		const wireframeGeometry = createWireframeGeometry(originalGeometry, simplify());

		if (!wireframeGeometry) {
			console.error('Wireframe: Geometry must have a position attribute.');

			return;
		}

		const materials = Array.isArray(parentMesh.material) ? parentMesh.material : [parentMesh.material];

		const restoreMaterials = materials.map((material) => setWireframeOverride(material, {
			fillOpacity,
			strokeOpacity,
			fillMix,
			thickness,
			colorBackfaces,
			dashInvert,
			dash,
			dashRepeats,
			dashLength,
			squeeze,
			squeezeMin,
			squeezeMax,
			stroke,
			backfaceStroke,
			fill
		}));

		parentMesh.geometry = wireframeGeometry;

		return () => {
			restoreMaterials.forEach((restoreMaterial) => restoreMaterial());

			if (parentMesh.geometry === wireframeGeometry) {
				parentMesh.geometry = originalGeometry;
			}

			wireframeGeometry.dispose();
		};
	});

	$.pop();
	$$cleanup();
}