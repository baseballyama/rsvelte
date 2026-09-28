import * as $ from 'svelte/internal/server';
import { isInstanceOf, observe, T, useStage, useTask, useThrelte } from '@threlte/core';
import { Box3, Group } from 'three';
import InjectPlugin from '../InjectPlugin/InjectPlugin.svelte';

const _box = new Box3();

export default function Resize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { renderStage } = useThrelte();

		let {
			axis,
			auto = false,
			box = _box,
			precise,
			onresize,
			stage = useStage('<Resize>', { before: renderStage }),
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const group = new Group();
		const inner = new Group();
		const outer = new Group();

		const doResize = () => {
			outer.matrixWorld.identity();

			const { max, min } = box.setFromObject(inner, precise);
			const width = max.x - min.x;
			const height = max.y - min.y;
			const depth = max.z - min.z;

			const denominator = axis === 'x'
				? width
				: axis === 'y'
					? height
					: axis === 'z' ? depth : Math.max(width, height, depth);

			outer.scale.setScalar(1 / denominator);
			onresize?.();
		};

		let running = false;

		const scheduleResizing = () => {
			running = true;
		};

		useTask(
			() => {
				doResize();
				stop();
			},
			{ stage, running: () => running }
		);

		/** Manually trigger resizing */
		const resize = scheduleResizing;

		observe(() => [axis, precise], scheduleResizing);

		const plugin = (args) => {
			if (!isInstanceOf(args.ref, 'Object3D')) return;

			observe.pre(() => [args.ref], () => {
				if (auto) scheduleResizing();

				return () => {
					if (auto) scheduleResizing();
				};
			});
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
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
						T($$renderer, {
							is: outer,
							children: ($$renderer) => {
								T($$renderer, {
									is: inner,
									children: ($$renderer) => {
										InjectPlugin($$renderer, {
											name: 'resize',
											plugin,
											children: ($$renderer) => {
												children?.($$renderer, { ref: group, resize: scheduleResizing });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
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
		$.bind_props($$props, { ref, resize });
	});
}