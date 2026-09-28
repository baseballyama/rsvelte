import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { View } from '@threlte/extras';
import Scene from './Scene.svelte';
import * as THREE from 'three';

var root = $.from_html(`<div id="item" class="m-4 inline-block p-4 shadow-md svelte-1hpyy2g"><div class="h-[200px] w-[200px] svelte-1hpyy2g"></div> <div class="mt-2 text-[#888] svelte-1hpyy2g"></div></div>`);
var root_1 = $.from_html(`<div id="container" class="bg-white svelte-1hpyy2g"><div id="content" class="relative z-1 h-full overflow-y-scroll svelte-1hpyy2g"></div> <div id="canvas" class="absolute top-0 h-full"><!></div></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => items, $.index, ($$anchor, item, i) => {
		var div_2 = root();
		var div_3 = $.child(div_2);

		$.bind_this(div_3, ($$value, item) => (item.dom = $$value), (item) => item?.dom, () => [$.get(item)]);

		var div_4 = $.sibling(div_3, 2);

		div_4.textContent = `Scene ${i + 1}`;
		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var node = $.child(div_5);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
				View($$anchor, {
					get dom() {
						return $.get(item).dom;
					},

					children: ($$anchor, $$slotProps) => {
						Scene($$anchor, $.spread_props(() => $.get(item)));
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}