import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="sm:opacity-80" color="currentColor"><path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" stroke-width="1.5"></path><path opacity="0.4" d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" stroke-width="1.5"></path></svg> <span class="hidden text-[13px] sm:block">Preview</span>`, 1);
var root_1 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path class="sm:opacity-50" d="M7 8l-4 4l4 4"></path><path class="sm:opacity-50" stroke="currentColor" d="M17 8l4 4l-4 4"></path><path d="M14 4l-4 16"></path></svg> <span class="hidden text-[13px] sm:block">Code</span>`, 1);
var root_2 = $.from_html(`<div class="flex gap-0.5"><!> <!></div> <!>`, 1);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M20.4999 16.5V8.5C20.4999 6.14298 20.4999 4.96447 19.7676 4.23223C19.0354 3.5 17.8569 3.5 15.4999 3.5H8.49988C6.14286 3.5 4.96434 3.5 4.23211 4.23223C3.49988 4.96447 3.49988 6.14298 3.49988 8.5V16.5" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21.9841 20.5H2.01567C1.63273 20.5 1.38367 20.1088 1.55493 19.7764L3.49988 16.5H20.4999L22.4448 19.7764C22.6161 20.1088 22.367 20.5 21.9841 20.5Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M14.5 2H9.5C6.67157 2 5.25736 2 4.37868 2.87868C3.5 3.75736 3.5 5.17157 3.5 8V16C3.5 18.8284 3.5 20.2426 4.37868 21.1213C5.25736 22 6.67157 22 9.5 22H14.5C17.3284 22 18.7426 22 19.6213 21.1213C20.5 20.2426 20.5 18.8284 20.5 16V8C20.5 5.17157 20.5 3.75736 19.6213 2.87868C18.7426 2 17.3284 2 14.5 2Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round"></path><path d="M12 19H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`);
var root_6 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" class="text-primary" fill="none"><path d="M12 19H12.01" stroke="currentColor" stroke-width="2" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.5 2H10.5C8.14298 2 6.96447 2 6.23223 2.73223C5.5 3.46447 5.5 4.64298 5.5 7V17C5.5 19.357 5.5 20.5355 6.23223 21.2678C6.96447 22 8.14298 22 10.5 22H13.5C15.857 22 17.0355 22 17.7678 21.2678C18.5 20.5355 18.5 19.357 18.5 17V7C18.5 4.64298 18.5 3.46447 17.7678 2.73223C17.0355 2 15.857 2 13.5 2Z" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
var root_7 = $.from_html(`<div><!> <!> <!></div>`);
var root_8 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M2 6V18C2 19.6569 3.34315 21 5 21L19 21C20.6569 21 22 19.6569 22 18V6C22 4.34315 20.6569 3 19 3H5C3.34315 3 2 4.34315 2 6Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10 3L10 21" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.5 7H6.5M5.5 10H6.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 10L15 12L17 14" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
var root_9 = $.from_html(`<div class="absolute inset-0 right-2 flex items-center justify-center border-x bg-background"><div class="size-6 animate-spin rounded-full border border-primary border-t-transparent"></div></div>`);
var root_10 = $.from_html(`<iframe loading="lazy" allowfullscreen="" class="@starting:opacity-0 @starting:blur-xl no-scrollbar block h-(--iframe-height) min-h-56 w-full duration-200 will-change-auto"></iframe> <!>`, 1);
var root_11 = $.from_html(`<div class="theme-container"><!></div>`);
var root_12 = $.from_html(`<section class="group mb-16 border-b [--color-border:color-mix(in_oklab,var(--color-zinc-200)_75%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-zinc-800)_60%,transparent)]"><div class="relative border-y"><div class="absolute inset-x-4 -top-14 bottom-0 mx-auto max-w-7xl lg:inset-x-0"><div class="absolute top-0 bottom-0 left-0 w-px bg-linear-to-b from-transparent to-(--color-border) to-75%"></div> <div class="absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-transparent to-(--color-border) to-75%"></div></div> <div class="relative z-10 mx-auto flex max-w-7xl justify-between py-1.5 pr-6 pl-8 [--color-border:var(--color-zinc-200)] md:py-2 lg:pr-2 lg:pl-6 dark:[--color-border:var(--color-zinc-800)]"><div class="-ml-3 flex items-center gap-2"><!> <!> <!> <span class="hidden text-sm text-muted-foreground lg:block"> </span> <!> <span class="ml-0 text-sm capitalize"> </span></div> <div class="flex items-center gap-2"><!> <!> <!></div></div></div> <div class="relative"><div class="absolute inset-x-4 -bottom-14 mx-auto h-14 max-w-7xl lg:inset-x-0"><div class="absolute top-0 bottom-0 left-0 w-px bg-linear-to-b from-(--color-border)"></div> <div class="absolute top-0 right-0 bottom-0 w-px bg-linear-to-b from-(--color-border)"></div></div> <div class="relative z-10 mx-auto max-w-7xl px-4 lg:border-x lg:px-0"><div><!></div> <div class="bg-secondary! dark:bg-transparent"><!></div></div></div></section>`);

export default function BlockPreview($$anchor, $$props) {
	$.push($$props, true);

	let previewMode = $.prop($$props, 'previewMode', 3, "inline"),
		title = $.prop($$props, 'title', 3, "Hero Section"),
		category = $.prop($$props, 'category', 3, "Components");

	const radioItem = "rounded-(--radius) duration-200 flex items-center justify-center h-8 px-2.5 gap-2 transition-[color] data-[state=checked]:bg-muted";
	const DEFAULT_SIZE = 100;
	const SM_SIZE = 30;
	const MD_SIZE = 62;
	const LG_SIZE = 82;
	let width = $.state(DEFAULT_SIZE);
	let mode = $.state("preview");
	let iframeHeight = $.state(0);
	let isLoading = $.state(true);
	let ref = $.state(undefined);
	let large = new MediaQuery("min-width: 1024px");
	let iframeRef = $.state(null);

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
	let showIframeComp = $.derived(() => previewMode() === "iframe");

	let forcesIframe = $.derived(() => previewMode() === "iframe");
	let shouldRenderInIframe = $.derived(() => $.get(forcesIframe) || $.get(showIframeComp));
	let resolvedIframeHeight = $.derived(() => $$props.previewHeight ?? $.get(iframeHeight));

	function applyIframeScrollbarStyles(iframe) {
		const iframeDocument = iframe?.contentDocument;

		if (!iframeDocument) return;

		iframeDocument.documentElement.classList.add("no-scrollbar");
		iframeDocument.body.classList.add("no-scrollbar");
	}

	watch(() => $.get(forcesIframe), (isForced) => {
		if (isForced && !$.get(showIframeComp)) {
			$.set(showIframeComp, true);
		}
	});

	var section = root_12();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_2();
			var div_3 = $.first_child(fragment);
			var node_1 = $.child(div_3);

			{
				let $0 = $.derived(() => $.get(mode) === "preview" ? "secondary" : "ghost");

				Button(node_1, {
					get variant() {
						return $.get($0);
					},
					size: 'sm',
					onclick: () => $.set(mode, "preview"),
					class: radioItem,
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();

						$.next(2);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(mode) === "code" ? "secondary" : "ghost");

				Button(node_2, {
					get variant() {
						return $.get($0);
					},
					size: 'sm',
					onclick: () => $.set(mode, "code"),
					class: radioItem,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();

						$.next(2);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_3);

			var node_3 = $.sibling(div_3, 2);

			Separator(node_3, { orientation: 'vertical', class: 'hidden h-4! lg:block' });
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.code) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node, 2);

	Button(node_4, {
		variant: 'ghost',
		size: 'sm',
		class: 'size-8',
		get href() {
			return $$props.preview;
		},
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			Maximize($$anchor, { strokeWidth: 1.6, class: 'size-4! sm:opacity-70' });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Separator(node_5, { orientation: 'vertical', class: 'hidden h-4! lg:block' });

	var span = $.sibling(node_5, 2);
	var text = $.only_child(span, true);
	var node_6 = $.sibling(span, 2);

	Separator(node_6, { orientation: 'vertical', class: 'h-4!' });

	var span_1 = $.sibling(node_6, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_7 = $.child(div_4);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_7();
			var node_8 = $.child(div_5);

			TooltipProvider(node_8, {
				delayDuration: 100,
				children: ($$anchor, $$slotProps) => {
					Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_4();
							var node_9 = $.first_child(fragment_5);

							TooltipTrigger(node_9, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: () => {
											if ($.get(ref)) {
												$.get(ref).resize(DEFAULT_SIZE);
											}
										},
										size: 'icon',
										class: 'relative  h-8 w-8 cursor-pointer shadow-none',
										variant: 'outline',
										'aria-label': 'Set to Desktop View',
										children: ($$anchor, $$slotProps) => {
											var svg = root_3();

											$.append($$anchor, svg);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							TooltipContent(node_10, {
								align: 'center',
								class: 'px-2 py-1 text-[10px]',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Laptop');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_8, 2);

			TooltipProvider(node_11, {
				delayDuration: 100,
				children: ($$anchor, $$slotProps) => {
					Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_4();
							var node_12 = $.first_child(fragment_8);

							TooltipTrigger(node_12, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: () => {
											if ($.get(ref)) {
												$.get(ref).resize(MD_SIZE);
											}
										},
										size: 'icon',
										class: 'relative h-8 w-8 cursor-pointer shadow-none',
										variant: 'outline',
										'aria-label': 'Set to Tablet View',
										children: ($$anchor, $$slotProps) => {
											var svg_1 = root_5();

											$.append($$anchor, svg_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							TooltipContent(node_13, {
								align: 'center',
								class: 'px-2 py-1 text-[10px]',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Tablet');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_11, 2);

			TooltipProvider(node_14, {
				delayDuration: 100,
				children: ($$anchor, $$slotProps) => {
					Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_4();
							var node_15 = $.first_child(fragment_11);

							TooltipTrigger(node_15, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										onclick: () => {
											if ($.get(ref)) {
												$.get(ref).resize(SM_SIZE);
											}
										},
										size: 'icon',
										class: 'relative h-8 w-8 cursor-pointer shadow-none',
										variant: 'outline',
										'aria-label': 'Set to Mobile View',
										children: ($$anchor, $$slotProps) => {
											var svg_2 = root_6();

											$.append($$anchor, svg_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							TooltipContent(node_16, {
								align: 'center',
								class: 'px-2 py-1 text-[10px]',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Mobile');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.transition(3, div_5, () => scale, () => ({ start: 0.8 }));
			$.append($$anchor, div_5);
		};

		$.if(node_7, ($$render) => {
			if ($.get(shouldRenderInIframe)) $$render(consequent_1);
		});
	}

	var node_17 = $.sibling(node_7, 2);

	{
		var consequent_2 = ($$anchor) => {
			TooltipProvider($$anchor, {
				delayDuration: 120,
				children: ($$anchor, $$slotProps) => {
					Tooltip($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_4();
							var node_18 = $.first_child(fragment_15);

							TooltipTrigger(node_18, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										size: 'icon',
										onclick: () => {
											$.set(showIframeComp, !$.get(showIframeComp));
										},
										class: 'relative h-8 w-8 cursor-pointer shadow-none',
										variant: 'outline',
										'aria-label': 'Toggle Responsive UI',
										children: ($$anchor, $$slotProps) => {
											var svg_3 = root_8();
											var path = $.child(svg_3);
											var path_1 = $.sibling(path);
											var path_2 = $.sibling(path_1);
											var path_3 = $.sibling(path_2);

											$.reset(svg_3);

											$.template_effect(() => {
												$.set_class(path, 0, $.clsx($.get(showIframeComp)
													? "fill-green-500/10 stroke-green-500"
													: "stroke-primary"));

												$.set_class(path_1, 0, $.clsx($.get(showIframeComp) ? "stroke-green-500" : "stroke-primary"));
												$.set_class(path_2, 0, $.clsx($.get(showIframeComp) ? "stroke-green-500" : "stroke-primary"));
												$.set_class(path_3, 0, $.clsx($.get(showIframeComp) ? "stroke-green-500" : "stroke-primary"));
											});

											$.append($$anchor, svg_3);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_18, 2);

							TooltipContent(node_19, {
								align: 'center',
								class: 'px-2 py-1 text-[10px]',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Responsive UI');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_17, ($$render) => {
			if (!$.get(forcesIframe)) $$render(consequent_2);
		});
	}

	var node_20 = $.sibling(node_17, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_17 = root_4();
			var node_21 = $.first_child(fragment_17);

			PreviewInstallAdd(node_21, {
				get itemId() {
					return $$props.itemId;
				}
			});

			var node_22 = $.sibling(node_21, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_18 = root_4();
					var node_23 = $.first_child(fragment_18);

					Separator(node_23, { class: 'h-4!', orientation: 'vertical' });

					var node_24 = $.sibling(node_23, 2);

					CopyButton(node_24, {
						get text() {
							return $$props.code.code;
						}
					});

					$.append($$anchor, fragment_18);
				};

				var d = $.derived(() => !Array.isArray($$props.code));

				$.if(node_22, ($$render) => {
					if ($.get(d)) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_17);
		};

		$.if(node_20, ($$render) => {
			if ($$props.code) $$render(consequent_4);
		});
	}

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);

	var div_6 = $.sibling(div, 2);
	var div_7 = $.sibling($.child(div_6), 2);
	var div_8 = $.child(div_7);
	var node_25 = $.child(div_8);

	{
		var consequent_7 = ($$anchor) => {
			PaneGroup($$anchor, {
				direction: 'horizontal',
				children: ($$anchor, $$slotProps) => {
					var fragment_20 = root_4();
					var node_26 = $.first_child(fragment_20);

					{
						let $0 = $.derived(() => `block-${title()}`);

						Pane(node_26, {
							get id() {
								return $.get($0);
							},
							order: 1,
							onResize: (size) => {
								$.set(width, Number(size), true);
							},
							defaultSize: DEFAULT_SIZE,
							minSize: SM_SIZE,
							class: 'h-fit border-r',
							get pane() {
								return $.get(ref);
							},

							set pane($$value) {
								$.set(ref, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_21 = root_10();
								var iframe_1 = $.first_child(fragment_21);

								$.bind_this(iframe_1, ($$value) => $.set(iframeRef, $$value), () => $.get(iframeRef));

								var node_27 = $.sibling(iframe_1, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_9 = root_9();

										$.append($$anchor, div_9);
									};

									$.if(node_27, ($$render) => {
										if ($.get(isLoading)) $$render(consequent_5);
									});
								}

								$.template_effect(() => {
									$.set_attribute(iframe_1, 'title', title());
									$.set_attribute(iframe_1, 'height', $.get(resolvedIframeHeight));
									$.set_attribute(iframe_1, 'src', $$props.preview);
									$.set_attribute(iframe_1, 'id', `block-${title()}`);

									$.set_style(iframe_1, `
                --iframe-height: ${$.get(resolvedIframeHeight) ?? ''}px;`);
								});

								$.event('load', iframe_1, () => {
									$.set(isLoading, false);
									applyIframeScrollbarStyles($.get(iframeRef));

									if (!$$props.previewHeight) {
										let contentHeight = $.get(iframeRef)?.contentWindow?.document.body.scrollHeight;

										if (contentHeight) {
											$.set(iframeHeight, contentHeight + 20);
										}
									} else {
										$.set(iframeHeight, $$props.previewHeight, true);
									}
								});

								$.replay_events(iframe_1);
								$.append($$anchor, fragment_21);
							},
							$$slots: { default: true }
						});
					}

					var node_28 = $.sibling(node_26, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_22 = root_4();
							var node_29 = $.first_child(fragment_22);

							PaneResizer(node_29, {
								class: 'relative w-2 before:absolute before:inset-0 before:m-auto before:h-12 before:w-1 before:rounded-full before:bg-zinc-300 before:transition-[height,background] hover:before:h-16 hover:before:bg-zinc-400 focus:before:bg-zinc-400 dark:before:bg-zinc-600 dark:hover:before:bg-zinc-500 dark:focus:before:bg-zinc-400'
							});

							var node_30 = $.sibling(node_29, 2);

							{
								let $0 = $.derived(() => `code-${title()}`);

								Pane(node_30, {
									get id() {
										return $.get($0);
									},
									order: 2,
									defaultSize: 100 - DEFAULT_SIZE,
									class: '-mr-[0.5px] ml-px'
								});
							}

							$.append($$anchor, fragment_22);
						};

						$.if(node_28, ($$render) => {
							if (large) $$render(consequent_6);
						});
					}

					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var div_10 = root_11();
			var node_31 = $.child(div_10);

			$.component(node_31, () => $$props.component, ($$anchor, BlockComponent_1) => {
				BlockComponent_1($$anchor, {});
			});

			$.reset(div_10);
			$.transition(1, div_10, () => scale, () => ({ start: 0.85 }));
			$.append($$anchor, div_10);
		};

		$.if(node_25, ($$render) => {
			if ($.get(shouldRenderInIframe)) $$render(consequent_7); else $$render(alternate, -1);
		});
	}

	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var node_32 = $.child(div_11);

	{
		var consequent_8 = ($$anchor) => {
			CodeEditor($$anchor, {
				get code() {
					return $$props.code;
				}
			});
		};

		$.if(node_32, ($$render) => {
			if ($.get(mode) === "code") $$render(consequent_8);
		});
	}

	$.reset(div_11);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(section);

	$.template_effect(
		($0) => {
			$.set_attribute(section, 'id', `${category() ?? ''}-${title() ?? ''}`);

			$.set_text(text, $.get(width) < MD_SIZE
				? "Mobile"
				: $.get(width) < LG_SIZE ? "Tablet" : "Desktop");

			$.set_text(text_1, category() + " " + title());
			$.set_class(div_8, 1, $0);
		},
		[
			() => $.clsx(cn("bg-white dark:bg-transparent", $.get(mode) === "code" && "hidden"))
		]
	);

	$.append($$anchor, section);
	$.pop();
}