import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useAddDropdownInstallerOption } from '$lib/components/ui/add/add.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils';
import CheckIcon from '@lucide/svelte/icons/check';
import { Badge } from '$lib/components/ui/badge';
import AddInstallerLogo from './add-installer-logo.svelte';

export default function Add_dropdown_installer_option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { installer, class: className, $$slots, $$events, ...rest } = $$props;
		const state = useAddDropdownInstallerOption({ installer: box.with(() => installer) });

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{
					class: cn('flex items-center justify-between [&_svg]:size-3.5', className)
				},
				rest,
				state.props,
				{
					children: ($$renderer) => {
						$$renderer.push(`<span class="flex items-center gap-2">`);
						AddInstallerLogo($$renderer, { installer });
						$$renderer.push(`<!----> ${$.escape(installer === 'shadcn-svelte' ? 'shadcn-svelte' : 'jsrepo')} `);

						if (installer === 'jsrepo') {
							$$renderer.push('<!--[0-->');

							Badge($$renderer, {
								variant: 'secondary',
								class: 'h-5 px-1.5 text-[10px] font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Recommended`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span> <div class="size-4">`);

						if (state.root.installer === installer) {
							$$renderer.push('<!--[0-->');
							CheckIcon($$renderer, { class: 'size-4' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}