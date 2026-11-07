import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { H1, H2, Paragraph, H3 } from "$lib/components/markdown/index";
import { PreviewFrame } from "$lib/components/ui/preview-component";
import SEOComponent from "$lib/seo/SEO.svelte";
import { getRegistryItemUrl } from "$lib/utils/registry-url";
import InstallComponent from "./InstallComponent.svelte";

export default function ComponentDocPage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			title,
			description,
			seo,
			preview,
			previewCode,
			previewAddItem,
			previewInstallCommand,
			previewRegistryOptions = ["@sv/cnblocks"],
			previewRegistry,
			previewHref,
			previewThemeSetupHref = "/docs/installation",
			descriptionClass = ""
		} = $$props;

		let PreviewComp = $.derived(() => preview);
		let resolvedPreviewAddItem = $.derived(() => previewAddItem ?? id);
		let installPathname = $.derived(() => previewHref ?? page.url.pathname);
		let installUrl = $.derived(() => getRegistryItemUrl(page.url.origin, installPathname(), resolvedPreviewAddItem()));
		let previewInstallCmd = $.derived(() => previewInstallCommand ?? `npx jsrepo add @sv/cnblocks/${id}`);
		let resolvedPreviewRegistry = $.derived(() => previewRegistry ?? previewRegistryOptions[0] ?? "@sv/cnblocks");

		let getURLPath = (url) => {
			// clean url by removing query params and hash
			let cleanUrl = url.split("?")[0].split("#")[0];

			return cleanUrl;
		};

		let llmsTxtUrl = $.derived(() => `${getURLPath(page.url.pathname)}/llms.txt`);

		SEOComponent($$renderer, {
			title: seo.title,
			description: seo.description,
			keywords: seo.keywords
		});

		$$renderer.push(`<!----> <div class="space-y-8 md:space-y-10"><section><div class="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4">`);

		H1($$renderer, {
			id: 'introduction',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(title)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="mt-4 space-y-3">`);

		Paragraph($$renderer, {
			class: descriptionClass,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(description)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></section> <section>`);

		PreviewFrame($$renderer, {
			componentName: title,
			addItem: resolvedPreviewAddItem(),
			installCommand: previewInstallCmd(),
			registryOptions: previewRegistryOptions,
			registry: resolvedPreviewRegistry(),
			previewHref,
			themeSetupHref: previewThemeSetupHref,
			code: previewCode,
			children: ($$renderer) => {
				if (PreviewComp()) {
					$$renderer.push('<!--[0-->');

					if (PreviewComp()) {
						$$renderer.push('<!--[-->');
						PreviewComp()($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section> <section>`);

		H2($$renderer, {
			id: 'installation',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Installation`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		InstallComponent($$renderer, { installUrl: installUrl(), class: 'mt-4' });
		$$renderer.push(`<!----></section></div>`);
	});
}