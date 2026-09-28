import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';

let tocItems = $.state($.proxy([]));

export const setTocItems = (items) => {
	$.set(tocItems, items, true);
};

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<div>No contents</div>`);
var root_2 = $.from_html(`<a> </a>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 100,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									class: 'fixed top-1/3 right-2 my-auto flex flex-col gap-2 print:hidden',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.each(node_3, 17, () => $.get(tocItems), (item) => item.id, ($$anchor, item) => {
											var span = root();

											$.template_effect(($0) => $.set_class(span, 1, $0), [
												() => $.clsx(cn('block! h-0.5! w-4 rounded! bg-muted-foreground/50 dark:bg-muted', $.get(item).isActive && 'bg-primary!', $.get(item).level === 1 ? 'w-6' : 'w-4'))
											]);

											$.append($$anchor, span);
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									side: 'left',
									sideOffset: -24,
									align: 'start',
									class: 'flex max-h-120 min-h-8 max-w-56 flex-col items-start gap-1.5 overflow-auto border bg-popover duration-300 fade-in-50 data-[side=left]:slide-in-from-right-30',
									arrowClasses: 'hidden',
									strategy: 'absolute',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												var div = root_1();

												$.append($$anchor, div);
											};

											var alternate = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.each(node_6, 17, () => $.get(tocItems), (item) => item.id, ($$anchor, item) => {
													var a = root_2();
													var text = $.only_child(a, true);

													$.template_effect(
														($0) => {
															$.set_attribute(a, 'href', `#${$.get(item).id}`);
															$.set_class(a, 1, $0);
															$.set_style(a, `padding-left: calc(1rem * ${$.get(item).level - 1});`);
															$.set_text(text, $.get(item).textContent);
														},
														[
															() => $.clsx(cn('nodefault text-sm text-wrap text-foreground transition-all duration-500', $.get(item).isScrolledOver && 'text-muted-foreground italic'))
														]
													);

													$.append($$anchor, a);
												});

												$.append($$anchor, fragment_5);
											};

											$.if(node_5, ($$render) => {
												if ($.get(tocItems) === undefined || $.get(tocItems).length === 0) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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