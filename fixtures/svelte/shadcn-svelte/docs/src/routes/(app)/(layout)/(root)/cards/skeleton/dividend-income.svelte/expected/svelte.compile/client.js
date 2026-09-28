import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardAction, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-3 rounded-xl bg-muted p-3"><div class="flex flex-1 flex-col gap-2"><!> <!></div> <div class="hidden h-8 w-24 items-end gap-1 md:flex"></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Dividend_income($$anchor) {
	const rows = [0, 1, 2, 3];
	const miniBars = [40, 60, 80, 50];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-48 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-64 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					CardAction(node_3, {
						children: ($$anchor, $$slotProps) => {
							Skeleton($$anchor, { class: 'size-8 rounded-md' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				children: ($$anchor, $$slotProps) => {
					var div = root_2();

					$.each(div, 20, () => rows, (row) => row, ($$anchor, row) => {
						var div_1 = root_1();
						var div_2 = $.child(div_1);
						var node_5 = $.child(div_2);

						Skeleton(node_5, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });

						var node_6 = $.sibling(node_5, 2);

						Skeleton(node_6, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });
						$.reset(div_2);

						var div_3 = $.sibling(div_2, 2);

						$.each(div_3, 21, () => miniBars, $.index, ($$anchor, h) => {
							{
								let $0 = $.derived(() => `height: ${$.get(h)}%`);

								Skeleton($$anchor, {
									class: 'flex-1 rounded-t-sm rounded-b-none bg-muted-foreground/15',
									get style() {
										return $.get($0);
									}
								});
							}
						});

						$.reset(div_3);

						var node_7 = $.sibling(div_3, 2);

						Skeleton(node_7, {
							class: 'hidden h-4 w-16 rounded-md bg-muted-foreground/15 md:block'
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					});

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}