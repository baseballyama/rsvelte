import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator } from "flowbite-svelte";
import { CheckCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>`);
var root_1 = $.from_html(`<li class="relative mb-6 w-full"><div class="flex items-center"><!> <!></div> <div class="mt-3"><h3 class="font-medium text-gray-900 dark:text-white"> </h3></div></li>`);
var root_2 = $.from_html(`<ol class="flex items-center"></ol> <ol class="flex items-center"></ol>`, 1);

export default function Stepper($$anchor) {
	var fragment = root_2();
	var ol = $.first_child(fragment);

	$.each(ol, 20, () => [1, 2, 2, 3], $.index, ($$anchor, step, i) => {
		var li = root_1();
		var div = $.child(li);
		var node = $.child(div);

		Indicator(node, {
			size: 'xl',
			color: i < 3 ? undefined : "gray",
			class: `z-10 shrink-0 ring-0 ring-white sm:ring-8 ${i < 3
				? "bg-primary-200 dark:bg-primary-900"
				: "dark:bg-gray-700 dark:ring-gray-900"}`,

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						CheckCircleSolid($$anchor, { class: 'h-6 w-6 text-gray-800 dark:text-gray-300' });
					};

					var alternate = ($$anchor) => {
						CheckCircleSolid($$anchor, { class: 'text-primary-600 dark:text-primary-300 h-6 w-6' });
					};

					$.if(node_1, ($$render) => {
						if (i === 3) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		var node_2 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_1 = root();

				$.append($$anchor, div_1);
			};

			$.if(node_2, ($$render) => {
				if (i < 3) $$render(consequent_1);
			});
		}

		$.reset(div);

		var div_2 = $.sibling(div, 2);
		var h3 = $.child(div_2);
		var text = $.only_child(h3);

		$.reset(div_2);
		$.reset(li);
		$.template_effect(() => $.set_text(text, `Step ${step ?? ''}`));
		$.append($$anchor, li);
	});

	$.reset(ol);

	var ol_1 = $.sibling(ol, 2);

	$.each(ol_1, 20, () => [1, 2, 2, 3], $.index, ($$anchor, step, i) => {
		var li_1 = root_1();
		var div_3 = $.child(li_1);
		var node_3 = $.child(div_3);

		Indicator(node_3, {
			size: 'xl',
			color: i < 3 ? undefined : "gray",
			class: `z-10 shrink-0 ring-0 ring-white sm:ring-8 ${i < 3
				? "bg-primary-200 dark:bg-primary-900"
				: "dark:bg-gray-700 dark:ring-gray-900"}`,

			children: ($$anchor, $$slotProps) => {
				Indicator($$anchor, {
					color: i < 3 ? "orange" : "secondary",
					class: i === 3 ? "dark:bg-gray-300!" : ""
				});
			},
			$$slots: { default: true }
		});

		var node_4 = $.sibling(node_3, 2);

		{
			var consequent_2 = ($$anchor) => {
				var div_4 = root();

				$.append($$anchor, div_4);
			};

			$.if(node_4, ($$render) => {
				if (i < 3) $$render(consequent_2);
			});
		}

		$.reset(div_3);

		var div_5 = $.sibling(div_3, 2);
		var h3_1 = $.child(div_5);
		var text_1 = $.only_child(h3_1);

		$.reset(div_5);
		$.reset(li_1);
		$.template_effect(() => $.set_text(text_1, `Step ${step ?? ''}`));
		$.append($$anchor, li_1);
	});

	$.reset(ol_1);
	$.append($$anchor, fragment);
}