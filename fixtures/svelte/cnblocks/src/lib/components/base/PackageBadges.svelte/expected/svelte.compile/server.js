import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge";
import { cn } from "$lib/utils";

export default function PackageBadges($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { packages = [], class: className } = $$props;

		if (packages.length > 0) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("mt-2 flex flex-wrap gap-2", className)))} data-toc-ignore="true"><!--[-->`);

			const each_array = $.ensure_array_like(packages);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let pkg = each_array[$$index];

				Badge($$renderer, {
					variant: 'secondary',
					class: 'rounded-full border-border/60 bg-muted/60 px-2 py-0.5 font-mono text-[11px] leading-none text-muted-foreground',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(pkg)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}