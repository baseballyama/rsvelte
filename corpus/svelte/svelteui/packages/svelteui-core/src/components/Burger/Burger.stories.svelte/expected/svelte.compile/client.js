import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Burger } from './index';
import { Button } from '../Button';

var root = $.from_html(`<!> Menu`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Burger_stories($$anchor) {
	let opened = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Burger',
		get component() {
			return Burger;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Burger($$anchor, $.spread_props(
					{
						get opened() {
							return opened;
						}
					},
					() => $.get(args),
					{ $$events: { click: () => opened = !opened } }
				));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Burger', id: 'burgerStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Burger inside a button',
		id: 'burgerButtonStory',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				ripple: true,
				variant: 'default',
				color: 'black',
				$$events: { click: () => opened = !opened },
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Burger(node_4, {
						get opened() {
							return opened;
						},
						size: 'sm'
					});

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}