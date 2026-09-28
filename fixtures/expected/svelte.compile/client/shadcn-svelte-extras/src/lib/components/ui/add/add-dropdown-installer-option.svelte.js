import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useAddDropdownInstallerOption } from '$lib/components/ui/add/add.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils';
import CheckIcon from '@lucide/svelte/icons/check';
import { Badge } from '$lib/components/ui/badge';
import AddInstallerLogo from './add-installer-logo.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'installer', 'class']);
var root = $.from_html(`<span class="flex items-center gap-2"><!> <!></span> <div class="size-4"><!></div>`, 1);

export default function Add_dropdown_installer_option($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const state = useAddDropdownInstallerOption({ installer: box.with(() => $$props.installer) });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex items-center justify-between [&_svg]:size-3.5', $$props.class));

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => rest,
				() => state.props,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var span = $.first_child(fragment_1);
						var node_1 = $.child(span);

						AddInstallerLogo(node_1, {
							get installer() {
								return $$props.installer;
							}
						});

						var text = $.sibling(node_1);
						var node_2 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								Badge($$anchor, {
									variant: 'secondary',
									class: 'h-5 px-1.5 text-[10px] font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Recommended');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_2, ($$render) => {
								if ($$props.installer === 'jsrepo') $$render(consequent);
							});
						}

						$.reset(span);

						var div = $.sibling(span, 2);
						var node_3 = $.child(div);

						{
							var consequent_1 = ($$anchor) => {
								CheckIcon($$anchor, { class: 'size-4' });
							};

							$.if(node_3, ($$render) => {
								if (state.root.installer === $$props.installer) $$render(consequent_1);
							});
						}

						$.reset(div);
						$.template_effect(() => $.set_text(text, ` ${$$props.installer === 'shadcn-svelte' ? 'shadcn-svelte' : 'jsrepo'} `));
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}