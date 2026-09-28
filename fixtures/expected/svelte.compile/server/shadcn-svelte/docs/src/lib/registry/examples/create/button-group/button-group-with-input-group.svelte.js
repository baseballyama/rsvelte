import * as $ from 'svelte/internal/server';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_input_group($$renderer) {
	Example($$renderer, {
		title: 'With Input Group',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');
							InputGroup.Input($$renderer, { placeholder: 'Type to search...' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								align: 'inline-start',
								class: 'text-muted-foreground',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}