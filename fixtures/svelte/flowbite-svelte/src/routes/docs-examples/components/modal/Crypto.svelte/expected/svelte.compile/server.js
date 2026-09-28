import * as $ from 'svelte/internal/server';
import { Button, Modal, P } from "flowbite-svelte";
import MetaMask from "$icons/MetaMask.svelte";
import CoinbaseWallet from "$icons/CoinbaseWallet.svelte";
import OperaWallet from "$icons/OperaWallet.svelte";
import Fortmatic from "$icons/Fortmatic.svelte";
import WalletConnect from "$icons/WalletConnect.svelte";
import { QuestionCircleOutline } from "flowbite-svelte-icons";

export default function Crypto($$renderer) {
	let walletModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => walletModal = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Crypto wallet modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			title: 'Connect wallet',
			size: 'xs',
			get open() {
				return walletModal;
			},

			set open($$value) {
				walletModal = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				P($$renderer, {
					class: 'text-sm font-normal text-gray-500 dark:text-gray-400',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Connect with one of our available wallet providers or create a new one.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <ul class="my-4 space-y-3"><li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">`);
				MetaMask($$renderer, {});
				$$renderer.push(`<!----> <span class="ms-3 flex-1 whitespace-nowrap">MetaMask</span> <span class="ms-3 inline-flex items-center justify-center rounded-sm bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">Popular</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">`);
				CoinbaseWallet($$renderer, {});
				$$renderer.push(`<!----> <span class="ms-3 flex-1 whitespace-nowrap">Coinbase Wallet</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">`);
				OperaWallet($$renderer, {});
				$$renderer.push(`<!----> <span class="ms-3 flex-1 whitespace-nowrap">Opera Wallet</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">`);
				WalletConnect($$renderer, {});
				$$renderer.push(`<!----> <span class="ms-3 flex-1 whitespace-nowrap">WalletConnect</span></a></li> <li><a href="/" class="group flex items-center rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">`);
				Fortmatic($$renderer, {});
				$$renderer.push(`<!----> <span class="ms-3 flex-1 whitespace-nowrap">Fortmatic</span></a></li></ul> <div><a href="/" class="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400">`);
				QuestionCircleOutline($$renderer, { class: 'me-2 h-3 w-3' });
				$$renderer.push(`<!----> Why do I need to connect with my wallet?</a></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}