import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let contentEl;

		const actionLabels = {
			"copy-url": "Copy Markdown URL",
			"open-url": "Open Markdown URL",
			"copy-content": "Copy Markdown Content"
		};

		let selectedAction = typeof window !== "undefined" && localStorage.getItem("kener-docs-md-action") || "copy-url";
		let showCheck = false;
		let checkTimeout;

		function getMarkdownUrl() {
			return `${window.location.origin}/docs/raw/${data.slug}.md`;
		}

		function flashCheck() {
			showCheck = true;
			clearTimeout(checkTimeout);

			checkTimeout = setTimeout(
				() => {
					showCheck = false;
				},
				2000
			);
		}

		async function executeAction(action) {
			if (action !== selectedAction) {
				selectedAction = action;

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
					await navigator.clipboard.writeText(data.content || "");
					flashCheck();
					break;
			}
		}

		// Add copy buttons to code blocks after content is rendered
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

		$.head('fwkavo', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.title)} - Documentation</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', data.description || `Documentation for ${data.title}`)}/> <meta property="article:author" content="https://github.com/rajnandan1"/> <link rel="canonical"${$.attr('href', `https://kener.ing/docs/${data.slug}`)}/> <meta property="og:title"${$.attr('content', `${$.stringify(data.title)} - Documentation`)}/> <meta property="og:description"${$.attr('content', data.description || `Documentation for ${data.title}`)}/> <meta property="og:type" content="article"/> <meta property="og:url"${$.attr('content', `https://kener.ing/docs/${data.slug}`)}/> <meta property="og:logo" content="https://kener.ing/logo96.png"/> <meta property="og:image" content="https://kener.ing/og.jpg"/> <meta name="twitter:title"${$.attr('content', `${$.stringify(data.title)} - Documentation`)}/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:description"${$.attr('content', data.description || `Documentation for ${data.title}`)}/> <meta name="twitter:image" content="https://kener.ing/og.jpg"/> ${$.html(`<script type="application/ld+json">${JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Documentation",
						item: "https://kener.ing/docs"
					},

					...data.group
						? [{ "@type": "ListItem", position: 2, name: data.group }]
						: [],

					{
						"@type": "ListItem",
						position: data.group ? 3 : 2,
						name: data.title,
						item: `https://kener.ing/docs/${data.slug}`
					}
				]
			})}</script>`)}`);
		});

		$$renderer.push(`<div class="mx-auto flex justify-between gap-8"><article class="min-w-0 flex-1"><div class="relative mb-8"><span class="text-accent-foreground mb-2 inline-block text-xs font-semibold tracking-wide uppercase">${$.escape(data.group)}</span> <h1 class="text-foreground m-0 text-3xl leading-tight font-bold">${$.escape(data.title)}</h1> `);

		if (data.description) {
			$$renderer.push(`<!--[0--><p class="text-muted-foreground mt-1">${$.escape(data.description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				class: ' absolute top-0 right-0 hidden cursor-pointer sm:flex',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						size: 'sm',
						class: 'cursor-pointer border-r-0 text-xs',
						onclick: () => executeAction(selectedAction),
						children: ($$renderer) => {
							if (showCheck) {
								$$renderer.push('<!--[0-->');
								Check($$renderer, { class: 'size-3' });
							} else if (selectedAction === "open-url") {
								$$renderer.push('<!--[1-->');
								ExternalLink($$renderer, { class: 'size-3' });
							} else {
								$$renderer.push('<!--[-1-->');
								Copy($$renderer, { class: 'size-3' });
							}

							$$renderer.push(`<!--]--> ${$.escape(actionLabels[selectedAction])}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (ButtonGroup.Separator) {
						$$renderer.push('<!--[-->');
						ButtonGroup.Separator($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											props,
											{
												variant: 'outline',
												size: 'icon-sm',
												class: 'cursor-pointer',
												children: ($$renderer) => {
													ChevronDown($$renderer, {});
												},
												$$slots: { default: true }
											}
										]));
									}

									if (DropdownMenu.Trigger) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										align: 'end',
										children: ($$renderer) => {
											if (DropdownMenu.Group) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Group($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onclick: () => executeAction("copy-url"),
																children: ($$renderer) => {
																	Copy($$renderer, { class: 'size-3' });
																	$$renderer.push(`<!----> <span class="text-xs">Copy Markdown URL</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onclick: () => executeAction("open-url"),
																children: ($$renderer) => {
																	ExternalLink($$renderer, { class: 'size-3' });
																	$$renderer.push(`<!----> <span class="text-xs">Open Markdown URL</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onclick: () => executeAction("copy-content"),
																children: ($$renderer) => {
																	Copy($$renderer, { class: 'size-3' });
																	$$renderer.push(`<!----> <span class="text-xs">Copy Markdown Content</span>`);
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

		$$renderer.push(`</div> <div class="prose dark:prose-invert prose-neutral max-w-none">${$.html(data.htmlContent)}</div> `);
		DocsPageNavigation($$renderer, { prevPage: data.prevPage, nextPage: data.nextPage });
		$$renderer.push(`<!----></article> `);
		DocsTableOfContents($$renderer, { items: data.tableOfContents });
		$$renderer.push(`<!----></div>`);
	});
}