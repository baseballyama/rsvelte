import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, observe, T, useStage, useTask, useThrelte } from '@threlte/core';
import { Box3, Group, Sphere, Vector3 } from 'three';
import InjectPlugin from '../InjectPlugin/InjectPlugin.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'x',
	'y',
	'z',
	'precise',
	'auto',
	'ref',
	'onalign',
	'children',
	'stage'
]);

export default function Align($$anchor, $$props) {
	$.push($$props, true);

	const { renderStage } = useThrelte();

	let x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		z = $.prop($$props, 'z', 3, 0),
		precise = $.prop($$props, 'precise', 3, false),
		auto = $.prop($$props, 'auto', 3, false),
		ref = $.prop($$props, 'ref', 15),
		stage = $.prop($$props, 'stage', 19, () => useStage('<Align>', { before: renderStage })),
		props = $.rest_props($$props, rest_excludes);

	const group = new Group();
	const innerGroup = new Group();
	const outerGroup = new Group();

	const calculate = () => {
		// return early if all axes are false
		if (x() === false && y() === false && z() === false) return;

		outerGroup.matrixWorld.identity();

		const box3 = new Box3().setFromObject(innerGroup, precise());
		const align = new Vector3();
		const sphere = new Sphere();
		const width = box3.max.x - box3.min.x;
		const height = box3.max.y - box3.min.y;
		const depth = box3.max.z - box3.min.z;

		box3.getCenter(align);
		box3.getBoundingSphere(sphere);

		const vAlign = (y() || 0) * height / 2;
		const hAlign = (x() || 0) * width / 2;
		const dAlign = (z() || 0) * depth / 2;

		outerGroup.position.set(x() === false ? 0 : -align.x + hAlign, y() === false ? 0 : -align.y + vAlign, z() === false ? 0 : -align.z + dAlign);

		$$props.onalign?.({
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
	let scheduleAligning = $.state(false);

	useTask(
		() => {
			calculate();
			$.set(scheduleAligning, false);
		},
		{ stage: stage(), running: () => $.get(scheduleAligning) }
	);

	/** Manually trigger aligning */
	const align = () => $.set(scheduleAligning, true);

	observe(() => [x(), y(), z(), precise()], () => {
		$.set(scheduleAligning, true);
	});

	const plugin = (args) => {
		if (!isInstanceOf(args.ref, 'Object3D')) return;

		observe.pre(() => [args.ref], () => {
			if (auto()) $.set(scheduleAligning, true);

			return () => {
				if (auto()) $.set(scheduleAligning, true);
			};
		});
	};

	var $$exports = { align };

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
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
				T($$anchor, {
					get is() {
						return outerGroup;
					},

					children: ($$anchor, $$slotProps) => {
						T($$anchor, {
							get is() {
								return innerGroup;
							},

							children: ($$anchor, $$slotProps) => {
								InjectPlugin($$anchor, {
									name: 'align',
									plugin,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node = $.first_child(fragment_4);

										$.snippet(node, () => $$props.children ?? $.noop, () => ({ align: () => $.set(scheduleAligning, true), ref: group }));
										$.append($$anchor, fragment_4);
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
	));

	return $.pop($$exports);
}