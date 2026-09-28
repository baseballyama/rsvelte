import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><strong>Search value:</strong> </div>`, 1);

export default function ToolbarSearchClear($$anchor) {
	let toolbarSearch;
	let value = "";

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Toolbar(node, {
				children: ($$anchor, $$slotProps) => {
					ToolbarContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.bind_this(
								ToolbarSearch(node_1, {
									persistent: true,
									placeholder: 'Search...',
									get value() {
										return value;
									},

									set value($$value) {
										value = $$value;
									}
								}),
								($$value) => toolbarSearch = $$value,
								() => toolbarSearch
							);

							var node_2 = $.sibling(node_1, 2);

							{
								let $0 = $.derived(() => value.length === 0);

								Button(node_2, {
									kind: 'ghost',
									size: 'small',
									get disabled() {
										return $.get($0);
									},
									$$events: { click: () => toolbarSearch.clear() },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Clear search');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var text_1 = $.sibling($.child(div));

			$.reset(div);
			$.template_effect(() => $.set_text(text_1, ` ${value ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}