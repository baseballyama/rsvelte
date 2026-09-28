import * as $ from 'svelte/internal/server';
import { TransformControls } from '@threlte/extras';
import { onDestroy } from 'svelte';
import { Euler, Vector3, Object3D } from 'three';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useSnapping } from '../snapping/useSnapping.svelte.js';
import { useSpace } from '../space/useSpace.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { useTransactions } from '../transactions/useTransactions.js';
import { transformControlsScope } from './types.js';

export default function SingleTransform($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { useExtension } = useStudio();
		const transformControlsExtension = useExtension(transformControlsScope);
		const objectSelection = useObjectSelection();
		const space = useSpace();
		const snapping = useSnapping();
		const mode = $.derived(() => transformControlsExtension.state.mode);
		const { studioObjectRef, addObject, removeObject } = useStudioObjectsRegistry();
		let controls = void 0;
		const group = studioObjectRef();

		onDestroy(() => {
			transformControlsExtension.setInUse(false);
		});

		const { commit, buildTransaction } = useTransactions();
		const object = $.derived(() => objectSelection.selectedObjects[0]);
		let usedModes = new Set();
		let listenToModes = false;

		let initialValue = {
			position: new Vector3(),
			rotation: new Euler(),
			scale: new Vector3()
		};

		const onMouseDown = () => {
			listenToModes = true;
			initialValue.position.copy(object().position);
			initialValue.rotation.copy(object().rotation);
			initialValue.scale.copy(object().scale);
		};

		const onMouseUp = () => {
			listenToModes = false;

			if (!initialValue) return;

			const value = {
				position: object().position.clone(),
				rotation: object().rotation.clone(),
				scale: object().scale.clone()
			};

			const props = Object.keys(value).filter((key) => {
				if (usedModes.has('translate') && key === 'position') return true;
				if (usedModes.has('rotate') && key === 'rotation') return true;
				if (usedModes.has('scale') && key === 'scale') return true;

				return false;
			});

			object().position.copy(initialValue.position);
			object().rotation.copy(initialValue.rotation);
			object().scale.copy(initialValue.scale);

			const transactions = props.map((prop) => {
				return buildTransaction({ object: object(), propertyPath: prop, value: value[prop] });
			});

			commit(transactions);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TransformControls($$renderer, {
				object: object(),
				mode: mode(),
				space: space.space,
				translationSnap: snapping.enabled ? snapping.translate ?? 0 : null,
				rotationSnap: snapping.enabled ? (snapping.rotate ?? 0) * DEG2RAD : null,
				scaleSnap: snapping.enabled ? snapping.scale ?? 0 : null,
				onmouseDown: () => {
					transformControlsExtension.setInUse(true);
					onMouseDown();
				},

				onmouseUp: () => {
					transformControlsExtension.setInUse(false);
					onMouseUp();
				},

				get controls() {
					return controls;
				},

				set controls($$value) {
					controls = $$value;
					$$settled = false;
				},

				get group() {
					return group.ref;
				},

				set group($$value) {
					group.ref = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}