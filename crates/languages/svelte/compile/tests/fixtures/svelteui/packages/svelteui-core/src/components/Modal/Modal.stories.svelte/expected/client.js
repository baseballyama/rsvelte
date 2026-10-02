import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Stack, NativeSelect, TextInput } from '@svelteuidev/core';
import { Modal } from './index';
import { Button } from '../Button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Modal_stories($$anchor, $$props) {
	$.push($$props, true);

	let opened = false;

	function toggleOpen() {
		opened = !opened;
	}

	function handleClose() {
		opened = false;
	}

	const content = Array(100).fill(0).map((_, index) => 'Svelte is a complier');
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Modal',
		get component() {
			return Modal;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				Button(node_2, {
					$$events: { click: toggleOpen },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Click Me');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Modal(node_3, $.spread_props(
					{
						get opened() {
							return opened;
						}
					},
					() => $.get(args),
					{
						$$events: { close: handleClose },
						children: ($$anchor, $$slotProps) => {
							Stack($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									TextInput(node_4, {
										autofocus: true,
										placeholder: 'Your name',
										label: 'Full name'
									});

									var node_5 = $.sibling(node_4, 2);

									NativeSelect(node_5, {
										data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
										placeholder: 'Pick one',
										label: 'Select your favorite framework/library',
										description: 'This is anonymous'
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				));

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_6 = $.sibling(node_1, 2);

	Story(node_6, { name: 'Modal', id: 'modalStory' });

	var node_7 = $.sibling(node_6, 2);

	Story(node_7, {
		name: 'With Overflow',
		id: 'modalOverflowStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_8 = $.first_child(fragment_4);

			Button(node_8, {
				$$events: { click: toggleOpen },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Click Me');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Modal(node_9, {
				get opened() {
					return opened;
				},
				overflow: 'inside',
				$$events: { close: handleClose },
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_10 = $.first_child(fragment_5);

					$.each(node_10, 17, () => content, $.index, ($$anchor, _) => {
						var p = root_1();
						var text_2 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_2, $.get(_)));
						$.append($$anchor, p);
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}