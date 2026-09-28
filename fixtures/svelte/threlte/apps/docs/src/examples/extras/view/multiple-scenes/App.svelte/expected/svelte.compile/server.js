import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { View } from '@threlte/extras';
import Scene from './Scene.svelte';
import * as THREE from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [];

		const geometries = [
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.SphereGeometry(0.5, 12, 8),
			new THREE.DodecahedronGeometry(0.5),
			new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
		];

		for (let i = 0; i < 40; i++) {
			// add one random mesh to each scene
			const geometry = geometries[geometries.length * Math.random() | 0];

			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color().setHSL(Math.random(), 1, 0.75, THREE.SRGBColorSpace),
				roughness: 0.5,
				metalness: 0,
				flatShading: true
			});

			items.push({ dom: undefined, geometry, material });
		}

		$$renderer.push(`<div id="container" class="bg-white svelte-1hpyy2g"><div id="content" class="relative z-1 h-full overflow-y-scroll svelte-1hpyy2g"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div id="item" class="m-4 inline-block p-4 shadow-md svelte-1hpyy2g"><div class="h-[200px] w-[200px] svelte-1hpyy2g"></div> <div class="mt-2 text-[#888] svelte-1hpyy2g">Scene ${$.escape(i + 1)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div id="canvas" class="absolute top-0 h-full">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(items);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];

					View($$renderer, {
						dom: item.dom,
						children: ($$renderer) => {
							Scene($$renderer, $.spread_props([item]));
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}