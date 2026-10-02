import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

var root = $.from_html(`<h2 class="mb-2 text-sm font-semibold">Send us feedback</h2> <form class="space-y-3"><!> <div class="flex flex-col sm:flex-row sm:justify-end"><!></div></form>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Popover_08($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Popover(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Feedback');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				PopoverTrigger(node_1, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			PopoverContent(node_2, {
				class: 'w-72',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var form = $.sibling($.first_child(fragment_2), 2);
					var node_3 = $.child(form);

					Textarea(node_3, {
						id: 'feedback',
						placeholder: 'How can we improve Origin UI?',
						'aria-label': 'Send feedback'
					});

					var div_1 = $.sibling(node_3, 2);
					var node_4 = $.child(div_1);

					Button(node_4, {
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Send feedback');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_1);
					$.reset(form);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}