import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryHorizontalIcon from "@lucide/svelte/icons/gallery-horizontal";
import { Button } from "$lib/registry/ui/button/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<span class="sr-only">Toggle layout</span> <!>`, 1);

export default function Layout_toggle($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const userConfig = UserConfigContext.get();

	{
		let $0 = $.derived(() => cn("size-8", $$props.class));

		Button($$anchor, $.spread_props(
			{
				variant: 'ghost',
				size: 'icon',
				get class() {
					return $.get($0);
				},

				onclick: () => {
					userConfig.setConfig({
						layout: userConfig.current.layout === "full" ? "fixed" : "full"
					});
				}
			},
			() => restProps,
			{
				title: 'Toggle layout',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.sibling($.first_child(fragment_1), 2);

					GalleryHorizontalIcon(node, {});
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}