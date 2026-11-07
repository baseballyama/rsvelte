import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { UserConfigContext } from '$lib/user-config.svelte.js';
import GalleryHorizontalIcon from '@lucide/svelte/icons/gallery-horizontal';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<span class="sr-only">Toggle layout</span> <!>`, 1);

export default function Layout_toggle($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const userConfig = UserConfigContext.get();

	Button($$anchor, $.spread_props(
		{
			variant: 'ghost',
			size: 'icon',
			onclick: () => {
				userConfig.setConfig({
					layout: userConfig.current.layout === 'full' ? 'fixed' : 'full'
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

	$.pop();
}