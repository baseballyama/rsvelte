import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Button_group_with_input_group($$anchor) {
	Example($$anchor, {
		title: 'With Input Group',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
				InputGroup_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, { placeholder: 'Type to search...' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
							InputGroup_Addon($$anchor, {
								align: 'inline-start',
								class: 'text-muted-foreground',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}