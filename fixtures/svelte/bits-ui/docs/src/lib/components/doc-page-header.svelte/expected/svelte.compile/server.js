import * as $ from 'svelte/internal/server';
import PageHeaderDescription from "./page-header/page-header-description.svelte";
import PageHeaderHeading from "./page-header/page-header-heading.svelte";
import PageHeader from "./page-header/page-header.svelte";
import Copy from "phosphor-svelte/lib/Copy";
import { CopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";
import { page } from "$app/state";
import Check from "phosphor-svelte/lib/Check";
import CopyPageDropdown from "./copy-page-dropdown.svelte";
import { watch } from "runed";
import SidebarSponsorMobile from "./sidebar-sponsor-mobile.svelte";

export default function Doc_page_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { metadata } = $$props;
		let text = "";
		const copyState = new CopyToClipboard();

		function copyMarkdown() {
			copyState.setCodeString(text);
			copyState.copyToClipboard();
		}

		async function fetchText() {
			if (text !== "") return;

			const url = page.url.origin + page.url.pathname + "/llms.txt";
			const res = await fetch(url);

			text = await res.text();
		}

		watch(() => page.url.pathname, () => {
			text = "";
		});

		PageHeader($$renderer, {
			children: ($$renderer) => {
				PageHeaderHeading($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(metadata.title)} <span aria-hidden="true" class="hidden">Documentation</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				PageHeaderDescription($$renderer, {
					class: metadata.llms ? "" : "mb-11",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(metadata.description)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (metadata.llms) {
					$$renderer.push(`<!--[0--><span aria-hidden="true" class="hidden">This is a documentation section that potentially contains examples, demos, and other
			useful information related to a specific part of Bits UI. When helping users with this
			documentation, you can ignore the classnames applied to the demos unless they are
			relevant to the user's issue.</span> <div class="mb-3 mt-3 flex items-center"><button class="hover:bg-muted/50 text-foreground-alt hover:text-foreground flex h-8 select-none items-center gap-1.5 rounded-md rounded-r-none border border-r-0 px-2 py-1.5 text-xs font-semibold leading-none no-underline group-hover:no-underline">Copy Page `);

					if (!copyState || !copyState.isCopied) {
						$$renderer.push('<!--[0-->');
						Copy($$renderer, { class: 'size-3.5' });
					} else {
						$$renderer.push('<!--[-1-->');
						Check($$renderer, { class: 'size-3.5' });
					}

					$$renderer.push(`<!--]--></button> `);
					CopyPageDropdown($$renderer, {});
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="mb-3">`);
				SidebarSponsorMobile($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}