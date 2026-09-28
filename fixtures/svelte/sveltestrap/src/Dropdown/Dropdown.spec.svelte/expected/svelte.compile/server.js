import * as $ from 'svelte/internal/server';
import Dropdown from './Dropdown.svelte';
import { DropdownMenu } from '../DropdownMenu';
import { DropdownItem } from '../DropdownItem';
import { DropdownToggle } from '../DropdownToggle';

export default function Dropdown_spec($$renderer) {
	Dropdown($$renderer, {
		children: ($$renderer) => {
			DropdownToggle($$renderer, {
				caret: true,
				class: 'coconut',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownMenu($$renderer, {
				class: 'cocoa',
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Alpha`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}