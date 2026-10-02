import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

export default function App($$renderer) {
	let autoRotate = false;
	let enableDamping = true;
	let rotateSpeed = 1;
	let zoomToCursor = false;
	let zoomSpeed = 1;
	let minPolarAngle = 0;
	let maxPolarAngle = Math.PI;
	let enableZoom = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-11azw0p">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					enableDamping,
					autoRotate,
					rotateSpeed,
					zoomToCursor,
					zoomSpeed,
					minPolarAngle,
					maxPolarAngle,
					enableZoom
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Settings($$renderer, {
			get enableDamping() {
				return enableDamping;
			},

			set enableDamping($$value) {
				enableDamping = $$value;
				$$settled = false;
			},

			get autoRotate() {
				return autoRotate;
			},

			set autoRotate($$value) {
				autoRotate = $$value;
				$$settled = false;
			},

			get rotateSpeed() {
				return rotateSpeed;
			},

			set rotateSpeed($$value) {
				rotateSpeed = $$value;
				$$settled = false;
			},

			get zoomToCursor() {
				return zoomToCursor;
			},

			set zoomToCursor($$value) {
				zoomToCursor = $$value;
				$$settled = false;
			},

			get zoomSpeed() {
				return zoomSpeed;
			},

			set zoomSpeed($$value) {
				zoomSpeed = $$value;
				$$settled = false;
			},

			get minPolarAngle() {
				return minPolarAngle;
			},

			set minPolarAngle($$value) {
				minPolarAngle = $$value;
				$$settled = false;
			},

			get maxPolarAngle() {
				return maxPolarAngle;
			},

			set maxPolarAngle($$value) {
				maxPolarAngle = $$value;
				$$settled = false;
			},

			get enableZoom() {
				return enableZoom;
			},

			set enableZoom($$value) {
				enableZoom = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}