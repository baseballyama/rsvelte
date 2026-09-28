import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { writable } from 'svelte/store';
import { Navbar, SendVerificationEmailModal, Sidebar } from '$lib/components';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let sideBarIsOpen = writable(false);
		let showAccountMenu = writable(false);
		let showVerificationModal = !page.data.account?.emailVerification;

		// fake props!
		const project = { region: 'fra', $id: 'appwrite', name: 'New Project' };

		const progressCard = { title: 'Get started', percentage: 33 };

		const navbarProps = {
			logo: {
				src: 'https://appwrite.io/images/logos/logo.svg',
				alt: 'Logo Appwrite'
			},
			avatar: undefined,
			organizations: []
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1ul38ce', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Verify Email - Appwrite</title>`);
				});
			});

			$$renderer.push(`<div class="verify-email-page svelte-1ul38ce">`);

			Navbar($$renderer, $.spread_props([
				navbarProps,
				{
					get sideBarIsOpen() {
						return $.store_get($$store_subs ??= {}, '$sideBarIsOpen', sideBarIsOpen);
					},

					set sideBarIsOpen($$value) {
						$.store_set(sideBarIsOpen, $$value);
						$$settled = false;
					},

					get showAccountMenu() {
						return $.store_get($$store_subs ??= {}, '$showAccountMenu', showAccountMenu);
					},

					set showAccountMenu($$value) {
						$.store_set(showAccountMenu, $$value);
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----> `);

			Sidebar($$renderer, {
				project,
				avatar: navbarProps.avatar,
				progressCard,
				state: 'open',
				get sideBarIsOpen() {
					return $.store_get($$store_subs ??= {}, '$sideBarIsOpen', sideBarIsOpen);
				},

				set sideBarIsOpen($$value) {
					$.store_set(sideBarIsOpen, $$value);
					$$settled = false;
				},

				get showAccountMenu() {
					return $.store_get($$store_subs ??= {}, '$showAccountMenu', showAccountMenu);
				},

				set showAccountMenu($$value) {
					$.store_set(showAccountMenu, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SendVerificationEmailModal($$renderer, {
				email: page.data.account?.email,
				get show() {
					return showVerificationModal;
				},

				set show($$value) {
					showVerificationModal = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}