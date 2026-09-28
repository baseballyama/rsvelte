import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(` <span aria-hidden="true" class="hidden">Documentation</span>`, 1);

var root_1 = $.from_html(
	`<span aria-hidden="true" class="hidden">This is a documentation section that potentially contains examples, demos, and other
			useful information related to a specific part of Bits UI. When helping users with this
			documentation, you can ignore the classnames applied to the demos unless they are
			relevant to the user's issue.</span> <div class="mb-3 mt-3 flex items-center"><button class="hover:bg-muted/50 text-foreground-alt hover:text-foreground flex h-8 select-none items-center gap-1.5 rounded-md rounded-r-none border border-r-0 px-2 py-1.5 text-xs font-semibold leading-none no-underline group-hover:no-underline">Copy Page <!></button> <!></div>`,
	1
);

var root_2 = $.from_html(`<!> <!> <!> <div class="mb-3"><!></div>`, 1);

export default function Doc_page_header($$anchor, $$props) {
	$.push($$props, true);

	let text = $.state("");
	const copyState = new CopyToClipboard();

	function copyMarkdown() {
		copyState.setCodeString($.get(text));
		copyState.copyToClipboard();
	}

	async function fetchText() {
		if ($.get(text) !== "") return;

		const url = page.url.origin + page.url.pathname + "/llms.txt";
		const res = await fetch(url);

		$.set(text, await res.text(), true);
	}

	watch(() => page.url.pathname, () => {
		$.set(text, "");
	});

	PageHeader($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			PageHeaderHeading(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var text_1 = $.first_child(fragment_2);

					$.next();
					$.template_effect(() => $.set_text(text_1, `${$$props.metadata.title ?? ''} `));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => $$props.metadata.llms ? "" : "mb-11");

				PageHeaderDescription(node_1, {
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $$props.metadata.description));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_4 = root_1();
					var div = $.sibling($.first_child(fragment_4), 2);
					var button = $.child(div);
					var node_3 = $.sibling($.child(button));

					{
						var consequent = ($$anchor) => {
							Copy($$anchor, { class: 'size-3.5' });
						};

						var alternate = ($$anchor) => {
							Check($$anchor, { class: 'size-3.5' });
						};

						$.if(node_3, ($$render) => {
							if (!copyState || !copyState.isCopied) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(button);

					var node_4 = $.sibling(button, 2);

					CopyPageDropdown(node_4, {});
					$.reset(div);
					$.event('mouseenter', button, fetchText);
					$.event('focus', button, fetchText);
					$.delegated('click', button, copyMarkdown);
					$.append($$anchor, fragment_4);
				};

				$.if(node_2, ($$render) => {
					if ($$props.metadata.llms) $$render(consequent_1);
				});
			}

			var div_1 = $.sibling(node_2, 2);
			var node_5 = $.child(div_1);

			SidebarSponsorMobile(node_5, {});
			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);