import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";
import { Pane, PaneGroup, PaneResizer } from "paneforge";
import { MediaQuery } from "svelte/reactivity";
import Separator from "../ui/separator/separator.svelte";
import Button from "../ui/button/button.svelte";
import Maximize from "@lucide/svelte/icons/maximize";
import CodeEditor from "./CodeEditor.svelte";
import PreviewInstallAdd from "./PreviewInstallAdd.svelte";
import { CopyButton } from "../ui/copy-button";
import { scale } from "svelte/transition";
import { watch } from "runed";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "$lib/components/ui/tooltip";

export default function BlockPreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			itemId,
			code,
			preview,
			previewMode = "inline",
			previewHeight,
			title = "Hero Section",
			category = "Components",
			previewOnly,
			component: BlockComponent
		} = $$props;

		const radioItem = "rounded-(--radius) duration-200 flex items-center justify-center h-8 px-2.5 gap-2 transition-[color] data-[state=checked]:bg-muted";
		const DEFAULT_SIZE = 100;
		const SM_SIZE = 30;
		const MD_SIZE = 62;
		const LG_SIZE = 82;
		let width = DEFAULT_SIZE;
		let mode = "preview";
		let iframeHeight = 0;
		let isLoading = true;
		let ref = undefined;
		let large = new MediaQuery("min-width: 1024px");
		let iframeRef = null;

		// onMount(() => {
		//   if (iframeRef) {
		//     let iframe = iframeRef;
		//     setTimeout(() => {
		//       isLoading = false;
		//       let contentHeight = iframe!.contentWindow!.document.body.scrollHeight;
		//       iframeHeight = contentHeight + 20;
		//     }, 3000);
		//   }
		// });
		// $effect(() => {
		//   const iframe = iframeRef;
		//   if (iframe) {
		//     iframe.addEventListener("load", () => {
		//       isLoading = false;
		//       let contentHeight = iframe.contentWindow!.document.body.scrollHeight;
		//       iframeHeight = contentHeight + 20;
		//     });
		//   }
		// });
		let showIframeComp = $.derived(() => previewMode === "iframe");

		let forcesIframe = $.derived(() => previewMode === "iframe");
		let shouldRenderInIframe = $.derived(() => forcesIframe() || showIframeComp());
		let resolvedIframeHeight = $.derived(() => previewHeight ?? iframeHeight);

		function applyIframeScrollbarStyles(iframe) {
			const iframeDocument = iframe?.contentDocument;

			if (!iframeDocument) return;

			iframeDocument.documentElement.classList.add("no-scrollbar");
			iframeDocument.body.classList.add("no-scrollbar");
		}

		watch(() => forcesIframe(), (isForced) => {
			if (isForced && !showIframeComp()) {
				showIframeComp(true);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<section${$.attr('id', `${$.stringify(category)}-${$.stringify(title)}`)} class="group mb-16 border-b [--color-border:color-mix(in_oklab,var(--color-zinc-200)_75%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-zinc-800)_60%,transparent)]"><div class="relative border-y"><div class="absolute inset-x-4 -top-14 bottom-0 mx-auto max-w-7xl lg:inset-x-0"><div class="absolute top-0 bottom-0 left-0 w-px bg-linear-to-b from-transparent to-(--color-border) to-75%"></div> <div class="absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-transparent to-(--color-border) to-75%"></div></div> <div class="relative z-10 mx-auto flex max-w-7xl justify-between py-1.5 pr-6 pl-8 [--color-border:var(--color-zinc-200)] md:py-2 lg:pr-2 lg:pl-6 dark:[--color-border:var(--color-zinc-800)]"><div class="-ml-3 flex items-center gap-2">`);

			if (code) {
				$$renderer.push(`<!--[0--><div class="flex gap-0.5">`);

				Button($$renderer, {
					variant: mode === "preview" ? "secondary" : "ghost",
					size: 'sm',
					onclick: () => mode = "preview",
					class: radioItem,
					children: ($$renderer) => {
						$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="sm:opacity-80" color="currentColor"><path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" stroke-width="1.5"></path></svg> <span class="hidden text-[13px] sm:block">Preview</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: mode === "code" ? "secondary" : "ghost",
					size: 'sm',
					onclick: () => mode = "code",
					class: radioItem,
					children: ($$renderer) => {
						$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path class="sm:opacity-50" d="M7 8l-4 4l4 4"></path><path class="sm:opacity-50" stroke="currentColor" d="M17 8l4 4l-4 4"></path><path d="M14 4l-4 16"></path></svg> <span class="hidden text-[13px] sm:block">Code</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);
				Separator($$renderer, { orientation: 'vertical', class: 'hidden h-4! lg:block' });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'sm',
				class: 'size-8',
				href: preview,
				target: '_blank',
				children: ($$renderer) => {
					Maximize($$renderer, { strokeWidth: 1.6, class: 'size-4! sm:opacity-70' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Separator($$renderer, { orientation: 'vertical', class: 'hidden h-4! lg:block' });
			$$renderer.push(`<!----> <span class="hidden text-sm text-muted-foreground lg:block">${$.escape(width < MD_SIZE ? "Mobile" : width < LG_SIZE ? "Tablet" : "Desktop")}</span> `);
			Separator($$renderer, { orientation: 'vertical', class: 'h-4!' });
			$$renderer.push(`<!----> <span class="ml-0 text-sm capitalize">${$.escape(category + " " + title)}</span></div> <div class="flex items-center gap-2">`);

			if (shouldRenderInIframe()) {
				$$renderer.push(`<!--[0--><div>`);

				TooltipProvider($$renderer, {
					delayDuration: 100,
					children: ($$renderer) => {
						Tooltip($$renderer, {
							children: ($$renderer) => {
								TooltipTrigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: () => {
												if (ref) {
													ref.resize(DEFAULT_SIZE);
												}
											},
											size: 'icon',
											class: 'relative  h-8 w-8 cursor-pointer shadow-none',
											variant: 'outline',
											'aria-label': 'Set to Desktop View',
											children: ($$renderer) => {
												$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M20.4999 16.5V8.5C20.4999 6.14298 20.4999 4.96447 19.7676 4.23223C19.0354 3.5 17.8569 3.5 15.4999 3.5H8.49988C6.14286 3.5 4.96434 3.5 4.23211 4.23223C3.49988 4.96447 3.49988 6.14298 3.49988 8.5V16.5" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21.9841 20.5H2.01567C1.63273 20.5 1.38367 20.1088 1.55493 19.7764L3.49988 16.5H20.4999L22.4448 19.7764C22.6161 20.1088 22.367 20.5 21.9841 20.5Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TooltipContent($$renderer, {
									align: 'center',
									class: 'px-2 py-1 text-[10px]',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Laptop`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TooltipProvider($$renderer, {
					delayDuration: 100,
					children: ($$renderer) => {
						Tooltip($$renderer, {
							children: ($$renderer) => {
								TooltipTrigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: () => {
												if (ref) {
													ref.resize(MD_SIZE);
												}
											},
											size: 'icon',
											class: 'relative h-8 w-8 cursor-pointer shadow-none',
											variant: 'outline',
											'aria-label': 'Set to Tablet View',
											children: ($$renderer) => {
												$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M14.5 2H9.5C6.67157 2 5.25736 2 4.37868 2.87868C3.5 3.75736 3.5 5.17157 3.5 8V16C3.5 18.8284 3.5 20.2426 4.37868 21.1213C5.25736 22 6.67157 22 9.5 22H14.5C17.3284 22 18.7426 22 19.6213 21.1213C20.5 20.2426 20.5 18.8284 20.5 16V8C20.5 5.17157 20.5 3.75736 19.6213 2.87868C18.7426 2 17.3284 2 14.5 2Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round"></path><path d="M12 19H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TooltipContent($$renderer, {
									align: 'center',
									class: 'px-2 py-1 text-[10px]',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Tablet`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TooltipProvider($$renderer, {
					delayDuration: 100,
					children: ($$renderer) => {
						Tooltip($$renderer, {
							children: ($$renderer) => {
								TooltipTrigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											onclick: () => {
												if (ref) {
													ref.resize(SM_SIZE);
												}
											},
											size: 'icon',
											class: 'relative h-8 w-8 cursor-pointer shadow-none',
											variant: 'outline',
											'aria-label': 'Set to Mobile View',
											children: ($$renderer) => {
												$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M12 19H12.01" stroke="currentColor" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.5 2H10.5C8.14298 2 6.96447 2 6.23223 2.73223C5.5 3.46447 5.5 4.64298 5.5 7V17C5.5 19.357 5.5 20.5355 6.23223 21.2678C6.96447 22 8.14298 22 10.5 22H13.5C15.857 22 17.0355 22 17.7678 21.2678C18.5 20.5355 18.5 19.357 18.5 17V7C18.5 4.64298 18.5 3.46447 17.7678 2.73223C17.0355 2 15.857 2 13.5 2Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TooltipContent($$renderer, {
									align: 'center',
									class: 'px-2 py-1 text-[10px]',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Mobile`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!forcesIframe()) {
				$$renderer.push('<!--[0-->');

				TooltipProvider($$renderer, {
					delayDuration: 120,
					children: ($$renderer) => {
						Tooltip($$renderer, {
							children: ($$renderer) => {
								TooltipTrigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											size: 'icon',
											onclick: () => {
												showIframeComp(!showIframeComp());
											},
											class: 'relative h-8 w-8 cursor-pointer shadow-none',
											variant: 'outline',
											'aria-label': 'Toggle Responsive UI',
											children: ($$renderer) => {
												$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 6V18C2 19.6569 3.34315 21 5 21L19 21C20.6569 21 22 19.6569 22 18V6C22 4.34315 20.6569 3 19 3H5C3.34315 3 2 4.34315 2 6Z"${$.attr_class($.clsx(showIframeComp()
													? "fill-green-500/10 stroke-green-500"
													: "stroke-primary"))} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 3L10 21"${$.attr_class($.clsx(showIframeComp() ? "stroke-green-500" : "stroke-primary"))} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.5 7H6.5M5.5 10H6.5"${$.attr_class($.clsx(showIframeComp() ? "stroke-green-500" : "stroke-primary"))} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 10L15 12L17 14"${$.attr_class($.clsx(showIframeComp() ? "stroke-green-500" : "stroke-primary"))} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TooltipContent($$renderer, {
									align: 'center',
									class: 'px-2 py-1 text-[10px]',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Responsive UI`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (code) {
				$$renderer.push('<!--[0-->');
				PreviewInstallAdd($$renderer, { itemId });
				$$renderer.push(`<!----> `);

				if (!Array.isArray(code)) {
					$$renderer.push('<!--[0-->');
					Separator($$renderer, { class: 'h-4!', orientation: 'vertical' });
					$$renderer.push(`<!----> `);
					CopyButton($$renderer, { text: code.code });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> <div class="relative"><div class="absolute inset-x-4 -bottom-14 mx-auto h-14 max-w-7xl lg:inset-x-0"><div class="absolute top-0 bottom-0 left-0 w-px bg-linear-to-b from-(--color-border)"></div> <div class="absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-(--color-border)"></div></div> <div class="relative z-10 mx-auto max-w-7xl px-4 lg:border-x lg:px-0"><div${$.attr_class($.clsx(cn("bg-white dark:bg-transparent", mode === "code" && "hidden")))}>`);

			if (shouldRenderInIframe()) {
				$$renderer.push('<!--[0-->');

				PaneGroup($$renderer, {
					direction: 'horizontal',
					children: ($$renderer) => {
						Pane($$renderer, {
							id: `block-${title}`,
							order: 1,
							onResize: (size) => {
								width = Number(size);
							},
							defaultSize: DEFAULT_SIZE,
							minSize: SM_SIZE,
							class: 'h-fit border-r',
							get pane() {
								return ref;
							},

							set pane($$value) {
								ref = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<iframe loading="lazy" allowfullscreen=""${$.attr('title', title)}${$.attr('height', resolvedIframeHeight())} class="@starting:opacity-0 @starting:blur-xl no-scrollbar block h-(--iframe-height) min-h-56 w-full duration-200 will-change-auto"${$.attr('src', preview)}${$.attr('id', `block-${title}`)}${$.attr_style(` --iframe-height: ${$.stringify(resolvedIframeHeight())}px;`)} onload="this.__e=event"></iframe> `);

								if (isLoading) {
									$$renderer.push(`<!--[0--><div class="absolute inset-0 right-2 flex items-center justify-center border-x bg-background"><div class="size-6 animate-spin rounded-full border border-primary border-t-transparent"></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (large) {
							$$renderer.push('<!--[0-->');

							PaneResizer($$renderer, {
								class: 'relative w-2 before:absolute before:inset-0 before:m-auto before:h-12 before:w-1 before:rounded-full before:bg-zinc-300 before:transition-[height,background] hover:before:h-16 hover:before:bg-zinc-400 focus:before:bg-zinc-400 dark:before:bg-zinc-600 dark:hover:before:bg-zinc-500 dark:focus:before:bg-zinc-400'
							});

							$$renderer.push(`<!----> `);

							Pane($$renderer, {
								id: `code-${title}`,
								order: 2,
								defaultSize: 100 - DEFAULT_SIZE,
								class: '-mr-[0.5px] ml-px'
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div class="theme-container">`);

				if (BlockComponent) {
					$$renderer.push('<!--[-->');
					BlockComponent($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="bg-secondary! dark:bg-transparent">`);

			if (mode === "code") {
				$$renderer.push('<!--[0-->');
				CodeEditor($$renderer, { code });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div></section>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}