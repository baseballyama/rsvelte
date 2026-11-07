import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import FolderCodeIcon from "@tabler/icons-svelte/icons/folder-code";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-2"><!> <!></div>`);
var root_2 = $.from_html(`<a href="#/">Learn More <!></a>`);

export default function Empty_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
		Empty_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
					Empty_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
								Empty_Media($$anchor, {
									variant: 'icon',
									children: ($$anchor, $$slotProps) => {
										FolderCodeIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No Projects Yet');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('You haven\'t created any projects yet. Get started by creating your first project.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var node_6 = $.child(div);

							Button(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Create Project');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Import Project');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_5, 2);

				Button(node_8, {
					variant: 'link',
					class: 'text-muted-foreground',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var a = root_2();
						var node_9 = $.sibling($.child(a));

						ArrowUpRightIcon(node_9, { class: 'inline' });
						$.reset(a);
						$.append($$anchor, a);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}