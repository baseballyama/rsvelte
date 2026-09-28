import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { writable } from 'svelte/store';
import { Navbar, SendVerificationEmailModal, Sidebar } from '$lib/components';

var root = $.from_html(`<div class="verify-email-page svelte-1ul38ce"><!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $sideBarIsOpen = () => $.store_get(sideBarIsOpen, '$sideBarIsOpen', $$stores);
	const $showAccountMenu = () => $.store_get(showAccountMenu, '$showAccountMenu', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let sideBarIsOpen = writable(false);
	let showAccountMenu = writable(false);
	let showVerificationModal = $.state(!page.data.account?.emailVerification);

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

	var div = root();

	$.head('1ul38ce', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Verify Email - Appwrite';
		});
	});

	var node = $.child(div);

	Navbar(node, $.spread_props(() => navbarProps, {
		get sideBarIsOpen() {
			$.mark_store_binding();

			return $sideBarIsOpen();
		},

		set sideBarIsOpen($$value) {
			$.store_set(sideBarIsOpen, $$value);
		},

		get showAccountMenu() {
			$.mark_store_binding();

			return $showAccountMenu();
		},

		set showAccountMenu($$value) {
			$.store_set(showAccountMenu, $$value);
		}
	}));

	var node_1 = $.sibling(node, 2);

	Sidebar(node_1, {
		get project() {
			return project;
		},

		get avatar() {
			return navbarProps.avatar;
		},

		get progressCard() {
			return progressCard;
		},
		state: 'open',
		get sideBarIsOpen() {
			$.mark_store_binding();

			return $sideBarIsOpen();
		},

		set sideBarIsOpen($$value) {
			$.store_set(sideBarIsOpen, $$value);
		},

		get showAccountMenu() {
			$.mark_store_binding();

			return $showAccountMenu();
		},

		set showAccountMenu($$value) {
			$.store_set(showAccountMenu, $$value);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => page.data.account?.email);

		SendVerificationEmailModal(node_2, {
			get email() {
				return $.get($0);
			},

			get show() {
				return $.get(showVerificationModal);
			},

			set show($$value) {
				$.set(showVerificationModal, $$value, true);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}