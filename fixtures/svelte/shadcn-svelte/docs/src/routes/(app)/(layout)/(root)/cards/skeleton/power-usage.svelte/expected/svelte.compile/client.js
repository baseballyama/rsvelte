import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-full flex-1 flex-col justify-end gap-1.5"><!> <!></div>`);
var root_2 = $.from_html(`<div class="flex h-[140px] w-full items-end gap-2"></div> <!> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-1.5"><!> <!></div> <div class="flex flex-col gap-1.5"><!> <!></div></div>`, 1);
var root_3 = $.from_html(`<!> <div class="flex w-full items-center gap-2"><!> <!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Power_usage($$anchor) {
	const bars = [30, 70, 80, 60, 90, 75, 100, 85];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-32 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-24 rounded-md' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				class: 'flex flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var div = $.first_child(fragment_3);

					$.each(div, 21, () => bars, $.index, ($$anchor, height) => {
						var div_1 = root_1();
						var node_4 = $.child(div_1);

						{
							let $0 = $.derived(() => `height: ${$.get(height)}%`);

							Skeleton(node_4, {
								class: 'w-full rounded-t rounded-b-none',
								get style() {
									return $.get($0);
								}
							});
						}

						var node_5 = $.sibling(node_4, 2);

						Skeleton(node_5, { class: 'mx-auto h-3 w-5 rounded-md' });
						$.reset(div_1);
						$.append($$anchor, div_1);
					});

					$.reset(div);

					var node_6 = $.sibling(div, 2);

					Skeleton(node_6, { class: 'h-px w-full rounded-none' });

					var div_2 = $.sibling(node_6, 2);
					var div_3 = $.child(div_2);
					var node_7 = $.child(div_3);

					Skeleton(node_7, { class: 'h-3 w-28 rounded-md' });

					var node_8 = $.sibling(node_7, 2);

					Skeleton(node_8, { class: 'h-5 w-20 rounded-md' });
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_9 = $.child(div_4);

					Skeleton(node_9, { class: 'h-3 w-20 rounded-md' });

					var node_10 = $.sibling(node_9, 2);

					Skeleton(node_10, { class: 'h-5 w-24 rounded-md' });
					$.reset(div_4);
					$.reset(div_2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_3, 2);

			CardFooter(node_11, {
				class: 'flex-col items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_12 = $.first_child(fragment_4);

					Skeleton(node_12, { class: 'h-3 w-24 rounded-md' });

					var div_5 = $.sibling(node_12, 2);
					var node_13 = $.child(div_5);

					Skeleton(node_13, { class: 'h-2 flex-1 rounded-full' });

					var node_14 = $.sibling(node_13, 2);

					Skeleton(node_14, { class: 'h-3 w-10 rounded-md' });
					$.reset(div_5);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}