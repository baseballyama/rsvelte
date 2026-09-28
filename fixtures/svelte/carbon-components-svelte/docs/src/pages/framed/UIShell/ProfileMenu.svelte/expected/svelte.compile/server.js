import * as $ from 'svelte/internal/server';

import {
	Content,
	Header,
	HeaderUtilities,
	ProfileMenu,
	ProfileMenuDetail,
	ProfileMenuDivider,
	ProfileMenuHeader,
	ProfileMenuItem,
	ProfileMenuList,
	SkipToContent,
	UserAvatar
} from "carbon-components-svelte";

import Logout from "carbon-icons-svelte/lib/Logout.svelte";

export default function ProfileMenu_1($$renderer) {
	const image = "https://i.pravatar.cc/300?img=12";

	Header($$renderer, {
		companyName: 'IBM',
		platformName: 'Carbon Svelte',
		children: ($$renderer) => {
			HeaderUtilities($$renderer, {
				children: ($$renderer) => {
					ProfileMenu($$renderer, {
						iconDescription: 'Profile',
						children: ($$renderer) => {
							ProfileMenuHeader($$renderer, {
								name: 'Richard Hendricks',
								username: 'rhendricks',
								href: '/',
								$$slots: {
									avatar: ($$renderer) => {
										UserAvatar($$renderer, {
											slot: 'avatar',
											size: 'lg',
											image,
											imageDescription: 'Richard Hendricks'
										});
									}
								}
							});

							$$renderer.push(`<!----> `);
							ProfileMenuDivider($$renderer, {});
							$$renderer.push(`<!----> `);

							ProfileMenuDetail($$renderer, {
								label: 'Plan',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Lite`);
								},

								$$slots: {
									default: true,
									action: ($$renderer) => {
										$$renderer.push(`<a slot="action" href="/">Upgrade</a>`);
									}
								}
							});

							$$renderer.push(`<!----> `);
							ProfileMenuDivider($$renderer, {});
							$$renderer.push(`<!----> `);

							ProfileMenuDetail($$renderer, {
								label: 'Location',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Dallas, TX`);
								},

								$$slots: {
									default: true,
									action: ($$renderer) => {
										$$renderer.push(`<a slot="action" href="/">Change</a>`);
									}
								}
							});

							$$renderer.push(`<!----> `);
							ProfileMenuDivider($$renderer, {});
							$$renderer.push(`<!----> `);

							ProfileMenuList($$renderer, {
								children: ($$renderer) => {
									ProfileMenuItem($$renderer, {
										href: '/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Settings`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ProfileMenuItem($$renderer, {
										href: '/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Privacy`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ProfileMenuItem($$renderer, {
										href: '/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Feedback`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ProfileMenuItem($$renderer, {
										href: '/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->About`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ProfileMenuItem($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Change theme`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							ProfileMenuDivider($$renderer, {});
							$$renderer.push(`<!----> `);

							ProfileMenuList($$renderer, {
								children: ($$renderer) => {
									ProfileMenuItem($$renderer, {
										icon: Logout,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Log out`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},

						$$slots: {
							default: true,
							avatar: ($$renderer) => {
								UserAvatar($$renderer, {
									slot: 'avatar',
									size: 'md',
									image,
									imageDescription: 'Richard Hendricks'
								});
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			skipToContent: ($$renderer) => {
				{
					SkipToContent($$renderer, {});
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Content($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1>Welcome</h1>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}