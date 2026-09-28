import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '../ui/button.svelte';
import Club from '@lucide/svelte/icons/club';
import Diamond from '@lucide/svelte/icons/diamond';
import Heart from '@lucide/svelte/icons/heart';
import Spade from '@lucide/svelte/icons/spade';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

var root = $.from_html(`<div class="bg-secondary text-muted-foreground flex size-10 items-center justify-center rounded-lg text-sm font-medium"></div>`);
var root_1 = $.from_html(`<div class="space-y-3"><div class="space-y-1"><p class="text-[13px] font-medium"> </p> <p class="text-muted-foreground text-xs"> </p></div> <div class="flex items-center justify-between gap-2"><span class="text-muted-foreground text-xs"> </span> <button class="text-xs font-medium hover:underline"> </button></div></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-2 place-items-center gap-4"></div> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Popover_09($$anchor) {
	const tourSteps = [
		{
			description: "This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			icon: Heart,
			title: 'Heart'
		},

		{
			description: 'Use the toolbar above to create new projects, invite team members, or access settings.',
			icon: Diamond,
			title: 'Diamond'
		},

		{
			description: 'Click the support icon in the top right corner to access our help center and documentation.',
			icon: Club,
			title: 'Club'
		},

		{
			description: 'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
			icon: Spade,
			title: 'Spade'
		}
	];

	let currentStep = $.state(0);
	let anchors = $.proxy([]);

	function handleNavigation() {
		if ($.get(currentStep) === tourSteps.length - 1) {
			$.set(currentStep, 0);
		} else {
			$.update(currentStep);
		}
	}

	var div = root_3();
	var node = $.child(div);

	Popover(node, {
		onOpenChange: (open) => {
			if (open) $.set(currentStep, 0);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var div_1 = $.first_child(fragment);

			$.each(div_1, 21, () => tourSteps, $.index, ($$anchor, _, index) => {
				var div_2 = root();

				div_2.textContent = index + 1;
				$.bind_this(div_2, ($$value, index) => anchors[index] = $$value, (index) => anchors?.[index], () => [index]);
				$.append($$anchor, div_2);
			});

			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Start tour');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(currentStep) % 2 === 0 ? 'left' : 'right');

				PopoverContent(node_2, {
					class: 'max-w-[280px] py-3 shadow-none',
					get side() {
						return $.get($0);
					},

					get customAnchor() {
						return anchors[$.get(currentStep)];
					},
					showArrow: true,
					children: ($$anchor, $$slotProps) => {
						var div_3 = root_1();
						var div_4 = $.child(div_3);
						var p = $.child(div_4);
						var text_1 = $.only_child(p, true);
						var p_1 = $.sibling(p, 2);
						var text_2 = $.only_child(p_1, true);

						$.reset(div_4);

						var div_5 = $.sibling(div_4, 2);
						var span = $.child(div_5);
						var text_3 = $.only_child(span);
						var button = $.sibling(span, 2);
						var text_4 = $.only_child(button, true);

						$.reset(div_5);
						$.reset(div_3);

						$.template_effect(() => {
							$.set_text(text_1, tourSteps[$.get(currentStep)].title);
							$.set_text(text_2, tourSteps[$.get(currentStep)].description);
							$.set_text(text_3, `${$.get(currentStep) + 1}/${tourSteps.length ?? ''}`);
							$.set_text(text_4, $.get(currentStep) === tourSteps.length - 1 ? 'Start over' : 'Next');
						});

						$.delegated('click', button, handleNavigation);
						$.append($$anchor, div_3);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}

$.delegate(['click']);