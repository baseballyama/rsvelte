import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { GLTF, interactivity } from '@threlte/extras';
import { SheetObject, useSequence } from '@threlte/theatre';

export default function Feather($$anchor, $$props) {
	$.push($$props, true);

	const $position = () => $.store_get(position, '$position', $$stores);
	const $length = () => $.store_get(length, '$length', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	interactivity();

	const { play, pause, position, length } = useSequence();
	let baseline = $.state(void 0);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get onpointerenter() {
				return pause;
			},

			onpointerleave: () => {
				play();
				$.set(baseline, undefined);
			},

			onpointerdown: (event) => {
				$.set(baseline, event.intersections[0]?.point.y, true);
			},

			onpointermove: (event) => {
				if ($.get(baseline)) {
					const current = event.intersections[0]?.point.y ?? 0;
					const progress = ($.get(baseline) - current) / 2;

					$.store_set(position, $position() + progress * $length());
					$.set(baseline, current, true);
				}
			},
			onpointerup: () => $.set(baseline, undefined),
			children: ($$anchor, $$slotProps) => {
				{
					const children = ($$anchor, $$arg0) => {
						let Transform = () => ($$arg0?.()).Transform;
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, Transform, ($$anchor, Transform_1) => {
							Transform_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									GLTF($$anchor, { url: '/models/feather.glb' });
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					SheetObject($$anchor, { key: 'Feather', children, $$slots: { default: true } });
				}
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}