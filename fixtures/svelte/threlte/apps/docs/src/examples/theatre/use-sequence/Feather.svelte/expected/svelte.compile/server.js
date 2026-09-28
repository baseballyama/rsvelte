import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { GLTF, interactivity } from '@threlte/extras';
import { SheetObject, useSequence } from '@threlte/theatre';

export default function Feather($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		interactivity();

		const { play, pause, position, length } = useSequence();
		let baseline = void 0;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				onpointerenter: pause,
				onpointerleave: () => {
					play();
					baseline = undefined;
				},

				onpointerdown: (event) => {
					baseline = event.intersections[0]?.point.y;
				},

				onpointermove: (event) => {
					if (baseline) {
						const current = event.intersections[0]?.point.y ?? 0;
						const progress = (baseline - current) / 2;

						$.store_set(position, $.store_get($$store_subs ??= {}, '$position', position) + progress * $.store_get($$store_subs ??= {}, '$length', length));
						baseline = current;
					}
				},
				onpointerup: () => baseline = undefined,
				children: ($$renderer) => {
					{
						function children($$renderer, { Transform }) {
							if (Transform) {
								$$renderer.push('<!--[-->');

								Transform($$renderer, {
									children: ($$renderer) => {
										GLTF($$renderer, { url: '/models/feather.glb' });
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						SheetObject($$renderer, { key: 'Feather', children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}