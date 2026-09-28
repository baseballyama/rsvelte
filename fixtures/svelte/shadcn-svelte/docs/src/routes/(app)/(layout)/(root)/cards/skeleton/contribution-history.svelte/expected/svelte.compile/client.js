import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-full flex-1 flex-col justify-end gap-2"><!> <!></div>`);
var root_2 = $.from_html(`<div class="flex h-[200px] w-full items-end gap-3"></div>`);
var root_3 = $.from_html(`<div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2"><div class="flex flex-col gap-2 rounded-xl bg-muted p-4"><!> <!> <!></div> <div class="hidden flex-col gap-2 rounded-xl bg-muted p-4 xl:flex"><!> <!> <!></div></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Contribution_history($$anchor) {
	const bars = [60, 80, 65, 95, 50, 100];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-44 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-52 rounded-md' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				children: ($$anchor, $$slotProps) => {
					var div = root_2();

					$.each(div, 21, () => bars, $.index, ($$anchor, height) => {
						var div_1 = root_1();
						var node_4 = $.child(div_1);

						{
							let $0 = $.derived(() => `height: ${$.get(height)}%`);

							Skeleton(node_4, {
								class: 'w-full rounded-t-md rounded-b-none',
								get style() {
									return $.get($0);
								}
							});
						}

						var node_5 = $.sibling(node_4, 2);

						Skeleton(node_5, { class: 'mx-auto h-3 w-6 rounded-md' });
						$.reset(div_1);
						$.append($$anchor, div_1);
					});

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			CardContent(node_6, {
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_3();
					var div_3 = $.child(div_2);
					var node_7 = $.child(div_3);

					Skeleton(node_7, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });

					var node_8 = $.sibling(node_7, 2);

					Skeleton(node_8, { class: 'h-5 w-28 rounded-md bg-muted-foreground/15' });

					var node_9 = $.sibling(node_8, 2);

					Skeleton(node_9, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_10 = $.child(div_4);

					Skeleton(node_10, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });

					var node_11 = $.sibling(node_10, 2);

					Skeleton(node_11, { class: 'h-5 w-32 rounded-md bg-muted-foreground/15' });

					var node_12 = $.sibling(node_11, 2);

					Skeleton(node_12, { class: 'h-3 w-28 rounded-md bg-muted-foreground/15' });
					$.reset(div_4);
					$.reset(div_2);
					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_6, 2);

			CardFooter(node_13, {
				children: ($$anchor, $$slotProps) => {
					Skeleton($$anchor, { class: 'h-9 w-full rounded-lg' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}