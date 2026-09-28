import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconRefresh, IconTrendingDown, IconTrendingUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<span class="text-xs font-medium text-gray-600 dark:text-gray-400"> </span>`);
var root_1 = $.from_html(`<div><!> <span> </span></div>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_svg(`<svg class="h-8 w-[120px]" viewBox="0 0 120 30"><path fill="none" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`);
var root_4 = $.from_html(`<div><div class="flex items-center justify-between px-4 py-3"><div class="flex items-center gap-3"><div><img class="h-full w-full"/></div> <div class="flex flex-col"><div class="flex items-baseline gap-2"><!> <span class="text-2xl font-bold text-gray-900 dark:text-gray-100"> </span> <!></div> <div class="flex gap-3 text-xs text-gray-600 dark:text-gray-400"><!></div></div></div> <div class="flex items-center gap-3"><!> <button class="rounded p-1.5 text-gray-600 transition-colors hover:bg-white/50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700/50" aria-label="Refresh price"><!></button></div></div></div>`);

export default function CryptoPrice($$anchor, $$props) {
	$.push($$props, true);

	let cryptoId = $.prop($$props, 'cryptoId', 3, 'bitcoin'),
		showStats = $.prop($$props, 'showStats', 3, true);

	let loading = $.state(true);
	let data = $.state(null);
	let refreshing = $.state(false);

	async function fetchPrice() {
		try {
			const response = await fetch(`/api/widgets/crypto/price?id=${cryptoId()}`);

			if (response.ok) {
				const result = await response.json();

				$.set(data, result.data, true);
			}
		} catch(error) {
			console.error(`Failed to fetch ${cryptoId()} price:`, error);
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function handleRefresh() {
		$.set(refreshing, true);
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

	const colors = $.derived(() => cryptoColors[cryptoId()] || cryptoColors.default);

	const sparklinePath = $.derived(() => {
		if ($.get(data)?.sparkline) {
			return generateSparklinePath($.get(data).sparkline);
		}

		return '';
	});

	const isPositive = $.derived(() => {
		if ($.get(data)) {
			return $.get(data).priceChangePercentage24h >= 0;
		}

		return false;
	});

	const iconSymbol = $.derived(() => symbolMap[cryptoId()] || 'btc');

	onMount(() => {
		fetchPrice();

		// Refresh every 2 minutes
		const interval = setInterval(fetchPrice, 120000);

		return () => clearInterval(interval);
	});

	var div = root_4();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var img_1 = $.only_child(div_3);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $.get(data).symbol));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (!$.get(loading) && $.get(data)) $$render(consequent);
		});
	}

	var span_1 = $.sibling(node, 2);
	var text_1 = $.only_child(span_1, true);
	var node_1 = $.sibling(span_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_6 = root_1();
			var node_2 = $.child(div_6);

			{
				var consequent_1 = ($$anchor) => {
					IconTrendingUp($$anchor, { class: 'h-4 w-4' });
				};

				var alternate = ($$anchor) => {
					IconTrendingDown($$anchor, { class: 'h-4 w-4' });
				};

				$.if(node_2, ($$render) => {
					if ($.get(isPositive)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var span_2 = $.sibling(node_2, 2);
			var text_2 = $.only_child(span_2);

			$.reset(div_6);

			$.template_effect(
				($0) => {
					$.set_class(div_6, 1, `flex items-center gap-1 text-sm font-medium ${$.get(isPositive)
						? 'text-green-600 dark:text-green-400'
						: 'text-red-600 dark:text-red-400'}`);

					$.set_text(text_2, `${$.get(isPositive) ? '+' : ''}${$0 ?? ''}%`);
				},
				[() => $.get(data).priceChangePercentage24h.toFixed(2)]
			);

			$.append($$anchor, div_6);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(loading) && $.get(data)) $$render(consequent_2);
		});
	}

	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var node_3 = $.child(div_7);

	{
		var consequent_3 = ($$anchor) => {
			var span_3 = root_2();
			var text_3 = $.only_child(span_3);

			$.template_effect(($0, $1) => $.set_text(text_3, `24h: ${$0 ?? ''} - ${$1 ?? ''}`), [
				() => formatPrice($.get(data).low24h),
				() => formatPrice($.get(data).high24h)
			]);

			$.append($$anchor, span_3);
		};

		$.if(node_3, ($$render) => {
			if (!$.get(loading) && $.get(data)) $$render(consequent_3);
		});
	}

	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var node_4 = $.child(div_8);

	{
		var consequent_4 = ($$anchor) => {
			var svg = root_3();
			var path = $.only_child(svg);

			$.template_effect(() => {
				$.set_attribute(path, 'd', $.get(sparklinePath));
				$.set_attribute(path, 'stroke', $.get(isPositive) ? '#16a34a' : '#dc2626');
			});

			$.append($$anchor, svg);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(loading) && $.get(data) && $.get(sparklinePath)) $$render(consequent_4);
		});
	}

	var button = $.sibling(node_4, 2);
	var node_5 = $.child(button);

	{
		let $0 = $.derived(() => $.get(refreshing) ? 'animate-spin' : '');

		IconRefresh(node_5, {
			get class() {
				return `h-4 w-4 ${$.get($0) ?? ''}`;
			}
		});
	}

	$.reset(button);
	$.reset(div_8);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `mb-4 rounded-lg border ${$.get(colors).border ?? ''} bg-gradient-to-br ${$.get(colors).bg ?? ''}`);
			$.set_class(div_3, 1, `flex h-10 w-10 items-center justify-center rounded-full ${$.get(colors).icon ?? ''} p-1.5`);
			$.set_attribute(img_1, 'src', `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${$.get(iconSymbol) ?? ''}.svg`);
			$.set_attribute(img_1, 'alt', cryptoId());
			$.set_text(text_1, $0);
			button.disabled = $.get(refreshing);
		},
		[
			() => $.get(loading) ? '...' : formatPrice($.get(data)?.price ?? 0)
		]
	);

	$.event('error', img_1, (e) => {
		const img = e.currentTarget;

		img.src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/btc.svg';
	});

	$.replay_events(img_1);
	$.delegated('click', button, handleRefresh);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);