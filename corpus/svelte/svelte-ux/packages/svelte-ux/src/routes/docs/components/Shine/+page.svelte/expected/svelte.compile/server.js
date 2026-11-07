import * as $ from 'svelte/internal/server';
import { mdiHome, mdiMagnify, mdiTrashCan } from '@mdi/js';
import { Button, Shine, Tilt } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

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
			$$renderer.push(`<div class="inline-block bg-primary/10 rounded-lg">`);

			Shine($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="text-8xl text-primary border-[12px] border-primary py-2 font-semibold rounded-lg text-center w-[500px]">Shine</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Emoji</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Shine($$renderer, {
				depth: 3,
				children: ($$renderer) => {
					$$renderer.push(`<div class="text-[9rem] leading-[9rem]">🚀 🧸 🍔 🥨 🍩 🍓 🍒 🪼 🧠 🌎</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Light color</h2> `);

	Preview($$renderer, {
		class: 'bg-neutral-700',
		children: ($$renderer) => {
			Shine($$renderer, {
				depth: 3,
				lightColor: '#FF0000',
				children: ($$renderer) => {
					$$renderer.push(`<div class="text-[9rem] leading-[9rem] grayscale-[100] brightness-50">👻 💀 🧪</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Shine($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center gap-2">`);

					Button($$renderer, {
						variant: 'fill',
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Button`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiTrashCan,
						variant: 'fill',
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delete`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiMagnify,
						variant: 'fill',
						color: 'success',
						class: 'flex-row-reverse',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Search`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiHome,
						variant: 'fill',
						color: 'primary',
						class: 'flex-col',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiHome,
						variant: 'fill',
						color: 'primary',
						class: 'flex-col-reverse',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Tilt</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Shine($$renderer, {
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}