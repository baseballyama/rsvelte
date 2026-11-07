import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	BufferGeometry,
	CanvasTexture,
	Float32BufferAttribute,
	Points,
	PointsMaterial,
	Texture
} from 'three';

let texture;

const getTexture = () => {
	if (typeof window === 'undefined') return;
	if (texture) return texture;

	// 1. Create the circular texture
	const canvas = document.createElement('canvas');

	const context = canvas.getContext('2d');

	if (!context) throw new Error('Could not get 2d context');

	const size = 40; // Texture size

	canvas.width = size;
	canvas.height = size;

	const lineWidth = 2;

	// Draw a circle
	context.beginPath();

	context.arc(size / 2, size / 2, size / 2 - lineWidth / 2, 0, 2 * Math.PI, false);
	context.strokeStyle = 'white';
	context.lineWidth = lineWidth;
	context.stroke();

	// Create texture from canvas
	texture = new CanvasTexture(canvas);

	return texture;
};

const material = new PointsMaterial({
	map: getTexture(),
	depthTest: false,
	depthWrite: false,
	sizeAttenuation: false,
	size: 20,
	transparent: true
});

const geometry = new BufferGeometry();

geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));

export default function GroupHelper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { oncreate } = $$props;
		const points = new Points(geometry, material);

		T($$renderer, {
			oncreate,
			is: points,
			userData: { ignoreOverrideMaterial: true }
		});
	});
}