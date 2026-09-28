import * as $ from 'svelte/internal/server';
import { Detailed } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ color: 0xff_00_00, distance: 0 },
			{ color: 0x00_ff_00, distance: 3 },
			{ color: 0x00_00_ff, distance: 6 }
		];

		let detailed = void 0;
		let time = 0;

		useTask((delta) => {
			time += delta;
			detailed?.position.setZ(3 * Math.sin(time));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Detailed($$renderer, {
				get ref() {
					return detailed;
				},

				set ref($$value) {
					detailed = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let { color, distance } = each_array[i];
						const detail = items.length - i - 1;

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								distance,
								children: ($$renderer) => {
									if (T.IcosahedronGeometry) {
										$$renderer.push('<!--[-->');
										T.IcosahedronGeometry($$renderer, { args: [1, detail] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { wireframe: true, color });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
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
	});
}