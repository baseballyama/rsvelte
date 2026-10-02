import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="rounded-md p-1.5 text-center ring ring-border"><div class="text-sm text-muted-foreground"> </div> <div class="relative mt-1 h-16 overflow-hidden rounded-sm bg-muted"><div class="absolute inset-x-0 bottom-0 rounded-sm bg-chart-3"></div></div></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-7 gap-1.5"></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Weekly_fitness_summary($$anchor) {
	const FITNESS_WEEKLY_LOAD = [
		{ day: "M", load: 84 },
		{ day: "T", load: 52 },
		{ day: "W", load: 73 },
		{ day: "T", load: 66 },
		{ day: "F", load: 91 },
		{ day: "S", load: 48 },
		{ day: "S", load: 61 }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Weekly Fitness Summary');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Calories and workout load by day');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var div = root_2();

							$.each(div, 21, () => FITNESS_WEEKLY_LOAD, $.index, ($$anchor, $$item) => {
								let day = () => $.get($$item).day;
								let load = () => $.get($$item).load;
								var div_1 = root_1();
								var div_2 = $.child(div_1);
								var text_2 = $.only_child(div_2, true);
								var div_3 = $.sibling(div_2, 2);
								var div_4 = $.only_child(div_3);

								$.reset(div_1);

								$.template_effect(() => {
									$.set_text(text_2, day());
									$.set_style(div_4, `height: ${load() ?? ''}%`);
								});

								$.append($$anchor, div_1);
							});

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('View details');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
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
}