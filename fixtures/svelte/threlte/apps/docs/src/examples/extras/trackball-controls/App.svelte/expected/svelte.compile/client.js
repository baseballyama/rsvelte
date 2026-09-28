import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

var root = $.from_html(`<div class="svelte-1uwk2br"><!></div> <!>`, 1);

export default function App($$anchor) {
	let staticMoving = false;
	let noRotate = false;
	let rotateSpeed = 1;
	let noZoom = false;
	let zoomSpeed = 1.2;
	let noPan = false;
	let panSpeed = 0.3;
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get staticMoving() {
					return staticMoving;
				},

				get noRotate() {
					return noRotate;
				},

				get rotateSpeed() {
					return rotateSpeed;
				},

				get noZoom() {
					return noZoom;
				},

				get zoomSpeed() {
					return zoomSpeed;
				},

				get noPan() {
					return noPan;
				},

				get panSpeed() {
					return panSpeed;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Settings(node_1, {
		get staticMoving() {
			return staticMoving;
		},

		set staticMoving($$value) {
			staticMoving = $$value;
		},

		get noRotate() {
			return noRotate;
		},

		set noRotate($$value) {
			noRotate = $$value;
		},

		get rotateSpeed() {
			return rotateSpeed;
		},

		set rotateSpeed($$value) {
			rotateSpeed = $$value;
		},

		get noZoom() {
			return noZoom;
		},

		set noZoom($$value) {
			noZoom = $$value;
		},

		get zoomSpeed() {
			return zoomSpeed;
		},

		set zoomSpeed($$value) {
			zoomSpeed = $$value;
		},

		get noPan() {
			return noPan;
		},

		set noPan($$value) {
			noPan = $$value;
		},

		get panSpeed() {
			return panSpeed;
		},

		set panSpeed($$value) {
			panSpeed = $$value;
		}
	});

	$.append($$anchor, fragment);
}