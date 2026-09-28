import * as $ from 'svelte/internal/server';
import { onDestroy, onMount } from 'svelte';
import LoginModal from './login-modal.svelte';
import SignupModal from './signup-modal.svelte';
import { onNavigate } from '$app/navigation';
import { showModal } from '$lib/core/components/index.js';
import ForgotPasswordModal from './forgot-password-modal.svelte';

export default function Auth_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = void 0 } = $$props;
		let type = 'login';
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
			if (!show || !ownsHistoryEntry) return;

			ownsHistoryEntry = false;
			show = false;
			removeAuthParamsFromCurrentUrl();
		}

		const checkStateAndAct = () => {
			const urlParams = new URLSearchParams(window?.location?.search);

			if (urlParams) {
				const signup = urlParams.has('signup');
				const login = urlParams.has('login');
				const forgotPassword = urlParams.has('forgot-password');

				if (signup) type = 'signup';
				if (login) type = 'login';
				if (forgotPassword) type = 'forgot-password';
				if (urlParams.get('show_auth') === 'true') show = true;
				if (urlParams.get('show_auth') === 'false') show = false;
			}
		};

		onMount(() => {
			showModal.subscribe((val) => {
				if (val) {
					show = val;
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

		onDestroy(() => {
			unlockPageScroll();

			if (typeof window !== 'undefined' && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
				history.back();
			}
		});

		onNavigate(() => {
			checkStateAndAct();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div>`);

			if (type === 'signup') {
				$$renderer.push('<!--[0-->');

				SignupModal($$renderer, {
					manageHistory: false,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					}
				});
			} else if (type === 'login') {
				$$renderer.push('<!--[1-->');

				LoginModal($$renderer, {
					manageHistory: false,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					}
				});
			} else if (type === 'forgot-password') {
				$$renderer.push('<!--[2-->');

				ForgotPasswordModal($$renderer, {
					manageHistory: false,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}