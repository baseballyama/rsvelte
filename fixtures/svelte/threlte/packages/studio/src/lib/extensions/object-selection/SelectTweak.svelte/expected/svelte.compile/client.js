import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import * as THREE from 'three';
import { Raycaster } from 'three';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { useObjectSelection } from './useObjectSelection.svelte.js';

export default function SelectTweak($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const raycaster = new Raycaster();
	const { clearSelection, selectObjects, toggleSelection } = useObjectSelection();
	const studioObjectsRegistry = useStudioObjectsRegistry();
	const { camera, scene, dom, size } = useThrelte();
	const down = new THREE.Vector2();
	const up = new THREE.Vector2();
	const pointer = new THREE.Vector2();

	const recordDown = (event) => {
		down.set(event.clientX, event.clientY);
	};

	const raycast = (event) => {
		// If the mouse moved more than 2 pixels, don't consider it a click
		if (down.sub(up.set(event.clientX, event.clientY)).length() > 2) {
			return;
		}

		// Calculate pointer position in normalized device coordinates
		pointer.x = event.clientX / $size().width * 2 - 1;

		pointer.y = -(event.clientY / $size().height * 2) + 1;

		// Update the picking ray with the camera and pointer position
		raycaster.setFromCamera(pointer, camera.current);

		let hits = raycaster.intersectObject(scene, true);
		let hit = hits.shift();

		const isOrIsChildOfStudioObject = (object) => {
			if (studioObjectsRegistry.objects.has(object)) return true;
			if (object.parent) return isOrIsChildOfStudioObject(object.parent);

			return false;
		};

		const isScene = (object) => {
			return object.isScene;
		};

		while (hit && (isOrIsChildOfStudioObject(hit.object) || isScene(hit.object))) {
			hit = hits.shift();
		}

		if (hit?.object?.userData?.selectable === false) {
			hit = undefined;
		}

		if (event.shiftKey) {
			if (!hit || !hit.object) return;

			toggleSelection([hit.object]);
		} else {
			if (!hit || !hit.object) {
				clearSelection();
			} else {
				selectObjects([hit.object]);
			}
		}
	};

	onMount(() => {
		dom.addEventListener('pointerdown', recordDown);
		dom.addEventListener('pointerup', raycast);

		return () => {
			dom.removeEventListener('pointerdown', recordDown);
			dom.removeEventListener('pointerup', raycast);
		};
	});

	$.pop();
	$$cleanup();
}