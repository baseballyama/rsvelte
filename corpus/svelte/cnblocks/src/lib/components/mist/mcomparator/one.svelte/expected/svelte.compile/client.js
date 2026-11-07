import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Star from "@lucide/svelte/icons/star";

var root = $.from_html(`<tr class="*:border-b *:py-4"><td class="text-muted-foreground"> </td><td><!></td><td><!></td><td><!></td></tr>`);
var root_1 = $.from_html(`<section class="bg-muted py-16 [--color-primary:var(--color-indigo-500)] md:py-32 dark:bg-muted/20"><div class="mx-auto max-w-5xl px-6"><div class="w-full overflow-auto lg:overflow-visible"><table class="w-[200vw] border-separate border-spacing-x-3 md:w-full"><thead class="sticky top-0 bg-muted/95 dark:bg-transparent"><tr class="*:py-4 *:text-left *:font-medium"><th class="lg:w-2/5"></th><th class="space-y-3"><span class="block">Free</span> <!></th><th class="space-y-3"><span class="block">Pro</span> <!></th><th class="space-y-3"><span class="block">Startup</span> <!></th></tr></thead><tbody><tr class="*:py-4"><td class="flex items-center gap-2 font-medium"><!> <span>Features</span></td><td></td><td class="border-none px-4"></td><td></td></tr><!><tr class="*:pt-8 *:pb-4"><td class="flex items-center gap-2 font-medium"><!> <span>AI Models</span></td><td></td><td class="border-none bg-muted px-4 dark:bg-transparent"></td><td></td></tr><!></tbody></table></div></div></section>`);

export default function One($$anchor) {
	const tableData = [
		{ feature: "Feature 1", free: true, pro: true, startup: true },
		{ feature: "Feature 2", free: true, pro: true, startup: true },
		{ feature: "Feature 3", free: false, pro: true, startup: true },
		{
			feature: "Tokens",
			free: "",
			pro: "20 Users",
			startup: "Unlimited"
		},

		{
			feature: "Video calls",
			free: "",
			pro: "12 Weeks",
			startup: "56"
		},

		{
			feature: "Support",
			free: "",
			pro: "Secondes",
			startup: "Unlimited"
		},

		{
			feature: "Security",
			free: "",
			pro: "20 Users",
			startup: "Unlimited"
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var table = $.child(div_1);
	var thead = $.child(table);
	var tr = $.child(thead);
	var th = $.sibling($.child(tr));
	var node = $.sibling($.child(th), 2);

	Button(node, {
		variant: 'neutral',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(th);

	var th_1 = $.sibling(th);
	var node_1 = $.sibling($.child(th_1), 2);

	Button(node_1, {
		variant: 'mdefault',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get Started');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(th_1);

	var th_2 = $.sibling(th_1);
	var node_2 = $.sibling($.child(th_2), 2);

	Button(node_2, {
		variant: 'neutral',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Get Started');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(th_2);
	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);
	var tr_1 = $.child(tbody);
	var td = $.child(tr_1);
	var node_3 = $.child(td);

	Star(node_3, { class: 'size-4' });
	$.next(2);
	$.reset(td);
	$.next(3);
	$.reset(tr_1);

	var node_4 = $.sibling(tr_1);

	$.each(node_4, 17, () => tableData.slice(-4), $.index, ($$anchor, row) => {
		var tr_2 = root();
		var td_1 = $.child(tr_2);
		var text_3 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var node_5 = $.child(td_2);

		{
			var consequent = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			var alternate = ($$anchor) => {
				var text_4 = $.text();

				$.template_effect(() => $.set_text(text_4, $.get(row).free));
				$.append($$anchor, text_4);
			};

			$.if(node_5, ($$render) => {
				if ($.get(row).free === true) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var node_6 = $.child(td_3);

		{
			var consequent_1 = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			var alternate_1 = ($$anchor) => {
				var text_5 = $.text();

				$.template_effect(() => $.set_text(text_5, $.get(row).pro));
				$.append($$anchor, text_5);
			};

			$.if(node_6, ($$render) => {
				if ($.get(row).pro === true) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var node_7 = $.child(td_4);

		{
			var consequent_2 = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			var alternate_2 = ($$anchor) => {
				var text_6 = $.text();

				$.template_effect(() => $.set_text(text_6, $.get(row).startup));
				$.append($$anchor, text_6);
			};

			$.if(node_7, ($$render) => {
				if ($.get(row).startup === true) $$render(consequent_2); else $$render(alternate_2, -1);
			});
		}

		$.reset(td_4);
		$.reset(tr_2);
		$.template_effect(() => $.set_text(text_3, $.get(row).feature));
		$.append($$anchor, tr_2);
	});

	var tr_3 = $.sibling(node_4);
	var td_5 = $.child(tr_3);
	var node_8 = $.child(td_5);

	Sparkles(node_8, { class: 'size-4' });
	$.next(2);
	$.reset(td_5);
	$.next(3);
	$.reset(tr_3);

	var node_9 = $.sibling(tr_3);

	$.each(node_9, 17, () => tableData, $.index, ($$anchor, row) => {
		var tr_4 = root();
		var td_6 = $.child(tr_4);
		var text_7 = $.only_child(td_6, true);
		var td_7 = $.sibling(td_6);
		var node_10 = $.child(td_7);

		{
			var consequent_3 = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			$.if(node_10, ($$render) => {
				if ($.get(row).free === true) $$render(consequent_3);
			});
		}

		$.reset(td_7);

		var td_8 = $.sibling(td_7);
		var node_11 = $.child(td_8);

		{
			var consequent_4 = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			var alternate_3 = ($$anchor) => {
				var text_8 = $.text();

				$.template_effect(() => $.set_text(text_8, $.get(row).pro));
				$.append($$anchor, text_8);
			};

			$.if(node_11, ($$render) => {
				if ($.get(row).pro === true) $$render(consequent_4); else $$render(alternate_3, -1);
			});
		}

		$.reset(td_8);

		var td_9 = $.sibling(td_8);
		var node_12 = $.child(td_9);

		{
			var consequent_5 = ($$anchor) => {
				Check($$anchor, { class: 'size-3 text-primary', strokeWidth: 3.5 });
			};

			var alternate_4 = ($$anchor) => {
				var text_9 = $.text();

				$.template_effect(() => $.set_text(text_9, $.get(row).startup));
				$.append($$anchor, text_9);
			};

			$.if(node_12, ($$render) => {
				if ($.get(row).startup === true) $$render(consequent_5); else $$render(alternate_4, -1);
			});
		}

		$.reset(td_9);
		$.reset(tr_4);
		$.template_effect(() => $.set_text(text_7, $.get(row).feature));
		$.append($$anchor, tr_4);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}