import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import { Object3D } from 'three';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';
import { useStudio } from '../../internal/extensions.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { useTransformControls } from '../transform-controls/useTransformControls.js';
import { objectSelectionScope } from './types.js';
import { useObjectSelection } from './useObjectSelection.svelte.js';

export default function SelectRect($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { camera, scene, renderer, dom } = useThrelte();
	const { useExtension } = useStudio();
	const { addToSelection, removeFromSelection, selectObjects } = useObjectSelection();
	const transformControls = useTransformControls();
	const { setInUse } = useExtension(objectSelectionScope);
	let selectionBox = new SelectionBox(camera.current, scene);
	let selectionHelper = new SelectionHelper(renderer, 'selectBox');
	const studioObjectsRegistry = useStudioObjectsRegistry();

	$.user_pre_effect(() => {
		selectionBox.camera = $camera();
	});

	const filter = (objects) => {
		let objs = objects.filter((object) => {
			const isNotSelectable = object?.userData?.selectable === false;

			return !studioObjectsRegistry.objects.has(object) && !isNotSelectable;
		});

		return objs;
	};

	let selectionMode = 'select';
	let lastEvent;

	const onPointerDown = (event) => {
		if (transformControls.inUse) {
			// if transform controls are in use, we don't want to select objects and
			// cancel the selection.
			selectionHelper.isDown = false;

			setInUse(false);

			return;
		}

		if (event.shiftKey) {
			event.preventDefault();
			selectionMode = 'add';
		} else if (event.ctrlKey || event.metaKey) {
			event.preventDefault();
			selectionMode = 'remove';
		} else {
			selectionMode = 'select';
		}

		selectionBox.startPoint.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
		setInUse(true);
		lastEvent = event;
	};

	const onPointerMove = (event) => {
		if (transformControls.inUse) {
			// if transform controls are in use, we don't want to select objects and
			// cancel the selection.
			selectionHelper.isDown = false;

			setInUse(false);

			return;
		}

		if (!selectionHelper.isDown) return;

		selectionBox.endPoint.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);

		const allSelected = filter(selectionBox.select());

		if (selectionMode === 'add') {
			addToSelection(allSelected);
		} else if (selectionMode === 'remove') {
			removeFromSelection(allSelected);
		} else {
			selectObjects(allSelected);
		}

		lastEvent = event;
	};

	const onPointerUp = (event) => {
		if (transformControls.inUse) {
			// if transform controls are in use, we don't want to select objects and
			// cancel the selection.
			selectionHelper.isDown = false;

			setInUse(false);

			return;
		}

		if (!selectionHelper.isDown) return;

		selectionBox.endPoint.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);

		const allSelected = filter(selectionBox.select());

		if (selectionMode === 'add') {
			addToSelection(allSelected);
		} else if (selectionMode === 'remove') {
			removeFromSelection(allSelected);
		} else {
			selectObjects(allSelected);
		}

		setInUse(false);
	};

	onMount(() => {
		dom.addEventListener('pointerdown', onPointerDown);
		dom.addEventListener('pointermove', onPointerMove);
		dom.addEventListener('pointerup', onPointerUp);
		dom.style.cursor = 'crosshair';

		return () => {
			if (lastEvent) onPointerUp(lastEvent);

			dom.removeEventListener('pointerdown', onPointerDown);
			dom.removeEventListener('pointermove', onPointerMove);
			dom.removeEventListener('pointerup', onPointerUp);

			try {
				// this sometimes throws an error, but we fail silently
				const h = selectionHelper;

				if (h.element && h.element.parentElement) h.onSelectOver();
			} catch(error) {
				console.warn(error);
			}

			selectionHelper.dispose();
			dom.style.cursor = 'auto';
		};
	});

	$.pop();
	$$cleanup();
}