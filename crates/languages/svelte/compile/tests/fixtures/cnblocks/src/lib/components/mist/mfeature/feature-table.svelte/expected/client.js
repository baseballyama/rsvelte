import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<tr class="*:border *:p-2"><td> </td><td> </td><td><span> </span></td><td><div class="text-title flex items-center gap-2"><div class="size-6 overflow-hidden rounded-full"><img width="120" height="120" loading="lazy"/></div> <span class="text-foreground"> </span></div></td><td> </td></tr>`);
var root_1 = $.from_html(`<div><div class="mb-6"><div class="flex gap-1.5"><div class="size-2 rounded-full border border-black/5 bg-muted"></div> <div class="size-2 rounded-full border border-black/5 bg-muted"></div> <div class="size-2 rounded-full border border-black/5 bg-muted"></div></div> <div class="mt-3 text-lg font-medium">Customers</div> <p class="mt-1 text-sm">New users by First user primary channel group (Default Channel Group)</p></div> <table class="w-max table-auto border-collapse lg:w-full" data-rounded="medium"><thead class="bg-gray-950/5 dark:bg-background"><tr class="*:border *:p-3 *:text-left *:text-sm *:font-medium"><th class="rounded-l-[--card-radius]">#</th><th>Date</th><th>Status</th><th>Customer</th><th class="rounded-r-[--card-radius]">Revenue</th></tr></thead><tbody class="text-sm"></tbody></table></div>`);

export default function Feature_table($$anchor, $$props) {
	$.push($$props, true);

	const AIDEN_BLESER = "https://avatars.githubusercontent.com/u/117548273?v=4";
	const BHIDE_SVELTE = "https://avatars.githubusercontent.com/u/93428946?v=4";
	const RICH_HARRIS = "https://avatars.githubusercontent.com/u/1162160?v=4";
	const HUNTER_JOHNSTON = "https://avatars.githubusercontent.com/u/64506580?v=4";

	const customers = [
		{
			id: 1,
			date: "10/31/2023",
			status: "Paid",
			statusVariant: "success",
			name: "Aiden Blesser",
			avatar: AIDEN_BLESER,
			revenue: "$410"
		},

		{
			id: 2,
			date: "10/21/2023",
			status: "Ref",
			statusVariant: "warning",
			name: "Rich Harris",
			avatar: RICH_HARRIS,
			revenue: "$5173"
		},

		{
			id: 3,
			date: "10/15/2023",
			status: "Paid",
			statusVariant: "success",
			name: "Hunter Johnston",
			avatar: HUNTER_JOHNSTON,
			revenue: "$450"
		},

		{
			id: 4,
			date: "10/12/2023",
			status: "Cancelled",
			statusVariant: "danger",
			name: "Bhide Svelte",
			avatar: BHIDE_SVELTE,
			revenue: "$916"
		}
	];

	let _class = $.prop($$props, 'class', 3, "");
	var div = root_1();
	var table = $.sibling($.child(div), 2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => customers, $.index, ($$anchor, customer) => {
		var tr = root();
		var td = $.child(tr);
		var text = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var span = $.child(td_2);
		var text_2 = $.only_child(span, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var div_1 = $.child(td_3);
		var div_2 = $.child(div_1);
		var img = $.only_child(div_2);
		var span_1 = $.sibling(div_2, 2);
		var text_3 = $.only_child(span_1, true);

		$.reset(div_1);
		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var text_4 = $.only_child(td_4, true);

		$.reset(tr);

		$.template_effect(
			($0) => {
				$.set_text(text, $.get(customer).id);
				$.set_text(text_1, $.get(customer).date);
				$.set_class(span, 1, $0);
				$.set_text(text_2, $.get(customer).status);
				$.set_attribute(img, 'src', $.get(customer).avatar);
				$.set_attribute(img, 'alt', $.get(customer).name);
				$.set_text(text_3, $.get(customer).name);
				$.set_text(text_4, $.get(customer).revenue);
			},
			[
				() => $.clsx(cn("rounded-full px-2 py-1 text-xs", $.get(customer).statusVariant == "success" && "bg-lime-500/15 text-lime-800", $.get(customer).statusVariant == "danger" && "bg-red-500/15 text-red-800", $.get(customer).statusVariant == "warning" && "bg-yellow-500/15 text-yellow-800"))
			]
		);

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("relative w-full overflow-hidden rounded-xl border border-transparent bg-background p-6 shadow-md ring-1 inset-ring-1 shadow-foreground/5", _class()))
	]);

	$.append($$anchor, div);
	$.pop();
}