import * as $ from 'svelte/internal/server';
import Metadata from "$lib/components/metadata.svelte";
import SiteHeader from "$lib/components/site-header.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { cn } from "$lib/utils.js";
import ActionMenu from "../components/action-menu.svelte";
import Customizer from "../components/customizer.svelte";
import InitializeDialog from "../components/initialize-dialog.svelte";
import WelcomeDialog from "../components/welcome-dialog.svelte";
import { OG_IMAGE_BASE_URL } from "../../../../og/og.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const designSystem = useDesignSystem();

		Metadata($$renderer, {
			title: 'New Project',
			description: 'Build your own shadcn-svelte.',
			ogImage: {
				url: `${OG_IMAGE_BASE_URL}/create/og${new URL(designSystem.shareUrl).search}`,
				width: "1200",
				height: "630"
			}
		});

		$$renderer.push(`<!----> `);

		ActionMenu($$renderer, {
			children: ($$renderer) => {
				InitializeDialog($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div data-slot="layout"${$.attr_class($.clsx(cn("group/layout relative z-10 flex h-svh flex-col overflow-hidden section-soft", "[--customizer-width:--spacing(56)] [--gap:--spacing(4)] md:[--gap:--spacing(6)]", "[--preview-height:calc(100svh-var(--header-height)-2rem-150px)] md:[--preview-height:calc(100svh-var(--header-height)-2rem)]")))}>`);
						SiteHeader($$renderer, {});
						$$renderer.push(`<!----> <main data-slot="designer" class="container-wrapper flex min-h-0 flex-1 flex-col gap-(--gap) p-(--gap) pt-[calc(var(--gap)*0.25)] md:flex-row-reverse">`);
						children?.($$renderer);
						$$renderer.push(`<!----> `);
						Customizer($$renderer, {});
						$$renderer.push(`<!----> `);
						WelcomeDialog($$renderer, {});
						$$renderer.push(`<!----></main></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}