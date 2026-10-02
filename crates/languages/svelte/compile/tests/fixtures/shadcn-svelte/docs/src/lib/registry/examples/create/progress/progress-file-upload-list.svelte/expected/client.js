import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Progress } from "$lib/registry/ui/progress/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="text-sm text-muted-foreground"> </span>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Progress_file_upload_list($$anchor) {
	const files = [
		{
			id: "1",
			name: "document.pdf",
			progress: 45,
			timeRemaining: "2m 30s"
		},

		{
			id: "2",
			name: "presentation.pptx",
			progress: 78,
			timeRemaining: "45s"
		},

		{
			id: "3",
			name: "spreadsheet.xlsx",
			progress: 12,
			timeRemaining: "5m 12s"
		},

		{
			id: "4",
			name: "image.jpg",
			progress: 100,
			timeRemaining: "Complete"
		}
	];

	Example($$anchor, {
		title: 'File Upload List',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
				Item_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => files, (file) => file.id, ($$anchor, file) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									size: 'xs',
									class: 'px-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Item.Media, ($$anchor, Item_Media) => {
											Item_Media($$anchor, {
												variant: 'icon',
												children: ($$anchor, $$slotProps) => {
													IconPlaceholder($$anchor, {
														lucide: 'FileIcon',
														tabler: 'IconFile',
														hugeicons: 'FileIcon',
														phosphor: 'FileIcon',
														remixicon: 'RiFileLine',
														class: 'size-5'
													});
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												class: 'inline-block truncate',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_5 = $.first_child(fragment_6);

													$.component(node_5, () => Item.Title, ($$anchor, Item_Title) => {
														Item_Title($$anchor, {
															class: 'inline',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $.get(file).name));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_4, 2);

										$.component(node_6, () => Item.Content, ($$anchor, Item_Content_1) => {
											Item_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Progress($$anchor, {
														get value() {
															return $.get(file).progress;
														},
														class: 'w-32'
													});
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Item.Actions, ($$anchor, Item_Actions) => {
											Item_Actions($$anchor, {
												class: 'w-16 justify-end',
												children: ($$anchor, $$slotProps) => {
													var span = root();
													var text_1 = $.only_child(span, true);

													$.template_effect(() => $.set_text(text_1, $.get(file).timeRemaining));
													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}