import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import ScrollArea from "$lib/registry/ui/scroll-area/scroll-area.svelte";
import { cn } from "$lib/utils.js";

function ExampleLink($$renderer, { example, isActive }) {
	if (!example.hidden) {
		$$renderer.push(`<!--[0--><a${$.attr('href', example.href)} class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"${$.attr('data-active', isActive)}>${$.escape(example.name)}</a>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

export default function Examples_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const examples = [
			{
				name: "Dashboard",
				href: "/examples/dashboard",
				code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/dashboard",
				hidden: false
			},

			{
				name: "Tasks",
				href: "/examples/tasks",
				code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/tasks",
				hidden: false
			},

			{
				name: "Playground",
				href: "/examples/playground",
				code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/playground",
				hidden: false
			},

			{
				name: "Authentication",
				href: "/examples/authentication",
				code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/authentication",
				hidden: false
			}
		];

		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex items-center", className)),
			...restProps
		})}>`);

		ScrollArea($$renderer, {
			class: 'max-w-[96%] md:max-w-[600px] lg:max-w-none',
			orientation: 'both',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center">`);

				ExampleLink($$renderer, {
					example: { name: "Examples", href: "/", code: "", hidden: false },
					isActive: page.url.pathname === "/"
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(examples);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let example = each_array[$$index];

					ExampleLink($$renderer, {
						example,
						isActive: page.url.pathname?.startsWith(example.href) ?? false
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}