import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { SidebarMenuButton, SidebarMenuItem } from "$lib/registry/ui/sidebar/index.js";
import SidebarSection from "./sidebar-section.svelte";

export default function Sidebar_nav($$renderer) {
	$$renderer.push(`<div class="grid w-full grid-cols-2 gap-4 xl:gap-6">`);

	SidebarSection($$renderer, {
		label: 'Overview',
		class: 'xl:col-start-1 xl:row-start-2',
		children: ($$renderer) => {
			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						isActive: true,
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'ChartLineIcon',
								tabler: 'IconChartLine',
								hugeicons: 'Analytics01Icon',
								phosphor: 'ChartLineIcon',
								remixicon: 'RiLineChartLine'
							});

							$$renderer.push(`<!----> Analytics`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'ArrowLeftRightIcon',
								tabler: 'IconArrowsLeftRight',
								hugeicons: 'ArrowDataTransferHorizontalIcon',
								phosphor: 'ArrowsLeftRightIcon',
								remixicon: 'RiArrowLeftRightLine'
							});

							$$renderer.push(`<!----> Transactions`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'TrendingUpIcon',
								tabler: 'IconTrendingUp',
								hugeicons: 'AnalyticsUpIcon',
								phosphor: 'TrendUpIcon',
								remixicon: 'RiLineChartLine'
							});

							$$renderer.push(`<!----> Investments`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'Building2Icon',
								tabler: 'IconBuildingBank',
								hugeicons: 'BankIcon',
								phosphor: 'BankIcon',
								remixicon: 'RiBankLine'
							});

							$$renderer.push(`<!----> Accounts`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'PieChartIcon',
								tabler: 'IconChartPie',
								hugeicons: 'PieChartIcon',
								phosphor: 'ChartPieIcon',
								remixicon: 'RiPieChartLine'
							});

							$$renderer.push(`<!----> Spending`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SidebarSection($$renderer, {
		label: 'Planning',
		class: 'xl:col-start-1 xl:row-start-1',
		children: ($$renderer) => {
			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'FileTextIcon',
								tabler: 'IconFileText',
								hugeicons: 'File02Icon',
								phosphor: 'FileTextIcon',
								remixicon: 'RiFileTextLine'
							});

							$$renderer.push(`<!----> Documents`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'WalletIcon',
								tabler: 'IconWallet',
								hugeicons: 'Wallet01Icon',
								phosphor: 'WalletIcon',
								remixicon: 'RiWalletLine'
							});

							$$renderer.push(`<!----> Budget`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'ChartBarIcon',
								tabler: 'IconChartBar',
								hugeicons: 'ChartBarLineIcon',
								phosphor: 'ChartBarIcon',
								remixicon: 'RiBarChartLine'
							});

							$$renderer.push(`<!----> Reports`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'TargetIcon',
								tabler: 'IconTarget',
								hugeicons: 'Target02Icon',
								phosphor: 'TargetIcon',
								remixicon: 'RiFocus3Line'
							});

							$$renderer.push(`<!----> Goals`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'CalendarIcon',
								tabler: 'IconCalendar',
								hugeicons: 'Calendar03Icon',
								phosphor: 'CalendarIcon',
								remixicon: 'RiCalendarLine'
							});

							$$renderer.push(`<!----> Calendar`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SidebarSection($$renderer, {
		label: 'Support',
		class: 'flex xl:col-start-2 xl:row-start-1',
		children: ($$renderer) => {
			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'HelpCircleIcon',
								tabler: 'IconHelpCircle',
								hugeicons: 'HelpCircleIcon',
								phosphor: 'QuestionIcon',
								remixicon: 'RiQuestionLine'
							});

							$$renderer.push(`<!----> Help Center`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'BookOpenIcon',
								tabler: 'IconBook',
								hugeicons: 'BookOpen02Icon',
								phosphor: 'BookOpenIcon',
								remixicon: 'RiBookOpenLine'
							});

							$$renderer.push(`<!----> Docs`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'MessageSquareIcon',
								tabler: 'IconMessage',
								hugeicons: 'Message01Icon',
								phosphor: 'ChatCircleIcon',
								remixicon: 'RiChat1Line'
							});

							$$renderer.push(`<!----> Contact Us`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'ActivityIcon',
								tabler: 'IconActivity',
								hugeicons: 'ActivityIcon',
								phosphor: 'PulseIcon',
								remixicon: 'RiPulseLine'
							});

							$$renderer.push(`<!----> Status`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'GlobeIcon',
								tabler: 'IconWorld',
								hugeicons: 'Globe02Icon',
								phosphor: 'GlobeIcon',
								remixicon: 'RiGlobalLine'
							});

							$$renderer.push(`<!----> Community`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SidebarSection($$renderer, {
		label: 'Account',
		class: 'flex xl:col-start-2 xl:row-start-2',
		children: ($$renderer) => {
			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'UserIcon',
								tabler: 'IconUser',
								hugeicons: 'UserIcon',
								phosphor: 'UserIcon',
								remixicon: 'RiUserLine'
							});

							$$renderer.push(`<!----> Profile`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						isActive: true,
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'CreditCardIcon',
								tabler: 'IconCreditCard',
								hugeicons: 'CreditCardIcon',
								phosphor: 'CreditCardIcon',
								remixicon: 'RiBankCardLine'
							});

							$$renderer.push(`<!----> Billing`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'BellIcon',
								tabler: 'IconBell',
								hugeicons: 'Notification03Icon',
								phosphor: 'BellIcon',
								remixicon: 'RiNotificationLine'
							});

							$$renderer.push(`<!----> Notifications`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'ShieldIcon',
								tabler: 'IconShield',
								hugeicons: 'ShieldIcon',
								phosphor: 'ShieldIcon',
								remixicon: 'RiShieldLine'
							});

							$$renderer.push(`<!----> Security`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SidebarMenuItem($$renderer, {
				children: ($$renderer) => {
					SidebarMenuButton($$renderer, {
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'PaletteIcon',
								tabler: 'IconPalette',
								hugeicons: 'PaintBoardIcon',
								phosphor: 'PaletteIcon',
								remixicon: 'RiPaletteLine'
							});

							$$renderer.push(`<!----> Appearance`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}