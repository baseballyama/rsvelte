import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LOD } from 'three';
import { T, injectPlugin, isInstanceOf, observe, useParent } from '@threlte/core';
import { onDestroy, untrack } from 'svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);

export default function Detailed($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const lod = new LOD();

	injectPlugin('detailed', (args) => {
		const parent = useParent();

		if (parent.current !== lod) return;

		let previousRef;
		let previousDistance = args.props.distance;
		let previousHysteresis = args.props.hysteresis;
		const ref = $.derived(() => isInstanceOf(args.ref, 'Object3D') ? args.ref : undefined);
		const distance = $.derived(() => args.props.distance ?? 0);
		const hysteresis = $.derived(() => args.props.hysteresis ?? 0);

		const addLevel = (ref, distance, hysteresis) => {
			lod.addLevel(ref, distance, hysteresis);
		};

		const removeLevel = (ref) => {
			const i = lod.levels.findIndex((l) => l.object === ref);

			if (i > -1) {
				lod.levels.splice(i, 1);
			}
		};

		const mutateLevel = (ref, distance, hysteresis) => {
			untrack(() => {
				const level = lod.levels.find((l) => l.object === ref);

				if (!level) return;

				level.distance = distance;
				level.hysteresis = hysteresis;
			});
		};

		observe.pre(() => [$.get(ref), $.get(distance), $.get(hysteresis)], ([ref, distance, hysteresis]) => {
			if (ref !== previousRef) {
				// we remove the previous level
				if (previousRef) removeLevel(previousRef);

				// add the new level
				if (ref) addLevel(ref, distance, hysteresis);

				// and update the previous ref
				previousRef = ref;
			}

			if (ref && (distance !== previousDistance || hysteresis !== previousHysteresis)) {
				mutateLevel(ref, distance, hysteresis);
				previousDistance = distance;
				previousHysteresis = hysteresis;
			}
		});

		onDestroy(() => {
			if ($.get(ref)) removeLevel($.get(ref));
		});

		return { pluginProps: ['distance', 'hysteresis'] };
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return lod;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: lod }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}