import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import * as Command from "$lib/components/ui/command/index.js";
import Search from "@lucide/svelte/icons/search";
import FileText from "@lucide/svelte/icons/file-text";
import Loader2 from "@lucide/svelte/icons/loader-2";
import { onMount, onDestroy } from "svelte";
import clientResolver from "$lib/client/resolver.js";
import { resolve } from "$app/paths";

var root = $.from_html(`<div class="flex items-center justify-center py-6"><!> <span class="text-muted-foreground ml-2 text-sm">Searching...</span></div>`);
var root_1 = $.from_html(`<span class="text-muted-foreground text-xs"> </span>`);
var root_2 = $.from_html(`<!> <div class="flex min-w-0 flex-col gap-0.5"><div class="flex items-center gap-2"><span class="font-medium"> </span> <!></div> <span class="text-muted-foreground line-clamp-1 text-xs"> </span></div>`, 1);
var root_3 = $.from_html(`<div class="text-muted-foreground flex flex-col items-center py-6"><!> <span class="text-sm">Type to search documentation</span></div>`);
var root_4 = $.from_html(`<!> <!> <div class="border-border border-t px-3 py-2"><div class="text-muted-foreground flex items-center justify-between text-xs"><div class="flex items-center gap-2"><kbd class="border-border bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none"><span class="text-xs">↵</span></kbd> <span>to select</span></div> <div class="flex items-center gap-2"><kbd class="border-border bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">esc</kbd> <span>to close</span></div></div></div>`, 1);

export default function DocsSearch($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false);
	let query = $.state("");
	let results = $.state($.proxy([]));
	let isLoading = $.state(false);
	let searchTimeout = null;

	// Keyboard shortcut handler
	function handleKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			open(!open());
		}

		if (e.key === "Escape" && open()) {
			open(false);
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
			$.set(results, [], true);

			return;
		}

		$.set(isLoading, true);

		try {
			const url = `?q=${encodeURIComponent(searchQuery)}`;
			const response = await fetch(clientResolver(resolve, "/docs/api/search") + url);
			const data = await response.json();

			$.set(results, data.results || [], true);
		} catch(error) {
			console.error("Search error:", error);
			$.set(results, [], true);
		} finally {
			$.set(isLoading, false);
		}
	}

	// Watch for query changes with debounce
	$.user_effect(() => {
		const currentQuery = $.get(query // Capture query to track it
		);

		if (searchTimeout) clearTimeout(searchTimeout);

		if (currentQuery.trim().length >= 2) {
			searchTimeout = setTimeout(
				() => {
					performSearch(currentQuery);
				},
				200
			);
		} else {
			$.set(results, [], true);
		}
	});

	function handleSelect(slug, anchor) {
		open(false);
		$.set(query, "");
		$.set(results, [], true);

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
		open(isOpen);

		if (!isOpen) {
			$.set(query, "");
			$.set(results, [], true);
		}
	}

	// Group results by their group field
	let groupedResults = $.derived(() => {
		const groups = {};

		for (const result of $.get(results)) {
			if (!groups[result.group]) {
				groups[result.group] = [];
			}

			groups[result.group].push(result);
		}

		return groups;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Dialog, ($$anchor, Command_Dialog) => {
		Command_Dialog($$anchor, {
			title: 'Search Documentation',
			description: 'Search through all documentation pages',
			onOpenChange: handleOpenChange,
			shouldFilter: false,
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						placeholder: 'Search documentation...',
						oninput: (e) => {
							$.set(query, e.currentTarget.value, true);
						},

						get value() {
							return $.get(query);
						},

						set value($$value) {
							$.set(query, $$value, true);
						}
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Command.Loading, ($$anchor, Command_Loading) => {
										Command_Loading($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var div = root();
												var node_5 = $.child(div);

												Loader2(node_5, { class: 'text-muted-foreground h-4 w-4 animate-spin' });
												$.next(2);
												$.reset(div);
												$.append($$anchor, div);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								};

								var consequent_1 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Command.Empty, ($$anchor, Command_Empty) => {
										Command_Empty($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, `No results found for "${$.get(query) ?? ''}"`));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								var consequent_3 = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_7 = $.first_child(fragment_6);

									$.each(node_7, 17, () => Object.entries($.get(groupedResults)), ([group, groupResults]) => group, ($$anchor, $$item) => {
										var $$array = $.derived(() => $.to_array($.get($$item), 2));
										let group = () => $.get($$array)[0];
										let groupResults = () => $.get($$array)[1];
										var fragment_7 = $.comment();
										var node_8 = $.first_child(fragment_7);

										$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
											Command_Group($$anchor, {
												get heading() {
													return group();
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_9 = $.first_child(fragment_8);

													$.each(node_9, 17, groupResults, (result) => result.slug + (result.anchor || ""), ($$anchor, result) => {
														var fragment_9 = $.comment();
														var node_10 = $.first_child(fragment_9);

														{
															let $0 = $.derived(() => $.get(result).slug + ($.get(result).anchor || ""));

															$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																Command_Item($$anchor, {
																	get value() {
																		return $.get($0);
																	},
																	onSelect: () => handleSelect($.get(result).slug, $.get(result).anchor),
																	class: 'cursor-pointer',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_2();
																		var node_11 = $.first_child(fragment_10);

																		FileText(node_11, { class: 'text-muted-foreground mr-2 h-4 w-4 shrink-0' });

																		var div_1 = $.sibling(node_11, 2);
																		var div_2 = $.child(div_1);
																		var span = $.child(div_2);
																		var text_1 = $.only_child(span, true);
																		var node_12 = $.sibling(span, 2);

																		{
																			var consequent_2 = ($$anchor) => {
																				var span_1 = root_1();
																				var text_2 = $.only_child(span_1);

																				$.template_effect(() => $.set_text(text_2, `› ${$.get(result).sectionTitle ?? ''}`));
																				$.append($$anchor, span_1);
																			};

																			$.if(node_12, ($$render) => {
																				if ($.get(result).sectionTitle) $$render(consequent_2);
																			});
																		}

																		$.reset(div_2);

																		var span_2 = $.sibling(div_2, 2);
																		var text_3 = $.only_child(span_2, true);

																		$.reset(div_1);

																		$.template_effect(() => {
																			$.set_text(text_1, $.get(result).title);
																			$.set_text(text_3, $.get(result).excerpt);
																		});

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_9);
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									});

									$.append($$anchor, fragment_6);
								};

								var alternate = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_13 = $.first_child(fragment_11);

									$.component(node_13, () => Command.Empty, ($$anchor, Command_Empty_1) => {
										Command_Empty_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var div_3 = root_3();
												var node_14 = $.child(div_3);

												Search(node_14, { class: 'mb-2 h-8 w-8 opacity-50' });
												$.next(2);
												$.reset(div_3);
												$.append($$anchor, div_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								};

								$.if(node_3, ($$render) => {
									if ($.get(isLoading)) $$render(consequent); else if ($.get(query).length >= 2 && $.get(results).length === 0) $$render(consequent_1, 1); else if ($.get(results).length > 0) $$render(consequent_3, 2); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}