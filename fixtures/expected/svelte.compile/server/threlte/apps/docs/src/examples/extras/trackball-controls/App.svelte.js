import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

export default function App($$renderer) {
	let staticMoving = false;
	let noRotate = false;
	let rotateSpeed = 1;
	let noZoom = false;
	let zoomSpeed = 1.2;
	let noPan = false;
	let panSpeed = 0.3;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1uwk2br">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, {
					staticMoving,
					noRotate,
					rotateSpeed,
					noZoom,
					zoomSpeed,
					noPan,
					panSpeed
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Settings($$renderer, {
			get staticMoving() {
				return staticMoving;
			},

			set staticMoving($$value) {
				staticMoving = $$value;
				$$settled = false;
			},

			get noRotate() {
				return noRotate;
			},

			set noRotate($$value) {
				noRotate = $$value;
				$$settled = false;
			},

			get rotateSpeed() {
				return rotateSpeed;
			},

			set rotateSpeed($$value) {
				rotateSpeed = $$value;
				$$settled = false;
			},

			get noZoom() {
				return noZoom;
			},

			set noZoom($$value) {
				noZoom = $$value;
				$$settled = false;
			},

			get zoomSpeed() {
				return zoomSpeed;
			},

			set zoomSpeed($$value) {
				zoomSpeed = $$value;
				$$settled = false;
			},

			get noPan() {
				return noPan;
			},

			set noPan($$value) {
				noPan = $$value;
				$$settled = false;
			},

			get panSpeed() {
				return panSpeed;
			},

			set panSpeed($$value) {
				panSpeed = $$value;
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