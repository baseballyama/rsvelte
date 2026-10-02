import * as $ from 'svelte/internal/server';
import { IconRefresh, IconTrendingDown, IconTrendingUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

export default function CryptoPrice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cryptoId = 'bitcoin', showStats = true } = $$props;
		let loading = true;
		let data = null;
		let refreshing = false;

		async function fetchPrice() {
			try {
				const response = await fetch(`/api/widgets/crypto/price?id=${cryptoId}`);

				if (response.ok) {
					const result = await response.json();

					data = result.data;
				}
			} catch(error) {
				console.error(`Failed to fetch ${cryptoId} price:`, error);
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
			await fetchPrice();
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

		// Format large numbers (market cap, volume)
		function formatLargeNumber(num) {
			if (num >= 1e12) {
				return `$${(num / 1e12).toFixed(2)}T`;
			} else if (num >= 1e9) {
				return `$${(num / 1e9).toFixed(2)}B`;
			} else if (num >= 1e6) {
				return `$${(num / 1e6).toFixed(2)}M`;
			}

			return `$${num.toFixed(0)}`;
		}

		// Generate SVG path for sparkline
		function generateSparklinePath(prices) {
			if (!prices || prices.length === 0) return '';

			const width = 120;
			const height = 30;
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

		// Crypto color schemes
		const cryptoColors = {
			bitcoin: {
				bg: 'from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900',
				border: 'border-orange-200 dark:border-gray-700',
				icon: 'bg-orange-500'
			},
			ethereum: {
				bg: 'from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900',
				border: 'border-purple-200 dark:border-gray-700',
				icon: 'bg-purple-500'
			},
			default: {
				bg: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
				border: 'border-gray-200 dark:border-gray-700',
				icon: 'bg-blue-500'
			}
		};

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

		const colors = $.derived(() => cryptoColors[cryptoId] || cryptoColors.default);

		const sparklinePath = $.derived(() => {
			if (data?.sparkline) {
				return generateSparklinePath(data.sparkline);
			}

			return '';
		});

		const isPositive = $.derived(() => {
			if (data) {
				return data.priceChangePercentage24h >= 0;
			}

			return false;
		});

		const iconSymbol = $.derived(() => symbolMap[cryptoId] || 'btc');

		onMount(() => {
			fetchPrice();

			// Refresh every 2 minutes
			const interval = setInterval(fetchPrice, 120000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div${$.attr_class(`mb-4 rounded-lg border ${$.stringify(colors().border)} bg-gradient-to-br ${$.stringify(colors().bg)}`)}><div class="flex items-center justify-between px-4 py-3"><div class="flex items-center gap-3"><div${$.attr_class(`flex h-10 w-10 items-center justify-center rounded-full ${$.stringify(colors().icon)} p-1.5`)}><img${$.attr('src', `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${$.stringify(iconSymbol())}.svg`)}${$.attr('alt', cryptoId)} class="h-full w-full" onerror="this.__e=event"/></div> <div class="flex flex-col"><div class="flex items-baseline gap-2">`);

		if (!loading && data) {
			$$renderer.push(`<!--[0--><span class="text-xs font-medium text-gray-600 dark:text-gray-400">${$.escape(data.symbol)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">${$.escape(loading ? '...' : formatPrice(data?.price ?? 0))}</span> `);

		if (!loading && data) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`flex items-center gap-1 text-sm font-medium ${isPositive()
				? 'text-green-600 dark:text-green-400'
				: 'text-red-600 dark:text-red-400'}`)}>`);

			if (isPositive()) {
				$$renderer.push('<!--[0-->');
				IconTrendingUp($$renderer, { class: 'h-4 w-4' });
			} else {
				$$renderer.push('<!--[-1-->');
				IconTrendingDown($$renderer, { class: 'h-4 w-4' });
			}

			$$renderer.push(`<!--]--> <span>${$.escape(isPositive() ? '+' : '')}${$.escape(data.priceChangePercentage24h.toFixed(2))}%</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex gap-3 text-xs text-gray-600 dark:text-gray-400">`);

		if (!loading && data) {
			$$renderer.push(`<!--[0--><span>24h: ${$.escape(formatPrice(data.low24h))} - ${$.escape(formatPrice(data.high24h))}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="flex items-center gap-3">`);

		if (!loading && data && sparklinePath()) {
			$$renderer.push(`<!--[0--><svg class="h-8 w-[120px]" viewBox="0 0 120 30"><path${$.attr('d', sparklinePath())} fill="none"${$.attr('stroke', isPositive() ? '#16a34a' : '#dc2626')} stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button${$.attr('disabled', refreshing, true)} class="rounded p-1.5 text-gray-600 transition-colors hover:bg-white/50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700/50" aria-label="Refresh price">`);
		IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
		$$renderer.push(`<!----></button></div></div></div>`);
	});
}