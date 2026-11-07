import * as $ from 'svelte/internal/server';
import { LOD } from 'three';
import { T, injectPlugin, isInstanceOf, observe, useParent } from '@threlte/core';
import { onDestroy, untrack } from 'svelte';

export default function Detailed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = void 0, children, $$slots, $$events, ...props } = $$props;
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

			observe.pre(() => [ref(), distance(), hysteresis()], ([ref, distance, hysteresis]) => {
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
				if (ref()) removeLevel(ref());
			});

			return { pluginProps: ['distance', 'hysteresis'] };
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: lod },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: lod });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}