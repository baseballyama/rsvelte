import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import Circle from '@lucide/svelte/icons/circle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

var root = $.from_html(`Pan top <kbd class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘T</kbd>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Pan left <kbd class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘L</kbd>`, 1);
var root_3 = $.from_html(`Pan right <kbd class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘R</kbd>`, 1);
var root_4 = $.from_html(`Pan bottom <kbd class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘B</kbd>`, 1);
var root_5 = $.from_html(`<div class="inline-grid w-fit grid-cols-3 gap-1"><!> <!> <div class="flex items-center justify-center" aria-hidden="true"><!></div> <!> <!></div>`);

export default function Tooltip_07($$anchor) {
	var div = root_5();
	var node = $.child(div);

	TooltipProvider(node, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									class: 'col-start-2',
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Pan camera up'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										ChevronUp($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node_1, { child, $$slots: { child: true } });
					}

					var node_2 = $.sibling(node_1, 2);

					TooltipContent(node_2, {
						side: 'top',
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_4 = root();

							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	TooltipProvider(node_3, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_4 = $.first_child(fragment_6);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									class: 'col-start-1',
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Pan camera left'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										ChevronLeft($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node_4, { child, $$slots: { child: true } });
					}

					var node_5 = $.sibling(node_4, 2);

					TooltipContent(node_5, {
						side: 'left',
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_9 = root_2();

							$.next();
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_3, 2);
	var node_6 = $.child(div_1);

	Circle(node_6, { class: 'opacity-60', size: 16 });
	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	TooltipProvider(node_7, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_1();
					var node_8 = $.first_child(fragment_11);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Pan camera right'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										ChevronRight($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node_8, { child, $$slots: { child: true } });
					}

					var node_9 = $.sibling(node_8, 2);

					TooltipContent(node_9, {
						side: 'right',
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_14 = root_3();

							$.next();
							$.append($$anchor, fragment_14);
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

	var node_10 = $.sibling(node_7, 2);

	TooltipProvider(node_10, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_16 = root_1();
					var node_11 = $.first_child(fragment_16);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props(
								{
									class: 'col-start-2',
									variant: 'outline',
									size: 'icon',
									'aria-label': 'Pan camera down'
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										ChevronDown($$anchor, { size: 16, 'aria-hidden': 'true' });
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node_11, { child, $$slots: { child: true } });
					}

					var node_12 = $.sibling(node_11, 2);

					TooltipContent(node_12, {
						side: 'bottom',
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_19 = root_4();

							$.next();
							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}