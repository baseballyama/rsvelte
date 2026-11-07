import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Figure } from '@sveltestrap/sveltestrap';
import Image from './Image.svelte';

export const meta = {
	title: 'Stories/Images',
	component: Image,
	parameters: {},
	argTypes: {
		class: { control: false, table: { disable: true } },
		alt: { control: 'text' },
		figure: { control: 'boolean' },
		fluid: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		thumbnail: { control: 'boolean' },
		src: { control: false, table: { disable: true } }
	},
	args: { alt: '', fluid: false, theme: null, thumbnail: false }
};

export default function Image_stories($$renderer) {
	const thumbnails = [
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000)
	];

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				if (args.figure) {
					$$renderer.push('<!--[0-->');

					Figure($$renderer, {
						caption: 'This is a figure caption',
						children: ($$renderer) => {
							Image($$renderer, $.spread_props([args]));
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
					Image($$renderer, $.spread_props([args]));
				}

				$$renderer.push(`<!--]-->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Basic',
		args: {
			alt: '',
			fluid: false,
			thumbnail: false,
			figure: false,
			src: 'https://picsum.photos/id/155/1400/400.jpg'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Fluid',
		args: {
			fluid: true,
			alt: 'This is a fluid Image',
			src: 'https://picsum.photos/id/518/1500/667.jpg'
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Thumbnail',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array = $.ensure_array_like(thumbnails);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let thumbnail = each_array[$$index];

				Image($$renderer, {
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					src: thumbnail
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Figures',
		children: ($$renderer) => {
			Figure($$renderer, {
				caption: 'I believe this is a cow needing a haircut',
				children: ($$renderer) => {
					Image($$renderer, {
						fluid: true,
						alt: 'Landscape',
						src: 'https://picsum.photos/id/200/800/600'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="horizontal"><!--[-->`);

			const each_array_1 = $.ensure_array_like(thumbnails);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let thumbnail = each_array_1[$$index_1];

				Image($$renderer, {
					theme: 'dark',
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					src: thumbnail
				});
			}

			$$renderer.push(`<!--]--></div> <div class="horizontal"><!--[-->`);

			const each_array_2 = $.ensure_array_like(thumbnails);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let thumbnail = each_array_2[$$index_2];

				Image($$renderer, {
					theme: 'light',
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					src: thumbnail
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}