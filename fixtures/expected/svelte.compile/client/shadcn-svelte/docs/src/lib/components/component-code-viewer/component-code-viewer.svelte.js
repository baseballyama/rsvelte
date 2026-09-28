import 'svelte/internal/disclose-version';
import CodeIcon from "@lucide/svelte/icons/code";
import { Context } from "runed";
import { MediaQuery } from "svelte/reactivity";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { badgeVariants } from "$lib/registry/ui/badge/badge.svelte";
import ComponentCodeViewerCode from "./component-code-viewer-code.svelte";
import * as $ from 'svelte/internal/client';

export const ComponentCodeViewerContext = new Context("ComponentCodeViewer");

var root = $.from_html(`Component Source <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="group/block-view-wrapper flex w-full min-w-0 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"><!></div> <!>`, 1);

export default function Component_code_viewer($$anchor, $$props) {
	$.push($$props, true);

	let allowSidebar = $.prop($$props, 'allowSidebar', 3, false);
	const tree = $.derived(() => createFileTreeForRegistryItemFiles($$props.item.files));
	const highlightedFiles = $.derived(() => $$props.item.files);

	function getFirstFileTargetInTree(_tree = $.get(tree)) {
		if (!_tree?.length) return null;

		for (const node of _tree) {
			if (node.path) return node.path;

			if (node.children) {
				const result = getFirstFileTargetInTree(node.children);

				if (result) return result;
			}
		}

		return null;
	}

	let activeFile = $.state($.proxy(getFirstFileTargetInTree() ?? null));
	let resizablePaneRef = $.state(null);
	let activeFileCodeToCopy = $.state("");

	ComponentCodeViewerContext.set({
		get item() {
			return $$props.item;
		},

		get activeFile() {
			return $.get(activeFile);
		},

		set activeFile(value) {
			$.set(activeFile, value, true);
		},

		get resizablePaneRef() {
			return $.get(resizablePaneRef);
		},

		set resizablePaneRef(value) {
			$.set(resizablePaneRef, value, true);
		},

		get tree() {
			return $.get(tree);
		},

		get highlightedFiles() {
			return $.get(highlightedFiles);
		},

		get activeFileCodeToCopy() {
			return $.get(activeFileCodeToCopy);
		},

		set activeFileCodeToCopy(value) {
			$.set(activeFileCodeToCopy, value, true);
		},

		get allowSidebar() {
			return allowSidebar();
		}
	});

	const isMobile = new MediaQuery("(max-width: 768px)");
	const height = $.derived(() => isMobile.current ? "75dvh" : "calc(100svh - (var(--header-height) * 2))");
	let contentRef = $.state(null);
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => badgeVariants({ variant: "secondary" }));

					$.component(node_2, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							'data-llm-ignore': true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var node_3 = $.sibling($.first_child(fragment_2));

								CodeIcon(node_3, { 'aria-hidden': 'true' });
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'rounded-xl p-0 sm:max-w-[90%]',
						showCloseButton: false,
						onOpenAutoFocus: (e) => {
							if (!$.get(contentRef)) return;

							const activeItem = $.get(contentRef).querySelector("button[data-active=true]");

							if (activeItem) {
								e.preventDefault();
								activeItem.focus();
							}
						},

						get ref() {
							return $.get(contentRef);
						},

						set ref($$value) {
							$.set(contentRef, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, `${$$props.item.name ?? ''} Code`));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, `View the code for the ${$$props.item.name ?? ''} component`));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_5, 2);
							var node_8 = $.child(div);

							ComponentCodeViewerCode(node_8, {});
							$.reset(div);

							var node_9 = $.sibling(div, 2);

							$.component(node_9, () => Dialog.Close, ($$anchor, Dialog_Close) => {
								Dialog_Close($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Close');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => {
								$.set_attribute(div, 'id', $$props.item.name);
								$.set_style(div, `--height: ${$.get(height) ?? ''};`);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}