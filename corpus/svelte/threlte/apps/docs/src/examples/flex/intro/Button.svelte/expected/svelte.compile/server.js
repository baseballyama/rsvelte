import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { RoundedBoxGeometry, useCursor } from '@threlte/extras';
import { Box } from '@threlte/flex';
import Label from './Label.svelte';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { class: _class, z = 0, text = '', order, onClick } = $$props;
		const { hovering, onPointerEnter, onPointerLeave } = useCursor();

		{
			function children($$renderer, { width, height }) {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.z': z,
						onclick: (event) => {
							event.stopPropagation();
							onClick();
						},
						onpointerenter: onPointerEnter,
						onpointerleave: onPointerLeave,
						children: ($$renderer) => {
							RoundedBoxGeometry($$renderer, { args: [width, height, 10], radius: 5 });
							$$renderer.push(`<!----> `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshBasicMaterial($$renderer, {
									color: $.store_get($$store_subs ??= {}, '$hovering', hovering) ? '#9D9FA3' : '#404550'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);
							Label($$renderer, { z: 5.1, fontSize: 'xl', text });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Box($$renderer, { class: _class, order, children, $$slots: { default: true } });
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}