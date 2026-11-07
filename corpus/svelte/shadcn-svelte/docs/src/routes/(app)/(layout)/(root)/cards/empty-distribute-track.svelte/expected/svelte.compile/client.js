import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Card, CardContent } from "$lib/registry/ui/card/index.js";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from "$lib/registry/ui/empty/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Empty_distribute_track($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Empty($$anchor, {
						class: 'p-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node = $.first_child(fragment_3);

							EmptyMedia(node, {
								variant: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'Add01Icon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
									});
								},
								$$slots: { default: true }
							});

							var node_1 = $.sibling(node, 2);

							EmptyHeader(node_1, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_2 = $.first_child(fragment_5);

									EmptyTitle(node_2, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Distribute Track');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									EmptyDescription(node_3, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Upload your first master to start reaching listeners on Spotify, Apple Music, and more.');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_1, 2);

							EmptyContent(node_4, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Create Release');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}