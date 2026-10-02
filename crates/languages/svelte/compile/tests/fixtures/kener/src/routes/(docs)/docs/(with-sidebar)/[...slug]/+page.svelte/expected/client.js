import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsTableOfContents from "../../DocsTableOfContents.svelte";
import DocsPageNavigation from "../../DocsPageNavigation.svelte";
import Copy from "@lucide/svelte/icons/copy";
import Check from "@lucide/svelte/icons/check";
import ExternalLink from "@lucide/svelte/icons/external-link";
import { Button } from "$lib/components/ui/button/index.js";
import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { afterNavigate } from "$app/navigation";

var root = $.from_html(`<meta name="description"/> <meta property="article:author" content="https://github.com/rajnandan1"/> <link rel="canonical"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:type" content="article"/> <meta property="og:url"/> <meta property="og:logo" content="https://kener.ing/logo96.png"/> <meta property="og:image" content="https://kener.ing/og.jpg"/> <meta name="twitter:title"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:description"/> <meta name="twitter:image" content="https://kener.ing/og.jpg"/> <!>`, 1);
var root_1 = $.from_html(`<p class="text-muted-foreground mt-1"> </p>`);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<!> <span class="text-xs">Copy Markdown URL</span>`, 1);
var root_4 = $.from_html(`<!> <span class="text-xs">Open Markdown URL</span>`, 1);
var root_5 = $.from_html(`<!> <span class="text-xs">Copy Markdown Content</span>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="mx-auto flex justify-between gap-8"><article class=" min-w-0 flex-1"><div class="relative mb-8"><span class="text-accent-foreground mb-2 inline-block text-xs font-semibold tracking-wide uppercase"> </span> <h1 class="text-foreground m-0 text-3xl leading-tight font-bold"> </h1> <!> <!></div> <div class="prose dark:prose-invert prose-neutral max-w-none"></div> <!></article> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let contentEl;

	const actionLabels = {
		"copy-url": "Copy Markdown URL",
		"open-url": "Open Markdown URL",
		"copy-content": "Copy Markdown Content"
	};

	let selectedAction = $.state($.proxy(typeof window !== "undefined" && localStorage.getItem("kener-docs-md-action") || "copy-url"));
	let showCheck = $.state(false);
	let checkTimeout;

	function getMarkdownUrl() {
		return `${window.location.origin}/docs/raw/${$$props.data.slug}.md`;
	}

	function flashCheck() {
		$.set(showCheck, true);
		clearTimeout(checkTimeout);

		checkTimeout = setTimeout(
			() => {
				$.set(showCheck, false);
			},
			2000
		);
	}

	async function executeAction(action) {
		if (action !== $.get(selectedAction)) {
			$.set(selectedAction, action, true);

			if (typeof window !== "undefined") {
				localStorage.setItem("kener-docs-md-action", action);
			}
		}

		switch (action) {
			case "copy-url":
				await navigator.clipboard.writeText(getMarkdownUrl());
				flashCheck();
				break;

			case "open-url":
				window.open(getMarkdownUrl(), "_blank");
				break;

			case "copy-content":
				await navigator.clipboard.writeText($$props.data.content || "");
				flashCheck();
				break;
		}
	}

	// Add copy buttons to code blocks after content is rendered
	$.user_effect(() => {});

	afterNavigate(() => {
		if (!contentEl) return;

		const codeBlocks = contentEl.querySelectorAll("pre");

		codeBlocks.forEach((pre) => {
			// Skip if already has a copy button
			if (pre.querySelector(".copy-code-btn")) return;

			// Make pre relative for button positioning
			pre.style.position = "relative";

			// Create copy button
			const btn = document.createElement("button");

			btn.className = "copy-code-btn";
			btn.setAttribute("aria-label", "Copy code");
			btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

			btn.onclick = async () => {
				const code = pre.querySelector("code");

				if (code) {
					await navigator.clipboard.writeText(code.textContent || "");
					btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
					btn.classList.add("copied");

					setTimeout(
						() => {
							btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
							btn.classList.remove("copied");
						},
						2000
					);
				}
			};

			pre.appendChild(btn);
		});

		// Add anchor links to headings
		const headings = contentEl.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]");

		headings.forEach((heading) => {
			// Skip if already has an anchor link
			if (heading.querySelector(".heading-anchor")) return;

			// Make heading relative for anchor positioning
			heading.style.position = "relative";

			// Create anchor link button
			const anchor = document.createElement("a");

			anchor.className = "heading-anchor";
			anchor.href = `#${heading.id}`;
			anchor.setAttribute("aria-label", "Copy link to section");
			anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

			anchor.onclick = async (e) => {
				e.preventDefault();

				const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;

				await navigator.clipboard.writeText(url);
				anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
				anchor.classList.add("copied");

				setTimeout(
					() => {
						anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
						anchor.classList.remove("copied");
					},
					2000
				);
			};

			heading.insertBefore(anchor, heading.firstChild);
		});
	});

	var div = root_8();

	$.head('fwkavo', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var link = $.sibling(meta, 4);
		var meta_1 = $.sibling(link, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 4);
		var meta_4 = $.sibling(meta_3, 6);
		var meta_5 = $.sibling(meta_4, 4);
		var node = $.sibling(meta_5, 4);

		$.html(node, () => `<script type="application/ld+json">${JSON.stringify({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Documentation",
					item: "https://kener.ing/docs"
				},

				...$$props.data.group
					? [
						{ "@type": "ListItem", position: 2, name: $$props.data.group }
					]
					: [],

				{
					"@type": "ListItem",
					position: $$props.data.group ? 3 : 2,
					name: $$props.data.title,
					item: `https://kener.ing/docs/${$$props.data.slug}`
				}
			]
		})}</script>`);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $$props.data.description || `Documentation for ${$$props.data.title}`);
			$.set_attribute(link, 'href', `https://kener.ing/docs/${$$props.data.slug}`);
			$.set_attribute(meta_1, 'content', `${$$props.data.title ?? ''} - Documentation`);
			$.set_attribute(meta_2, 'content', $$props.data.description || `Documentation for ${$$props.data.title}`);
			$.set_attribute(meta_3, 'content', `https://kener.ing/docs/${$$props.data.slug}`);
			$.set_attribute(meta_4, 'content', `${$$props.data.title ?? ''} - Documentation`);
			$.set_attribute(meta_5, 'content', $$props.data.description || `Documentation for ${$$props.data.title}`);
		});

		$.deferred_template_effect(() => {
			$.document.title = `${$$props.data.title ?? ''} - Documentation`;
		});

		$.append($$anchor, fragment);
	});

	var article = $.child(div);
	var div_1 = $.child(article);
	var span = $.child(div_1);
	var text = $.only_child(span, true);
	var h1 = $.sibling(span, 2);
	var text_1 = $.only_child(h1, true);
	var node_1 = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text_2 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_2, $$props.data.description));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($$props.data.description) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			class: ' absolute top-0 right-0 hidden cursor-pointer sm:flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_3 = $.first_child(fragment_1);

				Button(node_3, {
					variant: 'outline',
					size: 'sm',
					class: 'cursor-pointer border-r-0 text-xs',
					onclick: () => executeAction($.get(selectedAction)),
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								Check($$anchor, { class: 'size-3' });
							};

							var consequent_2 = ($$anchor) => {
								ExternalLink($$anchor, { class: 'size-3' });
							};

							var alternate = ($$anchor) => {
								Copy($$anchor, { class: 'size-3' });
							};

							$.if(node_4, ($$render) => {
								if ($.get(showCheck)) $$render(consequent_1); else if ($.get(selectedAction) === "open-url") $$render(consequent_2, 1); else $$render(alternate, -1);
							});
						}

						var text_3 = $.sibling(node_4);

						$.template_effect(() => $.set_text(text_3, ` ${actionLabels[$.get(selectedAction)] ?? ''}`));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => ButtonGroup.Separator, ($$anchor, ButtonGroup_Separator) => {
					ButtonGroup_Separator($$anchor, {});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
					DropdownMenu_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_7();
							var node_7 = $.first_child(fragment_6);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props(props, {
										variant: 'outline',
										size: 'icon-sm',
										class: 'cursor-pointer',
										children: ($$anchor, $$slotProps) => {
											ChevronDown($$anchor, {});
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_7, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
									DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									align: 'end',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_9 = $.first_child(fragment_9);

										$.component(node_9, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
											DropdownMenu_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_6();
													var node_10 = $.first_child(fragment_10);

													$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															onclick: () => executeAction("copy-url"),
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_3();
																var node_11 = $.first_child(fragment_11);

																Copy(node_11, { class: 'size-3' });
																$.next(2);
																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													var node_12 = $.sibling(node_10, 2);

													$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															onclick: () => executeAction("open-url"),
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root_4();
																var node_13 = $.first_child(fragment_12);

																ExternalLink(node_13, { class: 'size-3' });
																$.next(2);
																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_12, 2);

													$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
														DropdownMenu_Item_2($$anchor, {
															onclick: () => executeAction("copy-content"),
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_5();
																var node_15 = $.first_child(fragment_13);

																Copy(node_15, { class: 'size-3' });
																$.next(2);
																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.html(div_2, () => $$props.data.htmlContent, true);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => contentEl = $$value, () => contentEl);

	var node_16 = $.sibling(div_2, 2);

	DocsPageNavigation(node_16, {
		get prevPage() {
			return $$props.data.prevPage;
		},

		get nextPage() {
			return $$props.data.nextPage;
		}
	});

	$.reset(article);

	var node_17 = $.sibling(article, 2);

	DocsTableOfContents(node_17, {
		get items() {
			return $$props.data.tableOfContents;
		}
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.data.group);
		$.set_text(text_1, $$props.data.title);
	});

	$.append($$anchor, div);
	$.pop();
}