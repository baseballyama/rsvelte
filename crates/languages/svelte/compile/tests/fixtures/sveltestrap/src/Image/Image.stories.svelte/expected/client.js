import 'svelte/internal/disclose-version';
import Image from './Image.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Figure } from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<div class="horizontal"></div>`);
var root_1 = $.from_html(`<div class="horizontal"></div> <div class="horizontal"></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Image_stories($$anchor) {
	const thumbnails = [
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
		'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000)
	];

	var fragment = root_2();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						Figure($$anchor, {
							caption: 'This is a figure caption',
							children: ($$anchor, $$slotProps) => {
								Image($$anchor, $.spread_props(() => $.get(args)));
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						Image($$anchor, $.spread_props(() => $.get(args)));
					};

					$.if(node_1, ($$render) => {
						if ($.get(args).figure) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Story(node_2, {
		name: 'Basic',
		args: {
			alt: '',
			fluid: false,
			thumbnail: false,
			figure: false,
			src: 'https://picsum.photos/id/155/1400/400.jpg'
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Fluid',
		args: {
			fluid: true,
			alt: 'This is a fluid Image',
			src: 'https://picsum.photos/id/518/1500/667.jpg'
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Story(node_4, {
		name: 'Thumbnail',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.each(div, 21, () => thumbnails, $.index, ($$anchor, thumbnail) => {
				Image($$anchor, {
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					get src() {
						return $.get(thumbnail);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Figures',
		children: ($$anchor, $$slotProps) => {
			Figure($$anchor, {
				caption: 'I believe this is a cow needing a haircut',
				children: ($$anchor, $$slotProps) => {
					Image($$anchor, {
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

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_1();
			var div_1 = $.first_child(fragment_8);

			$.each(div_1, 21, () => thumbnails, $.index, ($$anchor, thumbnail) => {
				Image($$anchor, {
					theme: 'dark',
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					get src() {
						return $.get(thumbnail);
					}
				});
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);

			$.each(div_2, 21, () => thumbnails, $.index, ($$anchor, thumbnail) => {
				Image($$anchor, {
					theme: 'light',
					thumbnail: true,
					alt: 'This is a thumbnail Image',
					get src() {
						return $.get(thumbnail);
					}
				});
			});

			$.reset(div_2);
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}