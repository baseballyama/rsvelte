import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';

import {
	PlaneGeometry,
	RepeatWrapping,
	TextureLoader,
	Vector3,
	MathUtils,
	Uniform
} from 'three';

import { Water } from 'three/examples/jsm/objects/Water.js';

export default function Water_1($$anchor, $$props) {
	$.push($$props, true);

	const waterGeometry = new PlaneGeometry(10000, 10000);

	const water = new Water(waterGeometry, {
		textureWidth: 1024,
		textureHeight: 1024,
		waterNormals: new TextureLoader().load('/textures/waternormals.jpg', function (texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.needsUpdate = true;
		}),
		sunDirection: new Vector3(),
		waterColor: 0x001e0f,
		distortionScale: 1.7
	});

	water.rotation.x = -MathUtils.DEG2RAD * 90;

	const uniforms = water.material.uniforms;

	uniforms.size.value = 1000;

	useTask((delta) => {
		uniforms.size.value += delta;
	});

	T($$anchor, {
		get is() {
			return water;
		}
	});

	$.pop();
}