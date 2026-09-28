import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);

export default function ContainerTransform($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const objectSelection = useObjectSelection();
	const { useExtension } = useStudio();
	const transformControlsExtension = useExtension(transformControlsScope);
	const space = useSpace();
	const snapping = useSnapping();
	const { studioObjectRef, addObject, removeObject } = useStudioObjectsRegistry();
	let controls = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(controls)) return;

		const helper = $.get(controls).getHelper();

		if (!helper) return;

		const objects = [];

		helper.traverse((node) => {
			objects.push(node);
		});

		for (const object of objects) {
			addObject(object);
		}

		return () => {
			for (const object of objects) {
				removeObject(object);
			}
		};
	});

	const group = studioObjectRef();
	const center = studioObjectRef();
	const mode = $.derived(() => transformControlsExtension.state.mode);
	let centerObject = new Object3D();
	let lastPosition = new Vector3();

	$.user_effect(() => {
		if (objectSelection.selectedObjects.length === 0) return;

		// make bb with all selected objects
		const bb = new Box3().setFromObject(objectSelection.selectedObjects[0]);

		for (let i = 1; i < objectSelection.selectedObjects.length; i++) {
			bb.expandByObject(objectSelection.selectedObjects[i]);
		}

		lastPosition.copy(bb.getCenter(new Vector3()));
		centerObject.position.copy(lastPosition);
	});

	const onChange = () => {
		if ($.get(mode) === 'translate') {
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
		} else if ($.get(mode) === 'rotate') {
			// TODO: implement rotation
		} else {
			// TODO: implement scale
		}
	};

	const commitObjects = $.derived(() => [...objectSelection.selectedObjects, centerObject]);
	let initialValues = [];

	const onMouseDown = () => {
		if ($.get(mode) === 'translate') {
			initialValues = $.get(commitObjects).map((object) => object.position.clone());
		}
	};

	const { commit } = useTransactions();

	const onMouseUp = () => {
		if ($.get(commitObjects).length !== initialValues.length) return;

		if ($.get(mode) === 'translate') {
			const transactions = $.get(commitObjects).map((object, index) => {
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

	var fragment = root_1();
	var node_1 = $.first_child(fragment);

	T(node_1, {
		get is() {
			return centerObject;
		},

		get ref() {
			return center.ref;
		},

		set ref($$value) {
			center.ref = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => snapping.enabled ? snapping.translate ?? 0 : null);
		let $1 = $.derived(() => snapping.enabled ? (snapping.rotate ?? 0) * DEG2RAD : null);
		let $2 = $.derived(() => snapping.enabled ? snapping.scale ?? 0 : null);

		TransformControls(node_2, {
			get object() {
				return centerObject;
			},

			get space() {
				return space.space;
			},

			get translationSnap() {
				return $.get($0);
			},

			get rotationSnap() {
				return $.get($1);
			},

			get scaleSnap() {
				return $.get($2);
			},
			onchange: onChange,
			onmouseDown: () => {
				transformControlsExtension.setInUse(true);
				onMouseDown();
			},

			onmouseUp: () => {
				transformControlsExtension.setInUse(false);
				onMouseUp();
			},

			get mode() {
				return $.get(mode);
			},

			get controls() {
				return $.get(controls);
			},

			set controls($$value) {
				$.set(controls, $$value, true);
			},

			get group() {
				return group.ref;
			},

			set group($$value) {
				group.ref = $$value;
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}