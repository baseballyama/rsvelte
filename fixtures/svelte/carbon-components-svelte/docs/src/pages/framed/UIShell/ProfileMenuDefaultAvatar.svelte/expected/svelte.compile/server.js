import * as $ from 'svelte/internal/server';

import {
	Content,
	Header,
	HeaderUtilities,
	ProfileMenu,
	ProfileMenuDivider,
	ProfileMenuHeader,
	ProfileMenuItem,
	ProfileMenuList,
	SkipToContent
} from "carbon-components-svelte";

import Logout from "carbon-icons-svelte/lib/Logout.svelte";

export default function ProfileMenuDefaultAvatar($$renderer) {
	Header($$renderer, {
		companyName: 'IBM',
		platformName: 'Carbon Svelte',
		children: ($$renderer) => {
			HeaderUtilities($$renderer, {
				children: ($$renderer) => {
					ProfileMenu($$renderer, {
						iconDescription: 'Profile',
						children: ($$renderer) => {
							ProfileMenuHeader($$renderer, { name: 'Richard Hendricks', username: 'rhendricks', href: '/' });
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
						$$slots: { default: true }
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