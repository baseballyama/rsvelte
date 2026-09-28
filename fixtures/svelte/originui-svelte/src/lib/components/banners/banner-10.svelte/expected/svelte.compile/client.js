import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import TicketPercent from '@lucide/svelte/icons/ticket-percent';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<span class="flex h-8 items-center justify-center p-2"> <span class="text-muted-foreground">d</span></span>`);
var root_1 = $.from_html(`<div class="dark bg-muted text-foreground px-4 py-3"><div class="flex gap-2 md:items-center"><div class="flex grow gap-3 md:items-center"><div class="bg-primary/15 flex size-9 shrink-0 items-center justify-center rounded-full max-md:mt-0.5" aria-hidden="true"><!></div> <div class="flex grow flex-col justify-between gap-3 md:flex-row md:items-center"><div class="space-y-0.5"><p class="text-sm font-medium">Black Friday Sale!</p> <p class="text-muted-foreground text-sm">It kicks off today and is available for just 24 hours—don&lsquo;t miss out!</p></div> <div class="flex gap-3 max-md:flex-wrap"><div class="divide-primary-foreground bg-primary/15 flex items-center divide-x rounded-lg text-sm tabular-nums"><!> <span class="flex h-8 items-center justify-center p-2"> <span class="text-muted-foreground">h</span></span> <span class="flex h-8 items-center justify-center p-2"> <span class="text-muted-foreground">m</span></span> <span class="flex h-8 items-center justify-center p-2"> <span class="text-muted-foreground">s</span></span></div> <!></div></div></div> <!></div></div>`);

export default function Banner_10($$anchor, $$props) {
	$.push($$props, true);

	// Setting 9h 45m 24s from now for demo purposes
	const saleEndDate = new Date(Date.now() + 9 * 60 * 60 * 1000 + 45 * 60 * 1000 + 24 * 1000);

	let visible = $.state(true);
	let timeLeft = $.state($.proxy(calculateTimeLeft()));

	function calculateTimeLeft() {
		const difference = saleEndDate.getTime() - new Date().getTime();

		if (difference <= 0) return { days: 0, hours: 0, isExpired: true, minutes: 0, seconds: 0 };

		return {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor(difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
			isExpired: false,
			minutes: Math.floor(difference % (1000 * 60 * 60) / (1000 * 60)),
			seconds: Math.floor(difference % (1000 * 60) / 1000)
		};
	}

	$.user_effect(() => {
		const timer = setInterval(
			() => {
				$.set(timeLeft, calculateTimeLeft(), true);

				if ($.get(timeLeft).isExpired) {
					clearInterval(timer);
				}
			},
			1000
		);

		return () => clearInterval(timer);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			TicketPercent(node_1, { class: 'opacity-80', size: 16 });
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var div_6 = $.child(div_5);
			var node_2 = $.child(div_6);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.child(span);

					$.next();
					$.reset(span);
					$.template_effect(() => $.set_text(text, `${$.get(timeLeft).days ?? ''} `));
					$.append($$anchor, span);
				};

				$.if(node_2, ($$render) => {
					if ($.get(timeLeft).days > 0) $$render(consequent);
				});
			}

			var span_1 = $.sibling(node_2, 2);
			var text_1 = $.child(span_1);

			$.next();
			$.reset(span_1);

			var span_2 = $.sibling(span_1, 2);
			var text_2 = $.child(span_2);

			$.next();
			$.reset(span_2);

			var span_3 = $.sibling(span_2, 2);
			var text_3 = $.child(span_3);

			$.next();
			$.reset(span_3);
			$.reset(div_6);

			var node_3 = $.sibling(div_6, 2);

			Button(node_3, {
				size: 'sm',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Buy now');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_4);
			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			Button(node_4, {
				variant: 'ghost',
				class: 'group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent',
				onclick: () => $.set(visible, false),
				'aria-label': 'Close banner',
				children: ($$anchor, $$slotProps) => {
					X($$anchor, {
						size: 16,
						class: 'opacity-60 transition-opacity group-hover:opacity-100',
						'aria-hidden': 'true'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_1, `${$0 ?? ''} `);
					$.set_text(text_2, `${$1 ?? ''} `);
					$.set_text(text_3, `${$2 ?? ''} `);
				},
				[
					() => $.get(timeLeft).hours.toString().padStart(2, '0'),
					() => $.get(timeLeft).minutes.toString().padStart(2, '0'),
					() => $.get(timeLeft).seconds.toString().padStart(2, '0')
				]
			);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible) && !$.get(timeLeft).isExpired) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}