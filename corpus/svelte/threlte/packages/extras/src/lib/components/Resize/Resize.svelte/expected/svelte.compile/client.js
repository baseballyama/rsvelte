import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, observe, T, useStage, useTask, useThrelte } from '@threlte/core';
import { Box3, Group } from 'three';
import InjectPlugin from '../InjectPlugin/InjectPlugin.svelte';

const _box = new Box3();

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'axis',
	'auto',
	'box',
	'precise',
	'onresize',
	'stage',
	'ref',
	'children'
]);

export default function Resize($$anchor, $$props) {
	$.push($$props, true);

	const { renderStage } = useThrelte();

	let auto = $.prop($$props, 'auto', 3, false),
		box = $.prop($$props, 'box', 3, _box),
		stage = $.prop($$props, 'stage', 19, () => useStage('<Resize>', { before: renderStage })),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const group = new Group();
	const inner = new Group();
	const outer = new Group();

	const doResize = () => {
		outer.matrixWorld.identity();

		const { max, min } = box().setFromObject(inner, $$props.precise);
		const width = max.x - min.x;
		const height = max.y - min.y;
		const depth = max.z - min.z;

		const denominator = $$props.axis === 'x'
			? width
			: $$props.axis === 'y'
				? height
				: $$props.axis === 'z' ? depth : Math.max(width, height, depth);

		outer.scale.setScalar(1 / denominator);
		$$props.onresize?.();
	};

	let running = $.state(false);

	const scheduleResizing = () => {
		$.set(running, true);
	};

	useTask(
		() => {
			doResize();
			stop();
		},
		{ stage: stage(), running: () => $.get(running) }
	);

	/** Manually trigger resizing */
	const resize = scheduleResizing;

	observe(() => [$$props.axis, $$props.precise], scheduleResizing);

	const plugin = (args) => {
		if (!isInstanceOf(args.ref, 'Object3D')) return;

		observe.pre(() => [args.ref], () => {
			if (auto()) scheduleResizing();

			return () => {
				if (auto()) scheduleResizing();
			};
		});
	};

	var $$exports = { resize };

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
						return outer;
					},

					children: ($$anchor, $$slotProps) => {
						T($$anchor, {
							get is() {
								return inner;
							},

							children: ($$anchor, $$slotProps) => {
								InjectPlugin($$anchor, {
									name: 'resize',
									plugin,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node = $.first_child(fragment_4);

										$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: group, resize: scheduleResizing }));
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