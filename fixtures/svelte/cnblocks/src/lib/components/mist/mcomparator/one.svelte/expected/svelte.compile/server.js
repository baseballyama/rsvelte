import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Star from "@lucide/svelte/icons/star";

export default function One($$renderer) {
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

	$$renderer.push(`<section class="bg-muted py-16 [--color-primary:var(--color-indigo-500)] md:py-32 dark:bg-muted/20"><div class="mx-auto max-w-5xl px-6"><div class="w-full overflow-auto lg:overflow-visible"><table class="w-[200vw] border-separate border-spacing-x-3 md:w-full"><thead class="sticky top-0 bg-muted/95 dark:bg-transparent"><tr class="*:py-4 *:text-left *:font-medium"><th class="lg:w-2/5"></th><th class="space-y-3"><span class="block">Free</span> `);

	Button($$renderer, {
		variant: 'neutral',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th><th class="space-y-3"><span class="block">Pro</span> `);

	Button($$renderer, {
		variant: 'mdefault',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th><th class="space-y-3"><span class="block">Startup</span> `);

	Button($$renderer, {
		variant: 'neutral',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th></tr></thead><tbody><tr class="*:py-4"><td class="flex items-center gap-2 font-medium">`);
	Star($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span>Features</span></td><td></td><td class="border-none px-4"></td><td></td></tr><!--[-->`);

	const each_array = $.ensure_array_like(tableData.slice(-4));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let row = each_array[$$index];

		$$renderer.push(`<tr class="*:border-b *:py-4"><td class="text-muted-foreground">${$.escape(row.feature)}</td><td>`);

		if (row.free === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.free)}`);
		}

		$$renderer.push(`<!--]--></td><td>`);

		if (row.pro === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.pro)}`);
		}

		$$renderer.push(`<!--]--></td><td>`);

		if (row.startup === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.startup)}`);
		}

		$$renderer.push(`<!--]--></td></tr>`);
	}

	$$renderer.push(`<!--]--><tr class="*:pt-8 *:pb-4"><td class="flex items-center gap-2 font-medium">`);
	Sparkles($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span>AI Models</span></td><td></td><td class="border-none bg-muted px-4 dark:bg-transparent"></td><td></td></tr><!--[-->`);

	const each_array_1 = $.ensure_array_like(tableData);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let row = each_array_1[$$index_1];

		$$renderer.push(`<tr class="*:border-b *:py-4"><td class="text-muted-foreground">${$.escape(row.feature)}</td><td>`);

		if (row.free === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></td><td>`);

		if (row.pro === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.pro)}`);
		}

		$$renderer.push(`<!--]--></td><td>`);

		if (row.startup === true) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'size-3 text-primary', strokeWidth: 3.5 });
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.startup)}`);
		}

		$$renderer.push(`<!--]--></td></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table></div></div></section>`);
}