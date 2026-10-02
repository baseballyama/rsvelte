import * as $ from 'svelte/internal/server';
import { IconRefresh, IconTrendingDown, IconTrendingUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

export default function CryptoGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Popular cryptocurrencies to display
		const cryptos = [
			{ id: 'bitcoin', color: 'bg-orange-500' },
			{ id: 'ethereum', color: 'bg-purple-500' },
			{ id: 'binancecoin', color: 'bg-yellow-500' },
			{ id: 'solana', color: 'bg-green-500' },
			{ id: 'ripple', color: 'bg-blue-500' },
			{ id: 'cardano', color: 'bg-indigo-500' },
			{ id: 'avalanche-2', color: 'bg-red-500' },
			{ id: 'polkadot', color: 'bg-pink-500' }
		];

		let loading = true;
		let data = new Map();
		let refreshing = false;

		async function fetchPrices() {
			try {
				const newData = new Map();

				// Fetch all in parallel - DIA API has no rate limits
				const promises = cryptos.map(async (crypto) => {
					try {
						const response = await fetch(`/api/widgets/crypto/price?id=${crypto.id}`);

						if (response.ok) {
							const result = await response.json();

							if (result?.data) {
								return [crypto.id, result.data];
							}
						}
					} catch(err) {
						console.error(`Failed to fetch ${crypto.id}:`, err);
					}

					return null;
				});

				const results = await Promise.all(promises);

				// Update data with all results
				results.forEach((result) => {
					if (result) {
						newData.set(result[0], result[1]);
					}
				});

				data = newData;
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
			await fetchPrices();
		}

		// Format price with appropriate decimals
		function formatPrice(price) {
			const decimals = price < 1 ? 4 : price < 100 ? 2 : 0;

			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			}).format(price);
		}

		// Generate SVG path for sparkline
		function generateSparklinePath(prices) {
			if (!prices || prices.length === 0) return '';

			const width = 60;
			const height = 20;
			const min = Math.min(...prices);
			const max = Math.max(...prices);
			const range = max - min || 1;

			const points = prices.map((price, index) => {
				const x = index / (prices.length - 1) * width;
				const y = height - (price - min) / range * height;

				return `${x},${y}`;
			});

			return `M ${points.join(' L ')}`;
		}

		// Symbol mapping for cryptocurrency-icons library
		const symbolMap = {
			bitcoin: 'btc',
			ethereum: 'eth',
			binancecoin: 'bnb',
			solana: 'sol',
			ripple: 'xrp',
			cardano: 'ada',
			'avalanche-2': 'avax',
			polkadot: 'dot'
		};

		onMount(() => {
			fetchPrices();

			// Refresh every 2 minutes
			const interval = setInterval(fetchPrices, 120000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 hidden md:block"><div class="mb-3 flex items-center justify-between"><h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${$.escape(s('crypto.grid.title'))}</h3> <button${$.attr('disabled', refreshing, true)} class="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800" aria-label="Refresh prices">`);
		IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
		$$renderer.push(`<!----></button></div> <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);

		const each_array = $.ensure_array_like(cryptos);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let crypto = each_array[$$index];
			const priceData = data.get(crypto.id);
			const isPositive = (priceData?.priceChangePercentage24h ?? 0) >= 0;
			const sparklinePath = priceData?.sparkline ? generateSparklinePath(priceData.sparkline) : '';

			$$renderer.push(`<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><div class="flex items-start justify-between"><div class="flex items-center gap-2"><div${$.attr_class(`flex h-8 w-8 items-center justify-center rounded-full ${$.stringify(crypto.color)} p-1`)}><img${$.attr('src', `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${$.stringify(symbolMap[crypto.id] || 'btc')}.svg`)}${$.attr('alt', crypto.id)} class="h-full w-full" onerror="this.__e=event"/></div> <div class="flex flex-col"><span class="text-xs font-medium text-gray-900 dark:text-gray-100">${$.escape(priceData?.symbol || '...')}</span> <span class="text-[10px] text-gray-600 dark:text-gray-400">${$.escape(priceData?.name || crypto.id)}</span></div></div> `);

			if (!loading && sparklinePath) {
				$$renderer.push(`<!--[0--><svg class="h-5 w-[60px]" viewBox="0 0 60 20"><path${$.attr('d', sparklinePath)} fill="none"${$.attr('stroke', isPositive ? '#16a34a' : '#dc2626')} stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="mt-2"><div class="text-lg font-bold text-gray-900 dark:text-gray-100">${$.escape(loading || !priceData ? '...' : formatPrice(priceData.price))}</div> `);

			if (!loading && priceData) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`flex items-center gap-1 text-xs font-medium ${isPositive
					? 'text-green-600 dark:text-green-400'
					: 'text-red-600 dark:text-red-400'}`)}>`);

				if (isPositive) {
					$$renderer.push('<!--[0-->');
					IconTrendingUp($$renderer, { class: 'h-3 w-3' });
				} else {
					$$renderer.push('<!--[-1-->');
					IconTrendingDown($$renderer, { class: 'h-3 w-3' });
				}

				$$renderer.push(`<!--]--> <span>${$.escape(isPositive ? '+' : '')}${$.escape(priceData.priceChangePercentage24h.toFixed(2))}%</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}