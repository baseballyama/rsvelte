import * as $ from 'svelte/internal/server';
import CodeIcon from "@lucide/svelte/icons/code";
import { Context } from "runed";
import { MediaQuery } from "svelte/reactivity";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { badgeVariants } from "$lib/registry/ui/badge/badge.svelte";
import ComponentCodeViewerCode from "./component-code-viewer-code.svelte";

export const ComponentCodeViewerContext = new Context("ComponentCodeViewer");

export default function Component_code_viewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, allowSidebar = false } = $$props;
		const tree = $.derived(() => createFileTreeForRegistryItemFiles(item.files));
		const highlightedFiles = $.derived(() => item.files);

		function getFirstFileTargetInTree(_tree = tree()) {
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

		let activeFile = getFirstFileTargetInTree() ?? null;
		let resizablePaneRef = null;
		let activeFileCodeToCopy = "";

		ComponentCodeViewerContext.set({
			get item() {
				return item;
			},

			get activeFile() {
				return activeFile;
			},

			set activeFile(value) {
				activeFile = value;
			},

			get resizablePaneRef() {
				return resizablePaneRef;
			},

			set resizablePaneRef(value) {
				resizablePaneRef = value;
			},

			get tree() {
				return tree();
			},

			get highlightedFiles() {
				return highlightedFiles();
			},

			get activeFileCodeToCopy() {
				return activeFileCodeToCopy;
			},

			set activeFileCodeToCopy(value) {
				activeFileCodeToCopy = value;
			},

			get allowSidebar() {
				return allowSidebar;
			}
		});

		const isMobile = new MediaQuery("(max-width: 768px)");
		const height = $.derived(() => isMobile.current ? "75dvh" : "calc(100svh - (var(--header-height) * 2))");
		let contentRef = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						if (Dialog.Trigger) {
							$$renderer.push('<!--[-->');

							Dialog.Trigger($$renderer, {
								class: badgeVariants({ variant: "secondary" }),
								'data-llm-ignore': true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Component Source `);
									CodeIcon($$renderer, { 'aria-hidden': 'true' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'rounded-xl p-0 sm:max-w-[90%]',
								showCloseButton: false,
								onOpenAutoFocus: (e) => {
									if (!contentRef) return;

									const activeItem = contentRef.querySelector("button[data-active=true]");

									if (activeItem) {
										e.preventDefault();
										activeItem.focus();
									}
								},

								get ref() {
									return contentRef;
								},

								set ref($$value) {
									contentRef = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(item.name)} Code`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->View the code for the ${$.escape(item.name)} component`);
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

									$$renderer.push(` <div${$.attr('id', item.name)} class="group/block-view-wrapper flex w-full min-w-0 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"${$.attr_style(`--height: ${height()};`)}>`);
									ComponentCodeViewerCode($$renderer, {});
									$$renderer.push(`<!----></div> `);

									if (Dialog.Close) {
										$$renderer.push('<!--[-->');

										Dialog.Close($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}