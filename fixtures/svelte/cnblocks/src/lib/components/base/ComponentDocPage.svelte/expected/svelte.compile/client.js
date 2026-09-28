import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { H1, H2, Paragraph, H3 } from "$lib/components/markdown/index";
import { PreviewFrame } from "$lib/components/ui/preview-component";
import SEOComponent from "$lib/seo/SEO.svelte";
import { getRegistryItemUrl } from "$lib/utils/registry-url";
import InstallComponent from "./InstallComponent.svelte";

var root = $.from_html(`<!> <div class="space-y-8 md:space-y-10"><section><div class="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-4"><!></div> <div class="mt-4 space-y-3"><!></div></section> <section><!></section> <section><!> <!></section></div>`, 1);

export default function ComponentDocPage($$anchor, $$props) {
	$.push($$props, true);

	let previewRegistryOptions = $.prop($$props, 'previewRegistryOptions', 19, () => ["@sv/cnblocks"]),
		previewThemeSetupHref = $.prop($$props, 'previewThemeSetupHref', 3, "/docs/installation"),
		descriptionClass = $.prop($$props, 'descriptionClass', 3, "");

	let PreviewComp = $.derived(() => $$props.preview);
	let resolvedPreviewAddItem = $.derived(() => $$props.previewAddItem ?? $$props.id);
	let installPathname = $.derived(() => $$props.previewHref ?? page.url.pathname);
	let installUrl = $.derived(() => getRegistryItemUrl(page.url.origin, $.get(installPathname), $.get(resolvedPreviewAddItem)));
	let previewInstallCmd = $.derived(() => $$props.previewInstallCommand ?? `npx jsrepo add @sv/cnblocks/${$$props.id}`);
	let resolvedPreviewRegistry = $.derived(() => $$props.previewRegistry ?? previewRegistryOptions()[0] ?? "@sv/cnblocks");

	let getURLPath = (url) => {
		// clean url by removing query params and hash
		let cleanUrl = url.split("?")[0].split("#")[0];

		return cleanUrl;
	};

	let llmsTxtUrl = $.derived(() => `${getURLPath(page.url.pathname)}/llms.txt`);
	var fragment = root();
	var node = $.first_child(fragment);

	SEOComponent(node, {
		get title() {
			return $$props.seo.title;
		},

		get description() {
			return $$props.seo.description;
		},

		get keywords() {
			return $$props.seo.keywords;
		}
	});

	var div = $.sibling(node, 2);
	var section = $.child(div);
	var div_1 = $.child(section);
	var node_1 = $.child(div_1);

	H1(node_1, {
		id: 'introduction',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Paragraph(node_2, {
		get class() {
			return descriptionClass();
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $$props.description));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_3 = $.child(section_1);

	PreviewFrame(node_3, {
		get componentName() {
			return $$props.title;
		},

		get addItem() {
			return $.get(resolvedPreviewAddItem);
		},

		get installCommand() {
			return $.get(previewInstallCmd);
		},

		get registryOptions() {
			return previewRegistryOptions();
		},

		get registry() {
			return $.get(resolvedPreviewRegistry);
		},

		get previewHref() {
			return $$props.previewHref;
		},

		get themeSetupHref() {
			return previewThemeSetupHref();
		},

		get code() {
			return $$props.previewCode;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					$.component(node_5, () => $.get(PreviewComp), ($$anchor, PreviewComp_1) => {
						PreviewComp_1($$anchor, {});
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node_4, ($$render) => {
					if ($.get(PreviewComp)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_6 = $.child(section_2);

	H2(node_6, {
		id: 'installation',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Installation');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	InstallComponent(node_7, {
		get installUrl() {
			return $.get(installUrl);
		},
		class: 'mt-4'
	});

	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}