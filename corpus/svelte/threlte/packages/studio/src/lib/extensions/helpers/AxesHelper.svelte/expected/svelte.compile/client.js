import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';

export default function AxesHelper($$anchor, $$props) {
	$.push($$props, true);

	const { studioObjectRef } = useStudioObjectsRegistry();
	let axesHelper = $.proxy(studioObjectRef());

	let length = $.prop($$props, 'length', 3, 1),
		width = $.prop($$props, 'width', 3, 0.2),
		colors = $.prop($$props, 'colors', 19, () => ['red', 'green', 'blue']),
		opacity = $.prop($$props, 'opacity', 3, 1),
		overlay = $.prop($$props, 'overlay', 3, false);

	const lineGeometry = new LineGeometry();

	const lineMaterial = $.proxy(new LineMaterial({
		linewidth: width() / 100,
		vertexColors: true,
		transparent: opacity() < 1,
		opacity: opacity(),
		...overlay() ? { depthTest: false, depthWrite: false } : {}
	}));

	const line2 = new Line2(lineGeometry, lineMaterial);
	const color = new THREE.Color();

	$.user_pre_effect(() => {
		const positions = new Float32Array(27);

		positions[3] = length();
		positions[13] = length();
		positions[23] = length();
		lineGeometry.setPositions(positions);
		line2.computeLineDistances();
	});

	$.user_pre_effect(() => {
		lineMaterial.linewidth = width() / 100;
	});

	$.user_pre_effect(() => {
		const colorArray = new Float32Array(27);

		colors().forEach((axis, i) => {
			color.set(axis);

			for (let j = i * 9; j < i * 9 + 9; j += 3) {
				colorArray[j + 0] = color.r;
				colorArray[j + 1] = color.g;
				colorArray[j + 2] = color.b;
			}
		});

		lineGeometry.setColors(colorArray);
	});

	T($$anchor, {
		userData: { ignoreOverrideMaterial: true },
		get is() {
			return line2;
		},

		get ref() {
			return axesHelper.ref;
		},

		set ref($$value) {
			axesHelper.ref = $$value;
		}
	});

	$.pop();
}