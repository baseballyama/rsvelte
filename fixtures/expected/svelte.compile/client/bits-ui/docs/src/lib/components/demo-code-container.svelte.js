import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible, Tabs } from "bits-ui";
import DemoCodeTabs from "./demo-code-tabs.svelte";
import AppCSS from "./code-renders/app-css.svelte";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { cn } from "$lib/utils/styles.js";
import { useCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";
import { watch } from "runed";

var root = $.from_html(`<div><!></div>`);

export default function Demo_code_container($$anchor, $$props) {
	$.push($$props, true);

	let fileName = $.prop($$props, 'fileName', 3, "app.svelte"),
		nonExpandableItems = $.prop($$props, 'nonExpandableItems', 19, () => []),
		variant = $.prop($$props, 'variant', 3, "preview");

	const items = $.derived(() => [
		{ label: fileName(), value: fileName() },
		{ label: "app.css", value: "app.css" }
	]);

	let open = $.state(false);
	let activeValue = $.state($.proxy(fileName()));
	let codeWrapper = $.state(null);
	const expandable = $.derived(() => !nonExpandableItems().includes($.get(activeValue)));
	const copyToClipboard = useCopyToClipboard();

	watch([() => $.get(activeValue), () => $.get(codeWrapper)], () => {
		if (!$.get(codeWrapper)) return;

		copyToClipboard?.setCodeString($.get(codeWrapper).innerText.trim() ?? "");
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				DemoCodeTabs($$anchor, {
					get items() {
						return $.get(items);
					},

					get value() {
						return $.get(activeValue);
					},

					onValueChange: (v) => {
						$.set(activeValue, v, true);
					},

					get expandable() {
						return $.get(expandable);
					},

					get variant() {
						return variant();
					},

					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					get ref() {
						return $.get(codeWrapper);
					},

					set ref($$value) {
						$.set(codeWrapper, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(item).value === "app.css" ? "" : undefined);

								$.component(node_2, () => Tabs.Content, ($$anchor, Tabs_Content) => {
									Tabs_Content($$anchor, {
										get value() {
											return $.get(item).value;
										},
										class: 'rounded-b-card bg-background relative overflow-hidden border-x-2 border-b-2',
										get 'data-llm-ignore'() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
												Collapsible_Content($$anchor, {
													forceMount: true,
													children: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(() => cn("h-full max-h-fit min-h-80 w-full py-0", !$.get(open) && "max-h-80!", $$props.class));

															ScrollArea($$anchor, {
																get class() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	var div = root();
																	var node_4 = $.child(div);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_6 = $.comment();
																			var node_5 = $.first_child(fragment_6);

																			$.snippet(node_5, () => $$props.children);
																			$.append($$anchor, fragment_6);
																		};

																		var consequent_1 = ($$anchor) => {
																			AppCSS($$anchor, {});
																		};

																		$.if(node_4, ($$render) => {
																			if ($.get(item).value === fileName()) $$render(consequent); else if ($.get(item).value === "app.css") $$render(consequent_1, 1);
																		});
																	}

																	$.reset(div);

																	$.template_effect(($0) => $.set_class(div, 1, $0), [
																		() => $.clsx(cn("[&_pre]:my-0! [&_pre]:mt-0! [&_pre]:rounded-none! [&_pre]:rounded-tl-none! [&_pre]:rounded-tr-none! [&_pre]:rounded-b-none! [&_pre]:border-t-0! [&_pre]:border-none! [&_pre]:px-2! [&_pre]:pt-2! [&_pre]:pb-5! w-full", $$props.class))
																	]);

																	$.append($$anchor, div);
																},
																$$slots: { default: true }
															});
														}
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}