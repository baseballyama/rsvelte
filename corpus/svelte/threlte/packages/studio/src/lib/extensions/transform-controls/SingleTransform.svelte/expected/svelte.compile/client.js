import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function SingleTransform($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const { useExtension } = useStudio();
	const transformControlsExtension = useExtension(transformControlsScope);
	const objectSelection = useObjectSelection();
	const space = useSpace();
	const snapping = useSnapping();
	const mode = $.derived(() => transformControlsExtension.state.mode);
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

	onDestroy(() => {
		transformControlsExtension.setInUse(false);
	});

	const { commit, buildTransaction } = useTransactions();
	const object = $.derived(() => objectSelection.selectedObjects[0]);
	let usedModes = new Set();
	let listenToModes = $.state(false);

	$.user_effect(() => {
		if (!$.get(listenToModes)) return;

		usedModes.add($.get(mode));
	});

	let initialValue = {
		position: new Vector3(),
		rotation: new Euler(),
		scale: new Vector3()
	};

	const onMouseDown = () => {
		$.set(listenToModes, true);
		initialValue.position.copy($.get(object).position);
		initialValue.rotation.copy($.get(object).rotation);
		initialValue.scale.copy($.get(object).scale);
	};

	const onMouseUp = () => {
		$.set(listenToModes, false);

		if (!initialValue) return;

		const value = {
			position: $.get(object).position.clone(),
			rotation: $.get(object).rotation.clone(),
			scale: $.get(object).scale.clone()
		};

		const props = Object.keys(value).filter((key) => {
			if (usedModes.has('translate') && key === 'position') return true;
			if (usedModes.has('rotate') && key === 'rotation') return true;
			if (usedModes.has('scale') && key === 'scale') return true;

			return false;
		});

		$.get(object).position.copy(initialValue.position);
		$.get(object).rotation.copy(initialValue.rotation);
		$.get(object).scale.copy(initialValue.scale);

		const transactions = props.map((prop) => {
			return buildTransaction({
				object: $.get(object),
				propertyPath: prop,
				value: value[prop]
			});
		});

		commit(transactions);
	};

	{
		let $0 = $.derived(() => snapping.enabled ? snapping.translate ?? 0 : null);
		let $1 = $.derived(() => snapping.enabled ? (snapping.rotate ?? 0) * DEG2RAD : null);
		let $2 = $.derived(() => snapping.enabled ? snapping.scale ?? 0 : null);

		TransformControls($$anchor, {
			get object() {
				return $.get(object);
			},

			get mode() {
				return $.get(mode);
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

			onmouseDown: () => {
				transformControlsExtension.setInUse(true);
				onMouseDown();
			},

			onmouseUp: () => {
				transformControlsExtension.setInUse(false);
				onMouseUp();
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

	$.pop();
}