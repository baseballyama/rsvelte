import * as $ from 'svelte/internal/server';
import { RatingGroup } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		RatingGroup($$renderer, {
			count: 5,
			dir: 'rtl',
			children: ($$renderer) => {
				if (RatingGroup.Label) {
					$$renderer.push('<!--[-->');

					RatingGroup.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Label`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

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