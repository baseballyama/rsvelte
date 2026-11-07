import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { SidebarMenuButton, SidebarMenuItem } from "$lib/registry/ui/sidebar/index.js";
import SidebarSection from "./sidebar-section.svelte";

var root = $.from_html(`<!> Analytics`, 1);
var root_1 = $.from_html(`<!> Transactions`, 1);
var root_2 = $.from_html(`<!> Investments`, 1);
var root_3 = $.from_html(`<!> Accounts`, 1);
var root_4 = $.from_html(`<!> Spending`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> Documents`, 1);
var root_7 = $.from_html(`<!> Budget`, 1);
var root_8 = $.from_html(`<!> Reports`, 1);
var root_9 = $.from_html(`<!> Goals`, 1);
var root_10 = $.from_html(`<!> Calendar`, 1);
var root_11 = $.from_html(`<!> Help Center`, 1);
var root_12 = $.from_html(`<!> Docs`, 1);
var root_13 = $.from_html(`<!> Contact Us`, 1);
var root_14 = $.from_html(`<!> Status`, 1);
var root_15 = $.from_html(`<!> Community`, 1);
var root_16 = $.from_html(`<!> Profile`, 1);
var root_17 = $.from_html(`<!> Billing`, 1);
var root_18 = $.from_html(`<!> Notifications`, 1);
var root_19 = $.from_html(`<!> Security`, 1);
var root_20 = $.from_html(`<!> Appearance`, 1);
var root_21 = $.from_html(`<div class="grid w-full grid-cols-2 gap-4 xl:gap-6"><!> <!> <!> <!></div>`);

export default function Sidebar_nav($$anchor) {
	var div = root_21();
	var node = $.child(div);

	SidebarSection(node, {
		label: 'Overview',
		class: 'xl:col-start-1 xl:row-start-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_5();
			var node_1 = $.first_child(fragment);

			SidebarMenuItem(node_1, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						isActive: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							IconPlaceholder(node_2, {
								lucide: 'ChartLineIcon',
								tabler: 'IconChartLine',
								hugeicons: 'Analytics01Icon',
								phosphor: 'ChartLineIcon',
								remixicon: 'RiLineChartLine'
							});

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			SidebarMenuItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_4 = $.first_child(fragment_4);

							IconPlaceholder(node_4, {
								lucide: 'ArrowLeftRightIcon',
								tabler: 'IconArrowsLeftRight',
								hugeicons: 'ArrowDataTransferHorizontalIcon',
								phosphor: 'ArrowsLeftRightIcon',
								remixicon: 'RiArrowLeftRightLine'
							});

							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			SidebarMenuItem(node_5, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_6 = $.first_child(fragment_6);

							IconPlaceholder(node_6, {
								lucide: 'TrendingUpIcon',
								tabler: 'IconTrendingUp',
								hugeicons: 'AnalyticsUpIcon',
								phosphor: 'TrendUpIcon',
								remixicon: 'RiLineChartLine'
							});

							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			SidebarMenuItem(node_7, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var node_8 = $.first_child(fragment_8);

							IconPlaceholder(node_8, {
								lucide: 'Building2Icon',
								tabler: 'IconBuildingBank',
								hugeicons: 'BankIcon',
								phosphor: 'BankIcon',
								remixicon: 'RiBankLine'
							});

							$.next();
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			SidebarMenuItem(node_9, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_4();
							var node_10 = $.first_child(fragment_10);

							IconPlaceholder(node_10, {
								lucide: 'PieChartIcon',
								tabler: 'IconChartPie',
								hugeicons: 'PieChartIcon',
								phosphor: 'ChartPieIcon',
								remixicon: 'RiPieChartLine'
							});

							$.next();
							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node, 2);

	SidebarSection(node_11, {
		label: 'Planning',
		class: 'xl:col-start-1 xl:row-start-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_5();
			var node_12 = $.first_child(fragment_11);

			SidebarMenuItem(node_12, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_6();
							var node_13 = $.first_child(fragment_13);

							IconPlaceholder(node_13, {
								lucide: 'FileTextIcon',
								tabler: 'IconFileText',
								hugeicons: 'File02Icon',
								phosphor: 'FileTextIcon',
								remixicon: 'RiFileTextLine'
							});

							$.next();
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_12, 2);

			SidebarMenuItem(node_14, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_7();
							var node_15 = $.first_child(fragment_15);

							IconPlaceholder(node_15, {
								lucide: 'WalletIcon',
								tabler: 'IconWallet',
								hugeicons: 'Wallet01Icon',
								phosphor: 'WalletIcon',
								remixicon: 'RiWalletLine'
							});

							$.next();
							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_14, 2);

			SidebarMenuItem(node_16, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root_8();
							var node_17 = $.first_child(fragment_17);

							IconPlaceholder(node_17, {
								lucide: 'ChartBarIcon',
								tabler: 'IconChartBar',
								hugeicons: 'ChartBarLineIcon',
								phosphor: 'ChartBarIcon',
								remixicon: 'RiBarChartLine'
							});

							$.next();
							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_16, 2);

			SidebarMenuItem(node_18, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_9();
							var node_19 = $.first_child(fragment_19);

							IconPlaceholder(node_19, {
								lucide: 'TargetIcon',
								tabler: 'IconTarget',
								hugeicons: 'Target02Icon',
								phosphor: 'TargetIcon',
								remixicon: 'RiFocus3Line'
							});

							$.next();
							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_18, 2);

			SidebarMenuItem(node_20, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_10();
							var node_21 = $.first_child(fragment_21);

							IconPlaceholder(node_21, {
								lucide: 'CalendarIcon',
								tabler: 'IconCalendar',
								hugeicons: 'Calendar03Icon',
								phosphor: 'CalendarIcon',
								remixicon: 'RiCalendarLine'
							});

							$.next();
							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_11, 2);

	SidebarSection(node_22, {
		label: 'Support',
		class: 'flex xl:col-start-2 xl:row-start-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_22 = root_5();
			var node_23 = $.first_child(fragment_22);

			SidebarMenuItem(node_23, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_24 = root_11();
							var node_24 = $.first_child(fragment_24);

							IconPlaceholder(node_24, {
								lucide: 'HelpCircleIcon',
								tabler: 'IconHelpCircle',
								hugeicons: 'HelpCircleIcon',
								phosphor: 'QuestionIcon',
								remixicon: 'RiQuestionLine'
							});

							$.next();
							$.append($$anchor, fragment_24);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_23, 2);

			SidebarMenuItem(node_25, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_26 = root_12();
							var node_26 = $.first_child(fragment_26);

							IconPlaceholder(node_26, {
								lucide: 'BookOpenIcon',
								tabler: 'IconBook',
								hugeicons: 'BookOpen02Icon',
								phosphor: 'BookOpenIcon',
								remixicon: 'RiBookOpenLine'
							});

							$.next();
							$.append($$anchor, fragment_26);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_25, 2);

			SidebarMenuItem(node_27, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_28 = root_13();
							var node_28 = $.first_child(fragment_28);

							IconPlaceholder(node_28, {
								lucide: 'MessageSquareIcon',
								tabler: 'IconMessage',
								hugeicons: 'Message01Icon',
								phosphor: 'ChatCircleIcon',
								remixicon: 'RiChat1Line'
							});

							$.next();
							$.append($$anchor, fragment_28);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_27, 2);

			SidebarMenuItem(node_29, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_30 = root_14();
							var node_30 = $.first_child(fragment_30);

							IconPlaceholder(node_30, {
								lucide: 'ActivityIcon',
								tabler: 'IconActivity',
								hugeicons: 'ActivityIcon',
								phosphor: 'PulseIcon',
								remixicon: 'RiPulseLine'
							});

							$.next();
							$.append($$anchor, fragment_30);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_29, 2);

			SidebarMenuItem(node_31, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_32 = root_15();
							var node_32 = $.first_child(fragment_32);

							IconPlaceholder(node_32, {
								lucide: 'GlobeIcon',
								tabler: 'IconWorld',
								hugeicons: 'Globe02Icon',
								phosphor: 'GlobeIcon',
								remixicon: 'RiGlobalLine'
							});

							$.next();
							$.append($$anchor, fragment_32);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_22);
		},
		$$slots: { default: true }
	});

	var node_33 = $.sibling(node_22, 2);

	SidebarSection(node_33, {
		label: 'Account',
		class: 'flex xl:col-start-2 xl:row-start-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_33 = root_5();
			var node_34 = $.first_child(fragment_33);

			SidebarMenuItem(node_34, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_35 = root_16();
							var node_35 = $.first_child(fragment_35);

							IconPlaceholder(node_35, {
								lucide: 'UserIcon',
								tabler: 'IconUser',
								hugeicons: 'UserIcon',
								phosphor: 'UserIcon',
								remixicon: 'RiUserLine'
							});

							$.next();
							$.append($$anchor, fragment_35);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_34, 2);

			SidebarMenuItem(node_36, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						isActive: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_37 = root_17();
							var node_37 = $.first_child(fragment_37);

							IconPlaceholder(node_37, {
								lucide: 'CreditCardIcon',
								tabler: 'IconCreditCard',
								hugeicons: 'CreditCardIcon',
								phosphor: 'CreditCardIcon',
								remixicon: 'RiBankCardLine'
							});

							$.next();
							$.append($$anchor, fragment_37);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_36, 2);

			SidebarMenuItem(node_38, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_39 = root_18();
							var node_39 = $.first_child(fragment_39);

							IconPlaceholder(node_39, {
								lucide: 'BellIcon',
								tabler: 'IconBell',
								hugeicons: 'Notification03Icon',
								phosphor: 'BellIcon',
								remixicon: 'RiNotificationLine'
							});

							$.next();
							$.append($$anchor, fragment_39);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_38, 2);

			SidebarMenuItem(node_40, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_41 = root_19();
							var node_41 = $.first_child(fragment_41);

							IconPlaceholder(node_41, {
								lucide: 'ShieldIcon',
								tabler: 'IconShield',
								hugeicons: 'ShieldIcon',
								phosphor: 'ShieldIcon',
								remixicon: 'RiShieldLine'
							});

							$.next();
							$.append($$anchor, fragment_41);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_40, 2);

			SidebarMenuItem(node_42, {
				children: ($$anchor, $$slotProps) => {
					SidebarMenuButton($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_43 = root_20();
							var node_43 = $.first_child(fragment_43);

							IconPlaceholder(node_43, {
								lucide: 'PaletteIcon',
								tabler: 'IconPalette',
								hugeicons: 'PaintBoardIcon',
								phosphor: 'PaletteIcon',
								remixicon: 'RiPaletteLine'
							});

							$.next();
							$.append($$anchor, fragment_43);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_33);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}