import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';
import LoginModal from './login-modal.svelte';
import SignupModal from './signup-modal.svelte';
import { onNavigate } from '$app/navigation';
import { showModal } from '$lib/core/components/index.js';
import ForgotPasswordModal from './forgot-password-modal.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Auth_modal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15);
	let type = $.state('login');
	const modalHistoryKey = '__svelteCommerceAuthModal';
	let ownsHistoryEntry = false;
	let scrollLock;

	function lockPageScroll() {
		if (typeof window === 'undefined' || scrollLock) return;

		const scrollY = window.scrollY;

		scrollLock = {
			scrollY,
			bodyOverflow: document.body.style.overflow,
			bodyPosition: document.body.style.position,
			bodyTop: document.body.style.top,
			bodyWidth: document.body.style.width,
			htmlOverflow: document.documentElement.style.overflow
		};

		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';
	}

	function unlockPageScroll() {
		if (typeof window === 'undefined' || !scrollLock) return;

		const {
			scrollY,
			bodyOverflow,
			bodyPosition,
			bodyTop,
			bodyWidth,
			htmlOverflow
		} = scrollLock;

		document.documentElement.style.overflow = htmlOverflow;
		document.body.style.overflow = bodyOverflow;
		document.body.style.position = bodyPosition;
		document.body.style.top = bodyTop;
		document.body.style.width = bodyWidth;
		scrollLock = undefined;
		window.scrollTo(0, scrollY);
	}

	function removeAuthParamsFromCurrentUrl() {
		const url = new URL(window.location.href);

		for (const parameter of ['show_auth', 'login', 'signup', 'forgot-password']) {
			url.searchParams.delete(parameter);
		}

		history.replaceState(history.state, '', url);
	}

	function handleBrowserBack() {
		if (!show() || !ownsHistoryEntry) return;

		ownsHistoryEntry = false;
		show(false);
		removeAuthParamsFromCurrentUrl();
	}

	const checkStateAndAct = () => {
		const urlParams = new URLSearchParams(window?.location?.search);

		if (urlParams) {
			const signup = urlParams.has('signup');
			const login = urlParams.has('login');
			const forgotPassword = urlParams.has('forgot-password');

			if (signup) $.set(type, 'signup');
			if (login) $.set(type, 'login');
			if (forgotPassword) $.set(type, 'forgot-password');
			if (urlParams.get('show_auth') === 'true') show(true);
			if (urlParams.get('show_auth') === 'false') show(false);
		}
	};

	onMount(() => {
		showModal.subscribe((val) => {
			if (val) {
				show(val);
				checkStateAndAct();
			}
		});
	});

	onMount(() => {
		checkStateAndAct();
	});

	onMount(() => {
		window.addEventListener('popstate', handleBrowserBack);

		return () => window.removeEventListener('popstate', handleBrowserBack);
	});

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		if (show() && !ownsHistoryEntry) {
			history.pushState({ ...history.state, [modalHistoryKey]: true }, '', window.location.href);
			ownsHistoryEntry = true;
		} else if (!show() && ownsHistoryEntry) {
			const isCurrentModalEntry = history.state?.[modalHistoryKey] === true;

			ownsHistoryEntry = false;

			if (isCurrentModalEntry) history.back();
		}
	});

	$.user_effect(() => {
		if (show()) lockPageScroll(); else unlockPageScroll();
	});

	onDestroy(() => {
		unlockPageScroll();

		if (typeof window !== 'undefined' && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
			history.back();
		}
	});

	onNavigate(() => {
		checkStateAndAct();
	});

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			SignupModal($$anchor, {
				manageHistory: false,
				get show() {
					return show();
				},

				set show($$value) {
					show($$value);
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			LoginModal($$anchor, {
				manageHistory: false,
				get show() {
					return show();
				},

				set show($$value) {
					show($$value);
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			ForgotPasswordModal($$anchor, {
				manageHistory: false,
				get show() {
					return show();
				},

				set show($$value) {
					show($$value);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(type) === 'signup') $$render(consequent); else if ($.get(type) === 'login') $$render(consequent_1, 1); else if ($.get(type) === 'forgot-password') $$render(consequent_2, 2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}