import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileIcon from '@lucide/svelte/icons/file';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <span>Select file or drag here.</span> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	FileUpload($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => FileUpload.Label, ($$anchor, FileUpload_Label) => {
				FileUpload_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Upload your files');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => FileUpload.Dropzone, ($$anchor, FileUpload_Dropzone) => {
				FileUpload_Dropzone($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						FileIcon(node_2, { class: 'size-10' });

						var node_3 = $.sibling(node_2, 4);

						$.component(node_3, () => FileUpload.Trigger, ($$anchor, FileUpload_Trigger) => {
							FileUpload_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Browse Files');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => FileUpload.HiddenInput, ($$anchor, FileUpload_HiddenInput) => {
							FileUpload_HiddenInput($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => FileUpload.ItemGroup, ($$anchor, FileUpload_ItemGroup) => {
				FileUpload_ItemGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						{
							const children = ($$anchor, fileUpload = $.noop) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								$.each(node_7, 17, () => fileUpload()().acceptedFiles, (file) => file.name, ($$anchor, file) => {
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => FileUpload.Item, ($$anchor, FileUpload_Item) => {
										FileUpload_Item($$anchor, {
											get file() {
												return $.get(file);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_9 = $.first_child(fragment_6);

												$.component(node_9, () => FileUpload.ItemName, ($$anchor, FileUpload_ItemName) => {
													FileUpload_ItemName($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(file).name));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => FileUpload.ItemSizeText, ($$anchor, FileUpload_ItemSizeText) => {
													FileUpload_ItemSizeText($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, `${$.get(file).size ?? ''} bytes`));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => FileUpload.ItemDeleteTrigger, ($$anchor, FileUpload_ItemDeleteTrigger) => {
													FileUpload_ItemDeleteTrigger($$anchor, {});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								});

								$.append($$anchor, fragment_4);
							};

							$.component(node_6, () => FileUpload.Context, ($$anchor, FileUpload_Context) => {
								FileUpload_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_5, 2);

			$.component(node_12, () => FileUpload.ClearTrigger, ($$anchor, FileUpload_ClearTrigger) => {
				FileUpload_ClearTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Clear Files');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}