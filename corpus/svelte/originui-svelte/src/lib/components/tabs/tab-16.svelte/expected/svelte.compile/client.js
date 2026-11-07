import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="relative"><!> <!></span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 1</p>`);
var root_5 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 2</p>`);
var root_6 = $.from_html(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 3</p>`);
var root_7 = $.from_html(`<!> <div class="border-border grow rounded-lg border text-start"><!> <!> <!></div>`, 1);

export default function Tab_16($$anchor) {
	Tabs($$anchor, {
		value: 'tab-1',
		orientation: 'vertical',
		class: 'w-full flex-row',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			TabsList(node, {
				class: 'flex-col',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_1 = $.first_child(fragment_2);

					TooltipProvider(node_1, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							Tooltip($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_2 = $.first_child(fragment_4);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var span = root();

											$.attribute_effect(span, () => ({ ...props() }));

											var node_3 = $.child(span);

											TabsTrigger(node_3, {
												value: 'tab-1',
												class: 'py-3',
												children: ($$anchor, $$slotProps) => {
													House($$anchor, { size: 16, 'aria-hidden': 'true' });
												},
												$$slots: { default: true }
											});

											$.reset(span);
											$.append($$anchor, span);
										};

										TooltipTrigger(node_2, { child, $$slots: { child: true } });
									}

									var node_4 = $.sibling(node_2, 2);

									TooltipContent(node_4, {
										side: 'right',
										class: 'px-2 py-1 text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Overview');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_1, 2);

					TooltipProvider(node_5, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							Tooltip($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_6 = $.first_child(fragment_7);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var span_1 = root();

											$.attribute_effect(span_1, () => ({ ...props() }));

											var node_7 = $.child(span_1);

											TabsTrigger(node_7, {
												value: 'tab-2',
												class: 'group py-3',
												children: ($$anchor, $$slotProps) => {
													var span_2 = root_2();
													var node_8 = $.child(span_2);

													PanelsTopLeft(node_8, { size: 16, 'aria-hidden': 'true' });

													var node_9 = $.sibling(node_8, 2);

													Badge(node_9, {
														class: 'border-background absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[10px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('3');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});

													$.reset(span_2);
													$.append($$anchor, span_2);
												},
												$$slots: { default: true }
											});

											$.reset(span_1);
											$.append($$anchor, span_1);
										};

										TooltipTrigger(node_6, { child, $$slots: { child: true } });
									}

									var node_10 = $.sibling(node_6, 2);

									TooltipContent(node_10, {
										side: 'right',
										class: 'px-2 py-1 text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Repositories');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_5, 2);

					TooltipProvider(node_11, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							Tooltip($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_12 = $.first_child(fragment_9);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var span_3 = root();

											$.attribute_effect(span_3, () => ({ ...props() }));

											var node_13 = $.child(span_3);

											TabsTrigger(node_13, {
												value: 'tab-3',
												class: 'py-3',
												children: ($$anchor, $$slotProps) => {
													Box($$anchor, { size: 16, 'aria-hidden': 'true' });
												},
												$$slots: { default: true }
											});

											$.reset(span_3);
											$.append($$anchor, span_3);
										};

										TooltipTrigger(node_12, { child, $$slots: { child: true } });
									}

									var node_14 = $.sibling(node_12, 2);

									TooltipContent(node_14, {
										side: 'right',
										class: 'px-2 py-1 text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Packages');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_15 = $.child(div);

			TabsContent(node_15, {
				value: 'tab-1',
				children: ($$anchor, $$slotProps) => {
					var p = root_4();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			TabsContent(node_16, {
				value: 'tab-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_5();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			TabsContent(node_17, {
				value: 'tab-3',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_6();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}