import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<a class="block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600"><!> <div class="text-sm font-medium text-gray-900 dark:text-white"> </div></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function AppsMenu($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarButton(node, {
		size: 'lg',
		class: '-mx-0.5 hover:text-gray-900 dark:hover:text-white',
		children: ($$anchor, $$slotProps) => {
			GridSolid($$anchor, { size: 'lg' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			var a = root();
			var node_2 = $.child(a);

			$.component(node_2, () => item().icon, ($$anchor, item_icon) => {
				item_icon($$anchor, {
					class: 'mx-auto mb-1 h-7 w-7 text-gray-500 dark:text-gray-300'
				});
			});

			var div = $.sibling(node_2, 2);
			var text = $.only_child(div, true);

			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', item().href);
				$.set_text(text, item().name);
			});

			$.append($$anchor, a);
		};

		MegaMenu(node_1, {
			get items() {
				return menu;
			},
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}