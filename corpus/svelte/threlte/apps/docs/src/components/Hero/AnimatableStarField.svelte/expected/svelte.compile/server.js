import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';
import StarField from './StarField/StarField.svelte';

export default function AnimatableStarField($$renderer, $$props) {
	let { key } = $$props;

	{
		function children($$renderer, { Transform, Declare }) {
			if (Transform) {
				$$renderer.push('<!--[-->');

				Transform($$renderer, {
					children: ($$renderer) => {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								children: ($$renderer) => {
									{
										function children($$renderer, { values }) {
											$$renderer.push(`<!---->`);

											{
												StarField($$renderer, {
													amount: values.amount,
													radius: values.radius,
													size: values.size,
													speed: values.speed,
													direction: [values.direction.x, values.direction.y, values.direction.z],
													opacity: values.opacity
												});
											}

											$$renderer.push(`<!---->`);
										}

										if (Declare) {
											$$renderer.push('<!--[-->');

											Declare($$renderer, {
												props: {
													amount: 1000,
													radius: 100,
													size: 0,
													speed: 0,
													direction: { x: 0, y: 0, z: 1 },
													opacity: 0
												},
												children,
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								},
								$$slots: { default: true }
							});

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

		SheetObject($$renderer, { key, children, $$slots: { default: true } });
	}
}