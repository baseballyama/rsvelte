import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';

export default function AxesHelper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { studioObjectRef } = useStudioObjectsRegistry();
		let axesHelper = studioObjectRef();

		let {
			length = 1,
			width = 0.2,
			colors = ['red', 'green', 'blue'],
			opacity = 1,
			overlay = false
		} = $$props;

		const lineGeometry = new LineGeometry();

		const lineMaterial = new LineMaterial({
			linewidth: width / 100,
			vertexColors: true,
			transparent: opacity < 1,
			opacity,
			...overlay ? { depthTest: false, depthWrite: false } : {}
		});

		const line2 = new Line2(lineGeometry, lineMaterial);
		const color = new THREE.Color();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, {
				userData: { ignoreOverrideMaterial: true },
				is: line2,
				get ref() {
					return axesHelper.ref;
				},

				set ref($$value) {
					axesHelper.ref = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}