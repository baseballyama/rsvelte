import * as $ from 'svelte/internal/server';
import { RatingGroup } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		RatingGroup($$renderer, {
			count: 5,
			defaultValue: 3,
			children: ($$renderer) => {
				if (RatingGroup.Control) {
					$$renderer.push('<!--[-->');

					RatingGroup.Control($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, ratingGroup) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(ratingGroup().items);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let index = each_array[$$index];

										if (RatingGroup.Item) {
											$$renderer.push('<!--[-->');
											RatingGroup.Item($$renderer, { index });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								if (RatingGroup.Context) {
									$$renderer.push('<!--[-->');
									RatingGroup.Context($$renderer, { children, $$slots: { default: true } });
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

				$$renderer.push(` `);

				if (RatingGroup.HiddenInput) {
					$$renderer.push('<!--[-->');
					RatingGroup.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}