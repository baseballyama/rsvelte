import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, observe } from '@threlte/core';
import { TransformControls } from '@threlte/extras';
import { onMount } from 'svelte';
import { Group } from 'three';
import { RAD2DEG } from 'three/src/math/MathUtils.js';
import { useStudio } from '../../studio/useStudio.js';
import { types } from '../../theatre.js';
import { getDefaultTransformer } from '../transfomers/getDefaultTransformer.js';
import { useSheet } from '../useSheet.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Transform($$anchor, $$props) {
	$.push($$props, true);

	const $sheetObject = () => $.store_get(sheetObject, '$sheetObject', $$stores);
	const $studio = () => $.store_get(studio, '$studio', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let mode = $.prop($$props, 'mode', 3, 'translate');
	const { sheetObject, addProps, removeProps } = useSheet();
	let controls = $.state(undefined);

	$.user_pre_effect(() => {
		if ($.get(controls)) {
			if ($$props.translationSnap) {
				$.get(controls).setTranslationSnap($$props.translationSnap);
			} else {
				$.get(controls).setTranslationSnap(null);
			}

			if ($$props.rotationSnap) {
				$.get(controls).setRotationSnap($$props.rotationSnap);
			} else {
				$.get(controls).setRotationSnap(null);
			}

			if ($$props.scaleSnap) {
				$.get(controls).setScaleSnap($$props.scaleSnap);
			} else {
				$.get(controls).setScaleSnap(null);
			}
		}
	});

	const group = new Group();
	const positionTransformer = getDefaultTransformer(group, 'position', 'position');
	const rotationTransformer = getDefaultTransformer(group, 'rotation', 'rotation');
	const scaleTransformer = getDefaultTransformer(group, 'scale', 'scale');

	const initTransform = () => {
		const positionProp = positionTransformer.transform(group.position);
		const rotationProp = rotationTransformer.transform(group.rotation);
		const scaleProp = scaleTransformer.transform(group.scale);

		if ($$props.key) {
			addProps({
				[$$props.key]: types.compound(
					{
						position: positionProp,
						rotation: rotationProp,
						scale: scaleProp
					},
					{ label: $$props.label ?? $$props.key }
				)
			});
		} else {
			addProps({
				position: positionProp,
				rotation: rotationProp,
				scale: scaleProp
			});
		}
	};

	observe.pre(() => [sheetObject], ([sheetObject]) => {
		return sheetObject?.onValuesChange((values) => {
			let object = values;

			if ($$props.key) {
				if (!values[$$props.key]) return;

				object = values[$$props.key];
			} else {
				if (!values.position || !values.rotation || !values.scale) return;
			}

			// sanity check
			if (!object) return;

			positionTransformer.apply(group, 'position', object.position);
			rotationTransformer.apply(group, 'rotation', object.rotation);
			scaleTransformer.apply(group, 'scale', object.scale);
		});
	});

	onMount(() => {
		initTransform();

		return () => {
			removeProps($$props.key ? [$$props.key] : ['position', 'rotation', 'scale']);
		};
	});

	const studio = useStudio();
	let scrub;
	let isSelected = $.state(false);

	observe.pre(() => [studio], ([studio]) => {
		return studio?.onSelectionChange((selection) => {
			if (!$sheetObject()) return;

			$.set(isSelected, selection.includes($sheetObject()), true);
		});
	});

	const onMouseDown = () => {
		if (!studio.current) return;
		if (scrub) return;

		scrub = $studio()?.scrub();
	};

	const onChange = () => {
		if (!scrub) return;

		scrub.capture((api) => {
			if (!$sheetObject()) return;

			const baseTarget = $$props.key
				? $sheetObject().props[$$props.key]
				: $sheetObject().props;

			api.set(baseTarget.position, { ...group.position });

			api.set(baseTarget.rotation, {
				x: group.rotation.x * RAD2DEG,
				y: group.rotation.y * RAD2DEG,
				z: group.rotation.z * RAD2DEG
			});

			api.set(baseTarget.scale, { ...group.scale });
		});
	};

	const onMouseUp = () => {
		if (!scrub) return;

		scrub.commit();
		scrub = undefined;
	};

	const groupRef = group;

	T($$anchor, {
		get is() {
			return groupRef;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					TransformControls($$anchor, {
						get object() {
							return groupRef;
						},

						get mode() {
							return mode();
						},

						get space() {
							return $$props.space;
						},
						onmouseDown: onMouseDown,
						onobjectChange: onChange,
						onmouseUp: onMouseUp,
						get controls() {
							return $.get(controls);
						},

						set controls($$value) {
							$.set(controls, $$value, true);
						}
					});
				};

				$.if(node, ($$render) => {
					if ($.get(isSelected)) $$render(consequent);
				});
			}

			var node_1 = $.sibling(node, 2);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}