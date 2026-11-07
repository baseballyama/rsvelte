import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpIcon from '@lucide/svelte/icons/chevrons-up';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`<span class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full"> </span> <div class="flex flex-col gap-0.5 leading-none"><span> </span></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Team_switcher($$anchor, $$props) {
	$.push($$props, true);

	let selectedTeam = $.state($.proxy($$props.defaultTeam));

	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'ghost', class: 'p-0 hover:bg-transparent' }, props, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var span = $.first_child(fragment_3);
							var text = $.only_child(span, true);
							var div = $.sibling(span, 2);
							var span_1 = $.child(div);
							var text_1 = $.only_child(span_1, true);

							$.reset(div);

							var node_1 = $.sibling(div, 2);

							ChevronUpIcon(node_1, { size: 14, class: 'text-muted-foreground/80' });

							$.template_effect(
								($0) => {
									$.set_text(text, $0);
									$.set_text(text_1, $.get(selectedTeam));
								},
								[() => $.get(selectedTeam).charAt(0).toUpperCase()]
							);

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node, 2);

			DropdownMenuContent(node_2, {
				align: 'start',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_3 = $.first_child(fragment_4);

					$.each(node_3, 17, () => $$props.teams, $.index, ($$anchor, team) => {
						DropdownMenuItem($$anchor, {
							onSelect: () => {
								$.set(selectedTeam, $.get(team), true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, $.get(team)));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}