import * as $ from 'svelte/internal/server';
import Logo from "$lib/components/web/Logo.svelte";

export default function Footer_one($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = {
			product: [
				{ label: "Features", href: "#" },
				{ label: "Integrations", href: "#" },
				{ label: "Pricing", href: "#" },
				{ label: "Changelog", href: "#" }
			],
			company: [
				{ label: "About", href: "#" },
				{ label: "Blog", href: "#" },
				{ label: "Careers", href: "#" },
				{ label: "Contact", href: "#" }
			],
			resources: [
				{ label: "Documentation", href: "#" },
				{ label: "Help Center", href: "#" },
				{ label: "Community", href: "#" },
				{ label: "Templates", href: "#" }
			],
			legal: [
				{ label: "Privacy", href: "#" },
				{ label: "Terms", href: "#" },
				{ label: "Cookie Policy", href: "#" }
			]
		};

		const year = new Date().getFullYear();

		$$renderer.push(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="grid grid-cols-2 gap-8 @sm:grid-cols-3"><div class="col-span-full"><a href="/" class="flex items-center gap-2">`);
		Logo($$renderer, { class: 'h-5 w-fit' });
		$$renderer.push(`<!----></a> <p class="mt-4 max-w-xs text-sm text-muted-foreground">Building the future of integrations. Connect your tools, automate your workflow.</p></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Product</h3> <ul class="space-y-2"><!--[-->`);

		const each_array = $.ensure_array_like(links.product);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];

			$$renderer.push(`<li><a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Company</h3> <ul class="space-y-2"><!--[-->`);

		const each_array_1 = $.ensure_array_like(links.company);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let link = each_array_1[$$index_1];

			$$renderer.push(`<li><a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Resources</h3> <ul class="space-y-2"><!--[-->`);

		const each_array_2 = $.ensure_array_like(links.resources);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let link = each_array_2[$$index_2];

			$$renderer.push(`<li><a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div> <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"><p class="text-sm text-muted-foreground">© ${$.escape(year)} Veil. All rights reserved.</p> <div class="flex gap-4"><!--[-->`);

		const each_array_3 = $.ensure_array_like(links.legal);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let link = each_array_3[$$index_3];

			$$renderer.push(`<a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div></div></footer>`);
	});
}