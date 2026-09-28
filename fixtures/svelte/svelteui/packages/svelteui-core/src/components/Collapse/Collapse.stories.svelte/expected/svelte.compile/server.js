import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Paper } from '../Paper';
import { Collapse } from './index';

export default function Collapse_stories($$renderer) {
	let open = false;
	let openInside = false;

	Meta($$renderer, { title: 'Components/Collapse', component: Collapse });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle collapse text`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Collapse($$renderer, $.spread_props([
					{ open },
					args,
					{
						children: ($$renderer) => {
							Paper($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This is a hidden text!`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----> <div>This is a cool text!</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Collapse', id: 'collapseStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Nested Collapse',
		id: 'collapseNestedStory',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle collapse`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Collapse($$renderer, {
				open,
				children: ($$renderer) => {
					Paper($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Please click below to toggle a nested collapse! `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Toggle nested collapse`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Collapse($$renderer, {
								open: openInside,
								children: ($$renderer) => {
									Paper($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->This is a very hidden text, sshhhh!`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>Footer text</div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}