import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, P, A } from "flowbite-svelte";
import { ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(
	`Due to its central geographic location in Southern Europe, <!> has historically been home to myriad peoples and cultures. In addition to the various ancient peoples
  dispersed throughout what is now modern-day Italy, the most predominant being the Indo-European Italic peoples who gave the peninsula its name, beginning from the classical era, Phoenicians and Carthaginians
  founded colonies mostly in insular Italy`,
	1
);

var root_1 = $.from_html(`Read more <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-5"><div class="col-span-3 p-3"><div class="space-y-2"><h3 class="text-xl font-medium text-gray-900 dark:text-white">About Italy</h3> <p class="text-gray-500 dark:text-gray-400">Italy is located in the middle of the Mediterranean Sea, in Southern Europe it is also considered part of Western Europe.</p> <!></div></div> <img src="/images/image-1.webp" class="col-span-2 h-full rounded-e-lg" alt="Italy map"/></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Popover_1($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	P(node, {
		weight: 'light',
		color: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			A(node_1, {
				href: '/',
				id: 'popover-image',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Italy');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Popover(node_2, {
		triggeredBy: '#popover-image',
		class: 'w-96 text-sm font-light',
		classes: { content: "p-0" },
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_3 = $.sibling($.child(div_2), 4);

			A(node_3, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root_1();
					var node_4 = $.sibling($.first_child(fragment_2));

					ChevronRightOutline(node_4, { class: 'ms-1.5 h-2 w-2' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div_1);
			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}