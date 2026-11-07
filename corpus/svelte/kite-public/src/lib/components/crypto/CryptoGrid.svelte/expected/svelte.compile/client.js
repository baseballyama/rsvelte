import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconRefresh, IconTrendingDown, IconTrendingUp } from '@tabler/icons-svelte';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_svg(`<svg class="h-5 w-[60px]" viewBox="0 0 60 20"><path fill="none" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`);
var root_1 = $.from_html(`<div><!> <span> </span></div>`);
var root_2 = $.from_html(`<div class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><div class="flex items-start justify-between"><div class="flex items-center gap-2"><div><img class="h-full w-full"/></div> <div class="flex flex-col"><span class="text-xs font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-[10px] text-gray-600 dark:text-gray-400"> </span></div></div> <!></div> <div class="mt-2"><div class="text-lg font-bold text-gray-900 dark:text-gray-100"> </div> <!></div></div>`);
var root_3 = $.from_html(`<div class="mb-4 hidden md:block"><div class="mb-3 flex items-center justify-between"><h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100"> </h3> <button class="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800" aria-label="Refresh prices"><!></button></div> <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"></div></div>`);

export default function CryptoGrid($$anchor, $$props) {
	$.push($$props, true);

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

	let loading = $.state(true);
	let data = $.state($.proxy(new Map()));
	let refreshing = $.state(false);

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

			$.set(data, newData, true);
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function handleRefresh() {
		$.set(refreshing, true);
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

	var div = root_3();
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var button = $.sibling(h3, 2);
	var node = $.child(button);

	{
		let $0 = $.derived(() => $.get(refreshing) ? 'animate-spin' : '');

		IconRefresh(node, {
			get class() {
				return `h-4 w-4 ${$.get($0) ?? ''}`;
			}
		});
	}

	$.reset(button);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 21, () => cryptos, $.index, ($$anchor, crypto) => {
		const priceData = $.derived(() => $.get(data).get($.get(crypto).id));
		const isPositive = $.derived(() => ($.get(priceData)?.priceChangePercentage24h ?? 0) >= 0);

		const sparklinePath = $.derived(() => $.get(priceData)?.sparkline
			? generateSparklinePath($.get(priceData).sparkline)
			: '');

		var div_3 = root_2();
		var div_4 = $.child(div_3);
		var div_5 = $.child(div_4);
		var div_6 = $.child(div_5);
		var img_1 = $.only_child(div_6);
		var div_7 = $.sibling(div_6, 2);
		var span = $.child(div_7);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);

		$.reset(div_7);
		$.reset(div_5);

		var node_1 = $.sibling(div_5, 2);

		{
			var consequent = ($$anchor) => {
				var svg = root();
				var path = $.only_child(svg);

				$.template_effect(() => {
					$.set_attribute(path, 'd', $.get(sparklinePath));
					$.set_attribute(path, 'stroke', $.get(isPositive) ? '#16a34a' : '#dc2626');
				});

				$.append($$anchor, svg);
			};

			$.if(node_1, ($$render) => {
				if (!$.get(loading) && $.get(sparklinePath)) $$render(consequent);
			});
		}

		$.reset(div_4);

		var div_8 = $.sibling(div_4, 2);
		var div_9 = $.child(div_8);
		var text_3 = $.only_child(div_9, true);
		var node_2 = $.sibling(div_9, 2);

		{
			var consequent_2 = ($$anchor) => {
				var div_10 = root_1();
				var node_3 = $.child(div_10);

				{
					var consequent_1 = ($$anchor) => {
						IconTrendingUp($$anchor, { class: 'h-3 w-3' });
					};

					var alternate = ($$anchor) => {
						IconTrendingDown($$anchor, { class: 'h-3 w-3' });
					};

					$.if(node_3, ($$render) => {
						if ($.get(isPositive)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				var span_2 = $.sibling(node_3, 2);
				var text_4 = $.only_child(span_2);

				$.reset(div_10);

				$.template_effect(
					($0) => {
						$.set_class(div_10, 1, `flex items-center gap-1 text-xs font-medium ${$.get(isPositive)
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'}`);

						$.set_text(text_4, `${$.get(isPositive) ? '+' : ''}${$0 ?? ''}%`);
					},
					[() => $.get(priceData).priceChangePercentage24h.toFixed(2)]
				);

				$.append($$anchor, div_10);
			};

			$.if(node_2, ($$render) => {
				if (!$.get(loading) && $.get(priceData)) $$render(consequent_2);
			});
		}

		$.reset(div_8);
		$.reset(div_3);

		$.template_effect(
			($0) => {
				$.set_class(div_6, 1, `flex h-8 w-8 items-center justify-center rounded-full ${$.get(crypto).color ?? ''} p-1`);
				$.set_attribute(img_1, 'src', `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${(symbolMap[$.get(crypto).id] || 'btc') ?? ''}.svg`);
				$.set_attribute(img_1, 'alt', $.get(crypto).id);
				$.set_text(text_1, $.get(priceData)?.symbol || '...');
				$.set_text(text_2, $.get(priceData)?.name || $.get(crypto).id);
				$.set_text(text_3, $0);
			},
			[
				() => $.get(loading) || !$.get(priceData) ? '...' : formatPrice($.get(priceData).price)
			]
		);

		$.event('error', img_1, (e) => {
			const img = e.currentTarget;

			img.src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/btc.svg';
		});

		$.replay_events(img_1);
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			button.disabled = $.get(refreshing);
		},
		[() => s('crypto.grid.title')]
	);

	$.delegated('click', button, handleRefresh);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);