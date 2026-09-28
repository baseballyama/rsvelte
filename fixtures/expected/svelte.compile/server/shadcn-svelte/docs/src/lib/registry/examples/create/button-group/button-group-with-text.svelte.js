import * as $ from 'svelte/internal/server';
import { ButtonGroup, ButtonGroupText } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_text($$renderer) {
	Example($$renderer, {
		title: 'With Text',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					ButtonGroupText($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Text`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Another Button`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Label($$renderer, $.spread_props([
								{ for: 'input-text' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->GPU Size`);
									},
									$$slots: { default: true }
								}
							]));
						}

						ButtonGroupText($$renderer, { child, $$slots: { child: true } });
					}

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'input-text', placeholder: 'Type something here...' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}