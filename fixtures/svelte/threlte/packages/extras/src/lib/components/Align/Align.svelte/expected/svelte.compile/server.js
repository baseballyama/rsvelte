import * as $ from 'svelte/internal/server';
import { isInstanceOf, observe, T, useStage, useTask, useThrelte } from '@threlte/core';
import { Box3, Group, Sphere, Vector3 } from 'three';
import InjectPlugin from '../InjectPlugin/InjectPlugin.svelte';

export default function Align($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { renderStage } = useThrelte();

		let {
			x = 0,
			y = 0,
			z = 0,
			precise = false,
			auto = false,
			ref = void 0,
			onalign,
			children,
			stage = useStage('<Align>', { before: renderStage }),
			$$slots,
			$$events,
			...props
		} = $$props;

		const group = new Group();
		const innerGroup = new Group();
		const outerGroup = new Group();

		const calculate = () => {
			// return early if all axes are false
			if (x === false && y === false && z === false) return;

			outerGroup.matrixWorld.identity();

			const box3 = new Box3().setFromObject(innerGroup, precise);
			const align = new Vector3();
			const sphere = new Sphere();
			const width = box3.max.x - box3.min.x;
			const height = box3.max.y - box3.min.y;
			const depth = box3.max.z - box3.min.z;

			box3.getCenter(align);
			box3.getBoundingSphere(sphere);

			const vAlign = (y || 0) * height / 2;
			const hAlign = (x || 0) * width / 2;
			const dAlign = (z || 0) * depth / 2;

			outerGroup.position.set(x === false ? 0 : -align.x + hAlign, y === false ? 0 : -align.y + vAlign, z === false ? 0 : -align.z + dAlign);

			onalign?.({
				boundingBox: box3,
				center: outerGroup.position.clone(),
				boundingSphere: sphere,
				container: group,
				depth,
				depthAlignment: dAlign,
				height,
				verticalAlignment: vAlign,
				width,
				horizontalAlignment: hAlign
			});
		};

		/**
		 * We're only aligning at most *once* per frame, so even if a lot of child
		 * components request aligning, it's only done *once*.
		 */
		let scheduleAligning = false;

		useTask(
			() => {
				calculate();
				scheduleAligning = false;
			},
			{ stage, running: () => scheduleAligning }
		);

		/** Manually trigger aligning */
		const align = () => scheduleAligning = true;

		observe(() => [x, y, z, precise], () => {
			scheduleAligning = true;
		});

		const plugin = (args) => {
			if (!isInstanceOf(args.ref, 'Object3D')) return;

			observe.pre(() => [args.ref], () => {
				if (auto) scheduleAligning = true;

				return () => {
					if (auto) scheduleAligning = true;
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
							is: outerGroup,
							children: ($$renderer) => {
								T($$renderer, {
									is: innerGroup,
									children: ($$renderer) => {
										InjectPlugin($$renderer, {
											name: 'align',
											plugin,
											children: ($$renderer) => {
												children?.($$renderer, { align: () => scheduleAligning = true, ref: group });
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
		$.bind_props($$props, { ref, align });
	});
}