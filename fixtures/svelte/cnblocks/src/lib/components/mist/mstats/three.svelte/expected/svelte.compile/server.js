import * as $ from 'svelte/internal/server';
import ArrowRight from "@lucide/svelte/icons/arrow-right";

export default function Three($$renderer) {
	let stats = [
		{ value: "90+", label: "Integrations" },
		{ value: "56%", label: "Productivity Boost" },
		{ value: "24/7", label: "Customer Support" },
		{ value: "10k+", label: "Active Users" }
	];

	$$renderer.push(`<section><div class="py-24"><div class="mx-auto max-w-5xl px-6"><div><h2 class="text-2xl font-semibold">Tailark in numbers</h2> <p class="mt-4 text-lg text-balance text-muted-foreground">Our platform continues to grow with developers and businesses using our tools to
					create innovative solutions and enhance productivity.</p></div> <ul role="list" class="mt-8 space-y-2 text-muted-foreground"><!--[-->`);

	const each_array = $.ensure_array_like(stats);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let stat = each_array[index];

		$$renderer.push(`<li class="-ml-0.5 flex items-center gap-1.5">`);
		ArrowRight($$renderer, { class: 'size-4 opacity-50' });
		$$renderer.push(`<!----> <span class="font-medium text-foreground">${$.escape(stat.value)}</span> ${$.escape(stat.label)}</li>`);
	}

	$$renderer.push(`<!--]--></ul></div></div></section>`);
}