import 'svelte/internal/disclose-version';
import Fade from './Fade.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button, Card } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Fade',
	component: Fade,
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		isOpen: { control: 'boolean' },
		toggler: { control: { disable: true } }
	},
	args: { isOpen: false }
};

var root = $.from_html(`<div class="card-width"><!></div>`);
var root_1 = $.from_html(`<div class="fade-example"><!> <!></div>`);
var root_2 = $.from_html(`<div class="fade-example"><div class="text-content"><!> <h5> </h5></div> <!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Fade_stories($$anchor) {
	let isOpen = false;
	let status = 'Closed';
	var fragment = root_3();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_1();
				var node_1 = $.child(div);

				Button(node_1, {
					color: 'primary',
					class: 'mb-3',
					$$events: { click: () => isOpen = !isOpen },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Toggle');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Fade(node_2, {
					get isOpen() {
						return isOpen;
					},

					children: ($$anchor, $$slotProps) => {
						var div_1 = root();
						var node_3 = $.child(div_1);

						Card(node_3, {
							body: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim\n          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Story(node_4, { name: 'Basic' });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();
			var div_3 = $.child(div_2);
			var node_6 = $.child(div_3);

			Button(node_6, {
				color: 'primary',
				class: 'mb-3',
				$$events: { click: () => isOpen = !isOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Toggle');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var h5 = $.sibling(node_6, 2);
			var text_3 = $.only_child(h5);

			$.reset(div_3);

			var node_7 = $.sibling(div_3, 2);

			Fade(node_7, {
				get isOpen() {
					return isOpen;
				},

				$$events: {
					opening: () => status = 'Opening...',
					open: () => status = 'Opened',
					closing: () => status = 'Closing...',
					close: () => status = 'Closed'
				},

				children: ($$anchor, $$slotProps) => {
					var div_4 = root();
					var node_8 = $.child(div_4);

					Card(node_8, {
						body: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim\n          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.template_effect(() => $.set_text(text_3, `Current state: ${status ?? ''}`));
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_5, 2);

	Story(node_9, {
		name: 'Uncontrolled',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_1();
			var node_10 = $.child(div_5);

			Button(node_10, {
				color: 'primary',
				id: 'toggler',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Toggle');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Fade(node_11, {
				toggler: '#toggler',
				children: ($$anchor, $$slotProps) => {
					var div_6 = root();
					var node_12 = $.child(div_6);

					Card(node_12, {
						body: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique porro a\n          molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga! Minus, alias.');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}