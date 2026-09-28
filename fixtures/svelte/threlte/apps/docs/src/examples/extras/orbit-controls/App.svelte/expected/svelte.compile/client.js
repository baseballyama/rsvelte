import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

var root = $.from_html(`<div class="svelte-11azw0p"><!></div> <!>`, 1);

export default function App($$anchor) {
	let autoRotate = $.state(false);
	let enableDamping = $.state(true);
	let rotateSpeed = $.state(1);
	let zoomToCursor = $.state(false);
	let zoomSpeed = $.state(1);
	let minPolarAngle = $.state(0);
	let maxPolarAngle = $.state($.proxy(Math.PI));
	let enableZoom = $.state(true);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get enableDamping() {
					return $.get(enableDamping);
				},

				get autoRotate() {
					return $.get(autoRotate);
				},

				get rotateSpeed() {
					return $.get(rotateSpeed);
				},

				get zoomToCursor() {
					return $.get(zoomToCursor);
				},

				get zoomSpeed() {
					return $.get(zoomSpeed);
				},

				get minPolarAngle() {
					return $.get(minPolarAngle);
				},

				get maxPolarAngle() {
					return $.get(maxPolarAngle);
				},

				get enableZoom() {
					return $.get(enableZoom);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Settings(node_1, {
		get enableDamping() {
			return $.get(enableDamping);
		},

		set enableDamping($$value) {
			$.set(enableDamping, $$value, true);
		},

		get autoRotate() {
			return $.get(autoRotate);
		},

		set autoRotate($$value) {
			$.set(autoRotate, $$value, true);
		},

		get rotateSpeed() {
			return $.get(rotateSpeed);
		},

		set rotateSpeed($$value) {
			$.set(rotateSpeed, $$value, true);
		},

		get zoomToCursor() {
			return $.get(zoomToCursor);
		},

		set zoomToCursor($$value) {
			$.set(zoomToCursor, $$value, true);
		},

		get zoomSpeed() {
			return $.get(zoomSpeed);
		},

		set zoomSpeed($$value) {
			$.set(zoomSpeed, $$value, true);
		},

		get minPolarAngle() {
			return $.get(minPolarAngle);
		},

		set minPolarAngle($$value) {
			$.set(minPolarAngle, $$value, true);
		},

		get maxPolarAngle() {
			return $.get(maxPolarAngle);
		},

		set maxPolarAngle($$value) {
			$.set(maxPolarAngle, $$value, true);
		},

		get enableZoom() {
			return $.get(enableZoom);
		},

		set enableZoom($$value) {
			$.set(enableZoom, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}