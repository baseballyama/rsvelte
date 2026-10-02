import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import * as Command from "$lib/components/ui/command/index.js";
import Search from "@lucide/svelte/icons/search";
import FileText from "@lucide/svelte/icons/file-text";
import Loader2 from "@lucide/svelte/icons/loader-2";
import { onMount, onDestroy } from "svelte";
import clientResolver from "$lib/client/resolver.js";
import { resolve } from "$app/paths";

export default function DocsSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false } = $$props;
		let query = "";
		let results = [];
		let isLoading = false;
		let searchTimeout = null;

		// Keyboard shortcut handler
		function handleKeydown(e) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				open = !open;
			}

			if (e.key === "Escape" && open) {
				open = false;
			}
		}

		onMount(() => {
			document.addEventListener("keydown", handleKeydown);

			return () => {
				document.removeEventListener("keydown", handleKeydown);
			};
		});

		onDestroy(() => {
			if (searchTimeout) clearTimeout(searchTimeout);
		});

		// Debounced search
		async function performSearch(searchQuery) {
			if (searchQuery.trim().length < 2) {
				results = [];

				return;
			}

			isLoading = true;

			try {
				const url = `?q=${encodeURIComponent(searchQuery)}`;
				const response = await fetch(clientResolver(resolve, "/docs/api/search") + url);
				const data = await response.json();

				results = data.results || [];
			} catch(error) {
				console.error("Search error:", error);
				results = [];
			} finally {
				isLoading = false;
			}
		}

		// Watch for query changes with debounce
		// Capture query to track it
		function handleSelect(slug, anchor) {
			open = false;
			query = "";
			results = [];

			const url = anchor ? `/docs/${slug}#${anchor}` : `/docs/${slug}`;

			goto(clientResolver(resolve, url)).then(() => {
				// After navigation, scroll to anchor if present
				if (anchor) {
					// Small delay to ensure DOM is updated
					setTimeout(
						() => {
							const element = document.getElementById(anchor);

							if (element) {
								element.scrollIntoView({ behavior: "smooth", block: "start" });
							}
						},
						100
					);
				}
			});
		}

		function handleOpenChange(isOpen) {
			open = isOpen;

			if (!isOpen) {
				query = "";
				results = [];
			}
		}

		// Group results by their group field
		let groupedResults = $.derived(() => {
			const groups = {};

			for (const result of results) {
				if (!groups[result.group]) {
					groups[result.group] = [];
				}

				groups[result.group].push(result);
			}

			return groups;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.Dialog) {
				$$renderer.push('<!--[-->');

				Command.Dialog($$renderer, {
					title: 'Search Documentation',
					description: 'Search through all documentation pages',
					onOpenChange: handleOpenChange,
					shouldFilter: false,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Command.Input) {
							$$renderer.push('<!--[-->');

							Command.Input($$renderer, {
								placeholder: 'Search documentation...',
								oninput: (e) => {
									query = e.currentTarget.value;
								},

								get value() {
									return query;
								},

								set value($$value) {
									query = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Command.List) {
							$$renderer.push('<!--[-->');

							Command.List($$renderer, {
								children: ($$renderer) => {
									if (isLoading) {
										$$renderer.push('<!--[0-->');

										if (Command.Loading) {
											$$renderer.push('<!--[-->');

											Command.Loading($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center justify-center py-6">`);
													Loader2($$renderer, { class: 'text-muted-foreground h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> <span class="text-muted-foreground ml-2 text-sm">Searching...</span></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else if (query.length >= 2 && results.length === 0) {
										$$renderer.push('<!--[1-->');

										if (Command.Empty) {
											$$renderer.push('<!--[-->');

											Command.Empty($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->No results found for "${$.escape(query)}"`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else if (results.length > 0) {
										$$renderer.push(`<!--[2--><!--[-->`);

										const each_array = $.ensure_array_like(Object.entries(groupedResults()));

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let [group, groupResults] = each_array[$$index_1];

											if (Command.Group) {
												$$renderer.push('<!--[-->');

												Command.Group($$renderer, {
													heading: group,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_1 = $.ensure_array_like(groupResults);

														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
															let result = each_array_1[$$index];

															if (Command.Item) {
																$$renderer.push('<!--[-->');

																Command.Item($$renderer, {
																	value: result.slug + (result.anchor || ""),
																	onSelect: () => handleSelect(result.slug, result.anchor),
																	class: 'cursor-pointer',
																	children: ($$renderer) => {
																		FileText($$renderer, { class: 'text-muted-foreground mr-2 h-4 w-4 shrink-0' });
																		$$renderer.push(`<!----> <div class="flex min-w-0 flex-col gap-0.5"><div class="flex items-center gap-2"><span class="font-medium">${$.escape(result.title)}</span> `);

																		if (result.sectionTitle) {
																			$$renderer.push(`<!--[0--><span class="text-muted-foreground text-xs">› ${$.escape(result.sectionTitle)}</span>`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]--></div> <span class="text-muted-foreground line-clamp-1 text-xs">${$.escape(result.excerpt)}</span></div>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push('<!--[-1-->');

										if (Command.Empty) {
											$$renderer.push('<!--[-->');

											Command.Empty($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<div class="text-muted-foreground flex flex-col items-center py-6">`);
													Search($$renderer, { class: 'mb-2 h-8 w-8 opacity-50' });
													$$renderer.push(`<!----> <span class="text-sm">Type to search documentation</span></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="border-border border-t px-3 py-2"><div class="text-muted-foreground flex items-center justify-between text-xs"><div class="flex items-center gap-2"><kbd class="border-border bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none"><span class="text-xs">↵</span></kbd> <span>to select</span></div> <div class="flex items-center gap-2"><kbd class="border-border bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">esc</kbd> <span>to close</span></div></div></div>`);
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
		$.bind_props($$props, { open });
	});
}