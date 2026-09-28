import * as $ from 'svelte/internal/server';
import { MegaMenu, ToolbarButton } from "flowbite-svelte";

import {
	ArchiveSolid,
	ArrowRightToBracketOutline,
	CogOutline,
	DollarOutline,
	GridSolid,
	InboxOutline,
	ProfileCardOutline,
	SalePercentOutline,
	ShoppingBagSolid,
	UsersGroupSolid
} from "flowbite-svelte-icons";

export default function AppsMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const menu = [
			{ name: "Sales", href: "/", icon: ShoppingBagSolid },
			{ name: "Users", href: "/", icon: UsersGroupSolid },
			{ name: "Inbox", href: "/", icon: InboxOutline },
			{ name: "Profile", href: "/", icon: ProfileCardOutline },
			{ name: "Settings", href: "/settings", icon: CogOutline },
			{ name: "Prouducts", href: "/", icon: ArchiveSolid },
			{ name: "Pricing", href: "/pages/pricing", icon: DollarOutline },
			{ name: "Billing", href: "/", icon: SalePercentOutline },
			{ name: "Logout", href: "/", icon: ArrowRightToBracketOutline }
		];

		let { open = void 0 } = $$props;

		ToolbarButton($$renderer, {
			size: 'lg',
			class: '-mx-0.5 hover:text-gray-900 dark:hover:text-white',
			children: ($$renderer) => {
				GridSolid($$renderer, { size: 'lg' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { item }) {
				$$renderer.push(`<a${$.attr('href', item.href)} class="block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600">`);

				if (item.icon) {
					$$renderer.push('<!--[-->');

					item.icon($$renderer, {
						class: 'mx-auto mb-1 h-7 w-7 text-gray-500 dark:text-gray-300'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <div class="text-sm font-medium text-gray-900 dark:text-white">${$.escape(item.name)}</div></a>`);
			}

			MegaMenu($$renderer, { items: menu, children, $$slots: { default: true } });
		}

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { open });
	});
}