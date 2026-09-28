import * as $ from 'svelte/internal/server';
import { Shine, Tilt } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';

export default function _page($$renderer) {
	const images = [
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-250-plains.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-251-island.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-252-swamp.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-253-mountain.png',
		'https://nelsoncodepen.s3.eu-west-2.amazonaws.com/thb-254-forest.png'
	];

	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-center content-center gap-6"><!--[-->`);

			const each_array = $.ensure_array_like(images);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let image = each_array[i];

				Tilt($$renderer, {
					class: 'hover:scale-110 transition duration-500',
					children: ($$renderer) => {
						$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Set brightness</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-center content-center gap-6"><!--[-->`);

			const each_array_1 = $.ensure_array_like(images);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let image = each_array_1[i];

				Tilt($$renderer, {
					class: 'hover:scale-110 transition duration-500',
					setBrightness: true,
					children: ($$renderer) => {
						$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Shine</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Shine($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center justify-center content-center gap-6"><!--[-->`);

					const each_array_2 = $.ensure_array_like(images);

					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let image = each_array_2[i];

						Tilt($$renderer, {
							class: 'hover:scale-110 transition duration-500',
							children: ($$renderer) => {
								$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Change perspective amount</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-center content-center gap-6"><!--[-->`);

			const each_array_3 = $.ensure_array_like(images);

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let image = each_array_3[i];

				Tilt($$renderer, {
					class: 'hover:scale-110 transition duration-500 [perspective:300px]',
					children: ($$renderer) => {
						$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>maxRotation</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center justify-center content-center gap-6"><!--[-->`);

			const each_array_4 = $.ensure_array_like(images);

			for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
				let image = each_array_4[i];

				Tilt($$renderer, {
					class: 'hover:scale-110 transition duration-500',
					maxRotation: 40,
					children: ($$renderer) => {
						$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>flex-wrap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center justify-center content-center gap-6"><!--[-->`);

			const each_array_5 = $.ensure_array_like(images);

			for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
				let image = each_array_5[i];

				Tilt($$renderer, {
					class: 'hover:scale-110 transition duration-500',
					children: ($$renderer) => {
						$$renderer.push(`<img${$.attr('src', image)} width="180px" class="transition ease-out"${$.attr('alt', `example ${$.stringify(i)}`)}/>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Blockquote($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Magic: The Gathering card images are copyright Wizards of the Coast, LLC.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}