import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_html(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium"> </p> <p class="text-muted-foreground text-xs"> </p></div> <div class="flex items-center justify-between"><span class="text-muted-foreground text-xs"> </span> <div class="flex gap-0.5"><!> <!></div></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Popover_06($$anchor) {
	const tips = [
		{
			description: "This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			title: 'Welcome to Dashboard'
		},

		{
			description: 'Use the toolbar above to create new projects, invite team members, or access settings.',
			title: 'Quick Actions'
		},

		{
			description: 'Click the support icon in the top right corner to access our help center and documentation.',
			title: 'Need Help?'
		},

		{
			description: 'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
			title: 'Keyboard Shortcuts'
		},

		{
			description: 'Enable notifications to receive updates about your projects, team activity, and important deadlines.',
			title: 'Stay Updated'
		}
	];

	let currentTip = $.state(0);

	function handleNext() {
		if ($.get(currentTip) < tips.length - 1) {
			$.update(currentTip);
		}
	}

	function handlePrev() {
		if ($.get(currentTip) > 0) {
			$.update(currentTip, -1);
		}
	}

	const isFirstTip = $.derived(() => $.get(currentTip) === 0);
	const isLastTip = $.derived(() => $.get(currentTip) === tips.length - 1);

	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Tooltip-like with steps');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node, { child, $$slots: { child: true } });
			}

			var node_1 = $.sibling(node, 2);

			PopoverContent(node_1, {
				class: 'max-w-[280px] py-3 shadow-none',
				side: 'top',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var p = $.child(div_1);
					var text_1 = $.only_child(p, true);
					var p_1 = $.sibling(p, 2);
					var text_2 = $.only_child(p_1, true);

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var span = $.child(div_2);
					var text_3 = $.only_child(span);
					var div_3 = $.sibling(span, 2);
					var node_2 = $.child(div_3);

					Button(node_2, {
						size: 'icon',
						variant: 'ghost',
						class: 'size-6',
						onclick: handlePrev,
						get disabled() {
							return $.get(isFirstTip);
						},
						'aria-label': 'Previous tip',
						children: ($$anchor, $$slotProps) => {
							ArrowLeft($$anchor, { size: 14, 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						size: 'icon',
						variant: 'ghost',
						class: 'size-6',
						onclick: handleNext,
						get disabled() {
							return $.get(isLastTip);
						},
						'aria-label': 'Next tip',
						children: ($$anchor, $$slotProps) => {
							ArrowRight($$anchor, { size: 14, 'aria-hidden': 'true' });
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.reset(div_2);
					$.reset(div);

					$.template_effect(() => {
						$.set_text(text_1, tips[$.get(currentTip)].title);
						$.set_text(text_2, tips[$.get(currentTip)].description);
						$.set_text(text_3, `${$.get(currentTip) + 1}/${tips.length ?? ''}`);
					});

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}