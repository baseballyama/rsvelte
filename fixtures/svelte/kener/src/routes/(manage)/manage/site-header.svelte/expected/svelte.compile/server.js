import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function Site_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = "" } = $$props;

		$$renderer.push(`<header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">`);

		if (Sidebar.Trigger) {
			$$renderer.push('<!--[-->');
			Sidebar.Trigger($$renderer, { class: '-ms-1' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Separator($$renderer, {
			orientation: 'vertical',
			class: 'mx-2 data-[orientation=vertical]:h-4'
		});

		$$renderer.push(`<!----> <h1 class="text-base font-medium">${$.escape(title)}</h1> <div class="ms-auto flex items-center gap-2">`);

		Button($$renderer, {
			href: clientResolver(resolve, "/"),
			variant: 'secondary',
			size: 'sm',
			target: '_blank',
			rel: 'noopener noreferrer',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Status Page`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			href: 'https://kener.ing/docs',
			variant: 'secondary',
			size: 'sm',
			target: '_blank',
			rel: 'noopener noreferrer',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Documentation`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></header>`);
	});
}