import * as $ from 'svelte/internal/server';
import { T, observe } from '@threlte/core';
import { TransformControls } from '@threlte/extras';
import { onMount } from 'svelte';
import { Group } from 'three';
import { RAD2DEG } from 'three/src/math/MathUtils.js';
import { useStudio } from '../../studio/useStudio.js';
import { types } from '../../theatre.js';
import { getDefaultTransformer } from '../transfomers/getDefaultTransformer.js';
import { useSheet } from '../useSheet.js';

export default function Transform($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			label,
			key,
			mode = 'translate',
			space,
			translationSnap,
			rotationSnap,
			scaleSnap,
			children
		} = $$props;

		const { sheetObject, addProps, removeProps } = useSheet();
		let controls = undefined;
		const group = new Group();
		const positionTransformer = getDefaultTransformer(group, 'position', 'position');
		const rotationTransformer = getDefaultTransformer(group, 'rotation', 'rotation');
		const scaleTransformer = getDefaultTransformer(group, 'scale', 'scale');

		const initTransform = () => {
			const positionProp = positionTransformer.transform(group.position);
			const rotationProp = rotationTransformer.transform(group.rotation);
			const scaleProp = scaleTransformer.transform(group.scale);

			if (key) {
				addProps({
					[key]: types.compound(
						{
							position: positionProp,
							rotation: rotationProp,
							scale: scaleProp
						},
						{ label: label ?? key }
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

				if (key) {
					if (!values[key]) return;

					object = values[key];
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
				removeProps(key ? [key] : ['position', 'rotation', 'scale']);
			};
		});

		const studio = useStudio();
		let scrub;
		let isSelected = false;

		observe.pre(() => [studio], ([studio]) => {
			return studio?.onSelectionChange((selection) => {
				if (!$.store_get($$store_subs ??= {}, '$sheetObject', sheetObject)) return;

				isSelected = selection.includes($.store_get($$store_subs ??= {}, '$sheetObject', sheetObject));
			});
		});

		const onMouseDown = () => {
			if (!studio.current) return;
			if (scrub) return;

			scrub = $.store_get($$store_subs ??= {}, '$studio', studio)?.scrub();
		};

		const onChange = () => {
			if (!scrub) return;

			scrub.capture((api) => {
				if (!$.store_get($$store_subs ??= {}, '$sheetObject', sheetObject)) return;

				const baseTarget = key
					? $.store_get($$store_subs ??= {}, '$sheetObject', sheetObject).props[key]
					: $.store_get($$store_subs ??= {}, '$sheetObject', sheetObject).props;

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
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, {
				is: groupRef,
				children: ($$renderer) => {
					if (isSelected) {
						$$renderer.push('<!--[0-->');

						TransformControls($$renderer, {
							object: groupRef,
							mode,
							space,
							onmouseDown: onMouseDown,
							onobjectChange: onChange,
							onmouseUp: onMouseUp,
							get controls() {
								return controls;
							},

							set controls($$value) {
								controls = $$value;
								$$settled = false;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}