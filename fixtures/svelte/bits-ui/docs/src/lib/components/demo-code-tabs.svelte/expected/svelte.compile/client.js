import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible, Tabs } from "bits-ui";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import Check from "phosphor-svelte/lib/Check";
import { cn } from "$lib/utils/styles.js";
import { useCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";

var root = $.from_html(`<span class="px-4 py-2"> </span>`);
var root_1 = $.from_html(`<div class="flex items-center justify-between border-x-2 pb-2 pt-1"><!> <div class="flex items-center gap-2 border-b-2 border-transparent pr-2 text-sm" data-llm-ignore=""><!> <button aria-label="Copy" data-copy-code=""><!></button></div></div> <div style="display: contents;"><!></div>`, 1);
var root_2 = $.from_html(`<!> <div class="hidden"><!></div>`, 1);

export default function Demo_code_tabs($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		onValueChange = $.prop($$props, 'onValueChange', 3, () => {}),
		expandable = $.prop($$props, 'expandable', 3, true),
		variant = $.prop($$props, 'variant', 3, "preview");

	const copyToClipboard = useCopyToClipboard();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return $$props.value;
			},

			get onValueChange() {
				return onValueChange();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_2 = root_1();
						var div = $.first_child(fragment_2);
						var node_2 = $.child(div);

						$.component(node_2, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								class: 'flex items-center',
								'data-llm-ignore': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.each(node_3, 17, () => $$props.items, (item) => item.value, ($$anchor, item) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
											Tabs_Trigger($$anchor, {
												get value() {
													return $.get(item).value;
												},
												class: 'text-foreground-alt data-[state=active]:border-foreground-alt data-[state=active]:text-foreground flex select-none border-b-2 border-b-transparent  text-sm',
												children: ($$anchor, $$slotProps) => {
													var span = root();
													var text = $.only_child(span, true);

													$.template_effect(() => $.set_text(text, $.get(item).label));
													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var div_1 = $.sibling(node_2, 2);
						var node_5 = $.child(div_1);

						{
							var consequent = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_6 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => cn("text-foreground ring-offset-background hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden hidden select-none items-center justify-center whitespace-nowrap rounded-[7px] px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex"));

									$.component(node_6, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
										Collapsible_Trigger($$anchor, {
											get class() {
												return $.get($0);
											},
											'aria-label': 'Toggle code expansion',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, `${$$props.open ? "Collapse" : "Expand"} Code`));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_5);
							};

							$.if(node_5, ($$render) => {
								if (expandable()) $$render(consequent);
							});
						}

						var button = $.sibling(node_5, 2);
						var node_7 = $.child(button);

						{
							var consequent_1 = ($$anchor) => {
								CopySimple($$anchor, { class: 'size-4' });
							};

							var alternate = ($$anchor) => {
								Check($$anchor, { class: 'size-4' });
							};

							$.if(node_7, ($$render) => {
								if (!copyToClipboard || !copyToClipboard.isCopied) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.reset(button);
						$.reset(div_1);
						$.reset(div);

						var div_2 = $.sibling(div, 2);
						var node_8 = $.child(div_2);

						$.snippet(node_8, () => $$props.children);
						$.reset(div_2);
						$.bind_this(div_2, ($$value) => ref($$value), () => ref());

						$.template_effect(($0) => $.set_class(button, 1, $0), [
							() => $.clsx(cn("text-muted-foreground hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"))
						]);

						$.delegated('click', button, () => copyToClipboard?.copyToClipboard());
						$.append($$anchor, fragment_2);
					};

					var alternate_1 = ($$anchor) => {
						var fragment_9 = root_2();
						var node_9 = $.first_child(fragment_9);

						$.component(node_9, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger_1) => {
							Collapsible_Trigger_1($$anchor, {
								class: 'rounded-b-card text-foreground-alt bg-background hover:bg-muted/15 hover:text-foreground flex w-full items-center justify-center border-2 border-t-0 py-3 text-sm font-medium transition-colors duration-100',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Expand Code');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var div_3 = $.sibling(node_9, 2);
						var node_10 = $.child(div_3);

						$.snippet(node_10, () => $$props.children);
						$.reset(div_3);
						$.append($$anchor, fragment_9);
					};

					$.if(node_1, ($$render) => {
						if (variant() === "preview" || $$props.open) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);