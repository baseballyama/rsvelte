import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Metadata from "$lib/components/metadata.svelte";
import SiteHeader from "$lib/components/site-header.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { cn } from "$lib/utils.js";
import ActionMenu from "../components/action-menu.svelte";
import Customizer from "../components/customizer.svelte";
import InitializeDialog from "../components/initialize-dialog.svelte";
import WelcomeDialog from "../components/welcome-dialog.svelte";
import { OG_IMAGE_BASE_URL } from "../../../../og/og.js";

var root = $.from_html(`<div data-slot="layout"><!> <main data-slot="designer" class="container-wrapper flex min-h-0 flex-1 flex-col gap-(--gap) p-(--gap) pt-[calc(var(--gap)*0.25)] md:flex-row-reverse"><!> <!> <!></main></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `${OG_IMAGE_BASE_URL}/create/og${new URL(designSystem.shareUrl).search}`,
			width: "1200",
			height: "630"
		}));

		Metadata(node, {
			title: 'New Project',
			description: 'Build your own shadcn-svelte.',
			get ogImage() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	ActionMenu(node_1, {
		children: ($$anchor, $$slotProps) => {
			InitializeDialog($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_2 = $.child(div);

					SiteHeader(node_2, {});

					var main = $.sibling(node_2, 2);
					var node_3 = $.child(main);

					$.snippet(node_3, () => $$props.children ?? $.noop);

					var node_4 = $.sibling(node_3, 2);

					Customizer(node_4, {});

					var node_5 = $.sibling(node_4, 2);

					WelcomeDialog(node_5, {});
					$.reset(main);
					$.reset(div);

					$.template_effect(($0) => $.set_class(div, 1, $0), [
						() => $.clsx(cn("group/layout relative z-10 flex h-svh flex-col overflow-hidden section-soft", "[--customizer-width:--spacing(56)] [--gap:--spacing(4)] md:[--gap:--spacing(6)]", "[--preview-height:calc(100svh-var(--header-height)-2rem-150px)] md:[--preview-height:calc(100svh-var(--header-height)-2rem)]"))
					]);

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}