import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";
import MetaMask from "$icons/MetaMask.svelte";
import CoinbaseWallet from "$icons/CoinbaseWallet.svelte";
import OperaWallet from "$icons/OperaWallet.svelte";
import Fortmatic from "$icons/Fortmatic.svelte";
import WalletConnect from "$icons/WalletConnect.svelte";
import { QuestionCircleOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <ul class="my-4 space-y-3"><li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"><!> <span class="ms-3 flex-1 whitespace-nowrap">MetaMask</span> <span class="ms-3 inline-flex items-center justify-center rounded-sm bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">Popular</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"><!> <span class="ms-3 flex-1 whitespace-nowrap">Coinbase Wallet</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"><!> <span class="ms-3 flex-1 whitespace-nowrap">Opera Wallet</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"><!> <span class="ms-3 flex-1 whitespace-nowrap">WalletConnect</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"><!> <span class="ms-3 flex-1 whitespace-nowrap">Fortmatic</span></a></li></ul> <div><a href="/" class="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"><!> Why do I need to connect with my wallet?</a></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Crypto($$anchor) {
	let walletModal = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(walletModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Crypto wallet modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		title: 'Connect wallet',
		size: 'xs',
		get open() {
			return $.get(walletModal);
		},

		set open($$value) {
			$.set(walletModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			P(node_2, {
				class: 'text-sm font-normal text-gray-500 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Connect with one of our available wallet providers or create a new one.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var ul = $.sibling(node_2, 2);
			var li = $.child(ul);
			var a = $.child(li);
			var node_3 = $.child(a);

			MetaMask(node_3, {});
			$.next(4);
			$.reset(a);
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var a_1 = $.child(li_1);
			var node_4 = $.child(a_1);

			CoinbaseWallet(node_4, {});
			$.next(2);
			$.reset(a_1);
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var a_2 = $.child(li_2);
			var node_5 = $.child(a_2);

			OperaWallet(node_5, {});
			$.next(2);
			$.reset(a_2);
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var a_3 = $.child(li_3);
			var node_6 = $.child(a_3);

			WalletConnect(node_6, {});
			$.next(2);
			$.reset(a_3);
			$.reset(li_3);

			var li_4 = $.sibling(li_3, 2);
			var a_4 = $.child(li_4);
			var node_7 = $.child(a_4);

			Fortmatic(node_7, {});
			$.next(2);
			$.reset(a_4);
			$.reset(li_4);
			$.reset(ul);

			var div = $.sibling(ul, 2);
			var a_5 = $.child(div);
			var node_8 = $.child(a_5);

			QuestionCircleOutline(node_8, { class: 'me-2 h-3 w-3' });
			$.next();
			$.reset(a_5);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}