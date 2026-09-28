import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import Cpu from "@lucide/svelte/icons/cpu";
import Sparkles from "@lucide/svelte/icons/sparkles";

export default function Comparator_one($$renderer) {
	let tableData = [
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

	$$renderer.push(`<section class="py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="w-full overflow-auto lg:overflow-visible"><table class="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]"><thead class="sticky top-0 bg-background"><tr class="*:py-4 *:text-left *:font-medium"><th class="lg:w-2/5"></th><th class="space-y-3"><span class="block">Free</span> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th><th class="space-y-3 rounded-t-(--radius) bg-muted px-4"><span class="block">Pro</span> `);

	Button($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th><th class="space-y-3"><span class="block">Startup</span> `);

	Button($$renderer, {
		variant: 'outline',
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></th></tr></thead><tbody class="text-caption text-sm"><tr class="*:py-3"><td class="flex items-center gap-2 font-medium">`);
	Cpu($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span>Features</span></td><td></td><td class="border-none bg-muted px-4"></td><td></td></tr><!--[-->`);

	const each_array = $.ensure_array_like(tableData.slice(-4));

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let row = each_array[index];

		$$renderer.push(`<tr class="*:border-b *:py-3"><td class="text-muted-foreground">${$.escape(row.feature)}</td><td>`);

		if (typeof row.free === "boolean" && row.free) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.free)}`);
		}

		$$renderer.push(`<!--]--></td><td class="border-none bg-muted px-4"><div class="-mb-3 border-b py-3">`);

		if (typeof row.pro === "boolean" && row.pro) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.pro)}`);
		}

		$$renderer.push(`<!--]--></div></td><td>`);

		if (typeof row.startup === "boolean" && row.startup) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.startup)}`);
		}

		$$renderer.push(`<!--]--></td></tr>`);
	}

	$$renderer.push(`<!--]--><tr class="*:pt-8 *:pb-3"><td class="flex items-center gap-2 font-medium">`);
	Sparkles($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span>AI Models</span></td><td></td><td class="border-none bg-muted px-4"></td><td></td></tr><!--[-->`);

	const each_array_1 = $.ensure_array_like(tableData);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let row = each_array_1[$$index_1];

		$$renderer.push(`<tr class="*:border-b *:py-3"><td class="text-muted-foreground">${$.escape(row.feature)}</td><td>`);

		if (typeof row.free === "boolean" && row.free) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></td><td class="border-none bg-muted px-4"><div class="-mb-3 border-b py-3">`);

		if (typeof row.pro === "boolean" && row.pro) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.pro)}`);
		}

		$$renderer.push(`<!--]--></div></td><td>`);

		if (typeof row.startup === "boolean" && row.startup) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(row.startup)}`);
		}

		$$renderer.push(`<!--]--></td></tr>`);
	}

	$$renderer.push(`<!--]--><tr class="*:py-6"><td></td><td></td><td class="rounded-b-(--radius) border-none bg-muted px-4"></td><td></td></tr></tbody></table></div></div></section>`);
}