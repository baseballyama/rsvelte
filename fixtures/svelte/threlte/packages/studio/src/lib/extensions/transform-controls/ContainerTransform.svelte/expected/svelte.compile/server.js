import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { TransformControls } from '@threlte/extras';
import { onDestroy } from 'svelte';
import { Box3, Object3D, Vector3 } from 'three';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useSnapping } from '../snapping/useSnapping.svelte.js';
import { useSpace } from '../space/useSpace.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { transformControlsScope } from './types.js';
import { useTransactions } from '../transactions/useTransactions.js';
import { getThrelteStudioUserData } from '../../internal/getThrelteStudioUserData.js';

export default function ContainerTransform($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const objectSelection = useObjectSelection();
		const { useExtension } = useStudio();
		const transformControlsExtension = useExtension(transformControlsScope);
		const space = useSpace();
		const snapping = useSnapping();
		const { studioObjectRef, addObject, removeObject } = useStudioObjectsRegistry();
		let controls = void 0;
		const group = studioObjectRef();
		const center = studioObjectRef();
		const mode = $.derived(() => transformControlsExtension.state.mode);
		let centerObject = new Object3D();
		let lastPosition = new Vector3();

		// make bb with all selected objects
		const onChange = () => {
			if (mode() === 'translate') {
				const delta = new Vector3().subVectors(centerObject.position, lastPosition);

				for (const object of objectSelection.selectedObjects) {
					// object.position.add(delta)
					if (space.space === 'world') {
						if (!object.parent) {
							// world space is local space
							object.position.add(delta);
						} else {
							// translate in world space
							const worldPosition = new Vector3();

							object.getWorldPosition(worldPosition);
							worldPosition.add(delta);

							const localPosition = object.parent.worldToLocal(worldPosition);

							object.position.copy(localPosition);
						}
					} else {
						object.position.add(delta);
					}
				}

				lastPosition.copy(centerObject.position);
			} else if (mode() === 'rotate') {
				// TODO: implement rotation
			} else {
				// TODO: implement scale
			}
		};

		const commitObjects = $.derived(() => [...objectSelection.selectedObjects, centerObject]);
		let initialValues = [];

		const onMouseDown = () => {
			if (mode() === 'translate') {
				initialValues = commitObjects().map((object) => object.position.clone());
			}
		};

		const { commit } = useTransactions();

		const onMouseUp = () => {
			if (commitObjects().length !== initialValues.length) return;

			if (mode() === 'translate') {
				const transactions = commitObjects().map((object, index) => {
					const isCenterObject = object === centerObject;
					const userData = getThrelteStudioUserData(object);
					const initialValue = initialValues[index];
					const value = object.position.clone();

					object.position.copy(initialValue);

					return {
						object,
						read(root) {
							return root.position.clone();
						},

						write(root, data) {
							root.position.copy(data);

							if (isCenterObject) {
								// update lastPosition to enable undo/redo
								lastPosition.copy(data);
							}
						},
						value,
						sync: userData
							? {
								attributeName: [...userData.pathItems ?? [], 'position'].join('.'),
								componentIndex: userData.index,
								moduleId: userData.moduleId
							}
							: undefined
					};
				});

				commit(transactions);
			}

			initialValues = [];
		};

		onDestroy(() => {
			transformControlsExtension.setInUse(false);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, {
				is: centerObject,
				get ref() {
					return center.ref;
				},

				set ref($$value) {
					center.ref = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TransformControls($$renderer, {
				object: centerObject,
				space: space.space,
				translationSnap: snapping.enabled ? snapping.translate ?? 0 : null,
				rotationSnap: snapping.enabled ? (snapping.rotate ?? 0) * DEG2RAD : null,
				scaleSnap: snapping.enabled ? snapping.scale ?? 0 : null,
				onchange: onChange,
				onmouseDown: () => {
					transformControlsExtension.setInUse(true);
					onMouseDown();
				},

				onmouseUp: () => {
					transformControlsExtension.setInUse(false);
					onMouseUp();
				},
				mode: mode(),
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

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}