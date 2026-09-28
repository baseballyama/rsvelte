import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

var root = $.from_html(`<button><div class="example-label svelte-rxppz9"> </div> <code class="example-input svelte-rxppz9"> </code> <div class="example-desc svelte-rxppz9"> </div></button>`);
var root_1 = $.from_html(`<div class="card loading-card svelte-rxppz9"><div class="loading-content svelte-rxppz9"><!> <span>Generating IP addresses...</span></div></div>`);
var root_2 = $.from_html(`<div class="info-item svelte-rxppz9"><span class="svelte-rxppz9">Broadcast:</span> <code class="svelte-rxppz9"> </code></div>`);
var root_3 = $.from_html(`<div class="network-info svelte-rxppz9"><div class="info-item svelte-rxppz9"><span class="svelte-rxppz9">Network:</span> <code class="svelte-rxppz9"> </code></div> <!></div>`);
var root_4 = $.from_html(`<span class="truncated-notice svelte-rxppz9"> </span>`);
var root_5 = $.from_html(`<div class="address-item svelte-rxppz9"><span class="address-index svelte-rxppz9"></span> <code class="address-code svelte-rxppz9"> </code> <button><!></button></div>`);
var root_6 = $.from_html(`<div class="card summary-card svelte-rxppz9"><div class="card-header"><h3><!> Results</h3></div> <div class="export-actions svelte-rxppz9"><button class="export-btn svelte-rxppz9"><!> JSON</button> <button class="export-btn svelte-rxppz9"><!> CSV</button> <button><!> Copy All</button></div> <div class="summary-stats svelte-rxppz9"><div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9"> </span> <span class="stat-label svelte-rxppz9">Total</span></div> <div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9"> </span> <span class="stat-label svelte-rxppz9">Shown</span></div> <div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9"> </span> <span class="stat-label svelte-rxppz9">Memory</span></div></div> <!></div> <div class="card addresses-card svelte-rxppz9"><div class="card-header"><h3><!> IP Addresses</h3> <!></div> <div class="addresses-list svelte-rxppz9"></div></div>`, 1);
var root_7 = $.from_html(`<div class="card error-card svelte-rxppz9"><div class="error-content svelte-rxppz9"><!> <h3 class="svelte-rxppz9">Error</h3> <p> </p></div></div>`);
var root_8 = $.from_html(`<div class="results-grid svelte-rxppz9"><!></div>`);
var root_9 = $.from_html(`<div class="container svelte-rxppz9"><div class="card main-input-card svelte-rxppz9"><header class="card-header svelte-rxppz9"><h2 class="svelte-rxppz9">IP Enumerate</h2> <p class="svelte-rxppz9">Safely enumerate all IP addresses in CIDR blocks and ranges</p></header> <input type="text" placeholder="192.168.1.0/28 or 10.0.0.1-10.0.0.10" class="network-input svelte-rxppz9"/> <div class="options-row svelte-rxppz9"><div class="limit-control svelte-rxppz9"><label for="max-display" class="svelte-rxppz9">Max Display</label> <input id="max-display" type="number" min="1" class="limit-input svelte-rxppz9"/></div> <div class="checkbox-group svelte-rxppz9"><label class="checkbox-option svelte-rxppz9"><input type="checkbox" class="svelte-rxppz9"/> <span class="checkmark svelte-rxppz9"></span> Network</label> <label class="checkbox-option svelte-rxppz9"><input type="checkbox" class="svelte-rxppz9"/> <span class="checkmark svelte-rxppz9"></span> Broadcast</label></div></div> <div class="examples-section svelte-rxppz9"><details class="examples-details svelte-rxppz9"><summary class="examples-summary svelte-rxppz9"><!> <h4 class="svelte-rxppz9">Quick Examples</h4></summary> <div class="examples-list svelte-rxppz9"></div></details></div> <div class="safety-warning svelte-rxppz9"><!> <div><strong>Safety:</strong> </div></div></div> <!> <!></div>`);

export default function IPEnumerate($$anchor, $$props) {
	$.push($$props, true);

	// import { tooltip } from '$lib/actions/tooltip.js';
	let input = $.state('192.168.1.0/28');

	let maxDisplayLimit = $.state(1000);
	let includeNetwork = $.state(true);
	let includeBroadcast = $.state(true);
	let result = $.state(null);
	let isGenerating = $.state(false);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	// Safety limits to prevent browser crashes
	const ABSOLUTE_MAX_DISPLAY = 10000;

	const ABSOLUTE_MAX_GENERATION = 100000;

	const examples = [
		{
			label: 'Small Subnet /28',
			input: '192.168.1.0/28',
			description: '16 addresses'
		},

		{
			label: 'Point-to-Point /30',
			input: '10.0.0.0/30',
			description: '4 addresses'
		},

		{
			label: 'IP Range',
			input: '172.16.1.1-172.16.1.10',
			description: '10 addresses'
		},

		{
			label: 'Medium /24 network',
			input: '192.168.0.0/24',
			description: '256 addresses'
		},

		{
			label: 'IPv6 /126',
			input: '2001:db8::/126',
			description: '4 addresses'
		}
	];

	function loadExample(example) {
		$.set(input, example.input, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		enumerateIPs();
	}

	function parseIP(ip) {
		return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
	}

	function ipToString(ip) {
		return [
			ip >>> 24 & 0xff,
			ip >>> 16 & 0xff,
			ip >>> 8 & 0xff,
			ip & 0xff
		].join('.');
	}

	function parseIPv6(ip) {
		// Simplified IPv6 parsing for basic cases
		const parts = ip.split(':');

		let result = 0n;

		for (let i = 0; i < 8; i++) {
			if (i < parts.length && parts[i]) {
				const hexValue = parseInt(parts[i], 16);

				result = (result << 16n) + BigInt(hexValue);
			} else {
				result = result << 16n;
			}
		}

		return result;
	}

	function ipv6ToString(ip) {
		const parts = [];

		for (let i = 0; i < 8; i++) {
			const part = ip >> BigInt((7 - i) * 16) & 0xffffn;

			parts.push(part.toString(16));
		}

		return parts.join(':');
	}

	function parseCIDR(cidr) {
		const [networkStr, prefixStr] = cidr.split('/');
		const prefixLength = parseInt(prefixStr);
		const network = parseIP(networkStr) & 0xffffffff << 32 - prefixLength;
		const size = Math.pow(2, 32 - prefixLength);

		return { network, prefixLength, size };
	}

	function parseIPv6CIDR(cidr) {
		const [networkStr, prefixStr] = cidr.split('/');
		const prefixLength = parseInt(prefixStr);
		const network = parseIPv6(networkStr) & 0xffffffffffffffffffffffffffffffffn << BigInt(128 - prefixLength);
		const size = 2n ** BigInt(128 - prefixLength);

		return { network, prefixLength, size };
	}

	function parseRange(range) {
		const [startStr, endStr] = range.split('-').map((s) => s.trim());
		const start = parseIP(startStr);
		const end = parseIP(endStr);

		return { start, end, count: end - start + 1 };
	}

	function estimateMemoryUsage(count) {
		// Rough estimate: each IP string ~15 bytes + overhead
		const bytesPerIP = 20;

		const totalBytes = count * bytesPerIP;

		if (totalBytes < 1024) return `${totalBytes} B`;
		if (totalBytes < 1024 * 1024) return `${Math.round(totalBytes / 1024)} KB`;

		return `${Math.round(totalBytes / (1024 * 1024))} MB`;
	}

	async function enumerateIPs() {
		if (!$.get(input).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isGenerating, true);

		try {
			const trimmed = $.get(input).trim();
			let addresses = [];
			let totalCount = 0;
			let networkInfo = { type: 'single' };

			// Determine input type
			if (trimmed.includes('/')) {
				// CIDR notation
				if (trimmed.includes(':')) {
					// IPv6 CIDR
					const { network, size, prefixLength } = parseIPv6CIDR(trimmed);

					if (size > BigInt(ABSOLUTE_MAX_GENERATION)) {
						throw new Error(`IPv6 /${prefixLength} would generate ${formatNumber(Number(size))} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
					}

					totalCount = Number(size);

					networkInfo = {
						type: 'cidr',
						network: ipv6ToString(network),
						totalHosts: totalCount
					};

					// Generate IPv6 addresses
					const displayLimit = Math.min($.get(maxDisplayLimit), ABSOLUTE_MAX_DISPLAY, totalCount);

					for (let i = 0n; i < BigInt(displayLimit); i++) {
						addresses.push(ipv6ToString(network + i));
					}
				} else {
					// IPv4 CIDR
					const { network, size, prefixLength } = parseCIDR(trimmed);

					if (size > ABSOLUTE_MAX_GENERATION) {
						throw new Error(`/${prefixLength} would generate ${formatNumber(size)} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
					}

					totalCount = size;

					const broadcast = network + size - 1;

					networkInfo = {
						type: 'cidr',
						network: ipToString(network),
						broadcast: ipToString(broadcast),
						firstUsable: size > 2 ? ipToString(network + 1) : ipToString(network),
						lastUsable: size > 2 ? ipToString(broadcast - 1) : ipToString(broadcast),
						totalHosts: Math.max(0, size - 2)
					};

					// Generate addresses based on inclusion options
					let startAddr = network;

					let endAddr = network + size;

					if (!$.get(includeNetwork) && size > 1) startAddr += 1;
					if (!$.get(includeBroadcast) && size > 1) endAddr -= 1;

					const displayLimit = Math.min($.get(maxDisplayLimit), ABSOLUTE_MAX_DISPLAY, endAddr - startAddr);

					for (let i = 0; i < displayLimit; i++) {
						addresses.push(ipToString(startAddr + i));
					}
				}
			} else if (trimmed.includes('-')) {
				// IP range
				const { start, end, count } = parseRange(trimmed);

				if (count > ABSOLUTE_MAX_GENERATION) {
					throw new Error(`Range would generate ${formatNumber(count)} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
				}

				totalCount = count;

				networkInfo = {
					type: 'range',
					firstUsable: ipToString(start),
					lastUsable: ipToString(end)
				};

				const displayLimit = Math.min($.get(maxDisplayLimit), ABSOLUTE_MAX_DISPLAY, count);

				for (let i = 0; i < displayLimit; i++) {
					addresses.push(ipToString(start + i));
				}
			} else {
				// Single IP
				addresses = [trimmed];

				totalCount = 1;
				networkInfo = { type: 'single' };
			}

			// Add small delay for UX (shows loading state)
			await new Promise((resolve) => setTimeout(resolve, 100));

			$.set(
				result,
				{
					success: true,
					addresses,
					totalCount,
					displayCount: addresses.length,
					truncated: addresses.length < totalCount,
					networkInfo
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					addresses: [],
					totalCount: 0,
					displayCount: 0,
					truncated: false,
					networkInfo: { type: 'single' }
				},
				true
			);
		} finally {
			$.set(isGenerating, false);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		enumerateIPs();
	}

	async function exportToCSV() {
		if (!$.get(result)?.addresses.length) return;

		// For large datasets, generate on-the-fly to avoid memory issues
		let csvContent = 'ip_address\n';

		if ($.get(result).totalCount <= 10000) {
			// Small dataset - include all addresses
			for (const ip of $.get(result).addresses) {
				csvContent += `${ip}\n`;
			}
		} else {
			// Large dataset - this would need chunked generation
			// For now, just export what's displayed
			csvContent += '# Note: Only displaying first ' + $.get(result).addresses.length + ' addresses\n';

			for (const ip of $.get(result).addresses) {
				csvContent += `${ip}\n`;
			}
		}

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `ip-enumerate-${Date.now()}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function exportToJSON() {
		if (!$.get(result)?.addresses.length) return;

		const jsonData = {
			input: $.get(input),
			timestamp: new Date().toISOString(),
			totalCount: $.get(result).totalCount,
			displayCount: $.get(result).displayCount,
			truncated: $.get(result).truncated,
			networkInfo: $.get(result).networkInfo,
			addresses: $.get(result).addresses
		};

		const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `ip-enumerate-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Generate on component load
	enumerateIPs();

	var div = root_9();
	var div_1 = $.child(div);
	var input_1 = $.sibling($.child(div_1), 2);

	$.remove_input_defaults(input_1);

	var div_2 = $.sibling(input_1, 2);
	var div_3 = $.child(div_2);
	var input_2 = $.sibling($.child(div_3), 2);

	$.remove_input_defaults(input_2);
	$.set_attribute(input_2, 'max', ABSOLUTE_MAX_DISPLAY);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var label = $.child(div_4);
	var input_3 = $.child(label);

	$.remove_input_defaults(input_3);
	$.next(3);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_4 = $.child(label_1);

	$.remove_input_defaults(input_4);
	$.next(3);
	$.reset(label_1);
	$.reset(div_4);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var details = $.child(div_5);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_6 = $.sibling(summary, 2);

	$.each(div_6, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root();
		var div_7 = $.child(button);
		var text = $.only_child(div_7, true);
		var code = $.sibling(div_7, 2);
		var text_1 = $.only_child(code, true);
		var div_8 = $.sibling(code, 2);
		var text_2 = $.only_child(div_8, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-item ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-rxppz9');
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, $.get(example).input);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_6);
	$.reset(details);
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var node_1 = $.child(div_9);

	Icon(node_1, { name: 'alert-triangle', size: 'sm' });

	var div_10 = $.sibling(node_1, 2);
	var text_3 = $.sibling($.child(div_10));

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_11 = root_1();
			var div_12 = $.child(div_11);
			var node_3 = $.child(div_12);

			Icon(node_3, { name: 'loader', size: 'lg' });
			$.next(2);
			$.reset(div_12);
			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isGenerating)) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_13 = root_8();
			var node_5 = $.child(div_13);

			{
				var consequent_4 = ($$anchor) => {
					var fragment = root_6();
					var div_14 = $.first_child(fragment);
					var div_15 = $.child(div_14);
					var h3 = $.child(div_15);
					var node_6 = $.child(h3);

					Icon(node_6, { name: 'list', size: 'sm' });
					$.next();
					$.reset(h3);
					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var button_1 = $.child(div_16);
					var node_7 = $.child(button_1);

					Icon(node_7, { name: 'json-file', size: 'sm' });
					$.next();
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_8 = $.child(button_2);

					Icon(node_8, { name: 'csv-file', size: 'sm' });
					$.next();
					$.reset(button_2);

					var button_3 = $.sibling(button_2, 2);
					var node_9 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('all-addresses') ? 'check' : 'copy');

						Icon(node_9, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button_3);
					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var div_18 = $.child(div_17);
					var span = $.child(div_18);
					var text_4 = $.only_child(span, true);

					$.next(2);
					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var span_1 = $.child(div_19);
					var text_5 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var span_2 = $.child(div_20);
					var text_6 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_20);
					$.reset(div_17);

					var node_10 = $.sibling(div_17, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_21 = root_3();
							var div_22 = $.child(div_21);
							var code_1 = $.sibling($.child(div_22), 2);
							var text_7 = $.only_child(code_1, true);

							$.reset(div_22);

							var node_11 = $.sibling(div_22, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_23 = root_2();
									var code_2 = $.sibling($.child(div_23), 2);
									var text_8 = $.only_child(code_2, true);

									$.reset(div_23);
									$.template_effect(() => $.set_text(text_8, $.get(result).networkInfo.broadcast));
									$.append($$anchor, div_23);
								};

								$.if(node_11, ($$render) => {
									if ($.get(result).networkInfo.broadcast) $$render(consequent_1);
								});
							}

							$.reset(div_21);
							$.template_effect(() => $.set_text(text_7, $.get(result).networkInfo.network));
							$.append($$anchor, div_21);
						};

						$.if(node_10, ($$render) => {
							if ($.get(result).networkInfo.network) $$render(consequent_2);
						});
					}

					$.reset(div_14);

					var div_24 = $.sibling(div_14, 2);
					var div_25 = $.child(div_24);
					var h3_1 = $.child(div_25);
					var node_12 = $.child(h3_1);

					Icon(node_12, { name: 'target', size: 'sm' });
					$.next();
					$.reset(h3_1);

					var node_13 = $.sibling(h3_1, 2);

					{
						var consequent_3 = ($$anchor) => {
							var span_3 = root_4();
							var text_9 = $.only_child(span_3);

							$.template_effect(($0, $1) => $.set_text(text_9, `Showing ${$0 ?? ''} of ${$1 ?? ''}`), [
								() => formatNumber($.get(result).displayCount),
								() => formatNumber($.get(result).totalCount)
							]);

							$.append($$anchor, span_3);
						};

						$.if(node_13, ($$render) => {
							if ($.get(result).truncated) $$render(consequent_3);
						});
					}

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);

					$.each(div_26, 21, () => $.get(result).addresses, $.index, ($$anchor, address, index) => {
						var div_27 = root_5();
						var span_4 = $.child(div_27);

						span_4.textContent = index + 1;

						var code_3 = $.sibling(span_4, 2);
						var text_10 = $.only_child(code_3, true);
						var button_4 = $.sibling(code_3, 2);
						var node_14 = $.child(button_4);

						{
							let $0 = $.derived(() => clipboard.isCopied($.get(address)) ? 'check' : 'copy');

							Icon(node_14, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.reset(button_4);
						$.reset(div_27);

						$.template_effect(
							($0) => {
								$.set_text(text_10, $.get(address));
								$.set_class(button_4, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-rxppz9');
							},
							[() => clipboard.isCopied($.get(address)) ? 'copied' : '']
						);

						$.delegated('click', button_4, () => clipboard.copy($.get(address), $.get(address)));
						$.append($$anchor, div_27);
					});

					$.reset(div_26);
					$.reset(div_24);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_class(button_3, 1, `copy-btn ${$0 ?? ''}`, 'svelte-rxppz9');
							$.set_text(text_4, $1);
							$.set_text(text_5, $2);
							$.set_text(text_6, $3);
						},
						[
							() => clipboard.isCopied('all-addresses') ? 'copied' : '',
							() => formatNumber($.get(result).totalCount),
							() => formatNumber($.get(result).displayCount),
							() => estimateMemoryUsage($.get(result).displayCount)
						]
					);

					$.delegated('click', button_1, exportToJSON);
					$.delegated('click', button_2, exportToCSV);
					$.delegated('click', button_3, () => clipboard.copy(($.get(result)?.addresses || []).join('\n'), 'all-addresses'));
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_28 = root_7();
					var div_29 = $.child(div_28);
					var node_15 = $.child(div_29);

					Icon(node_15, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_15, 4);
					var text_11 = $.only_child(p, true);

					$.reset(div_29);
					$.reset(div_28);
					$.template_effect(() => $.set_text(text_11, $.get(result).error));
					$.append($$anchor, div_28);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).success) $$render(consequent_4); else $$render(alternate, -1);
				});
			}

			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		$.if(node_4, ($$render) => {
			if ($.get(result) && !$.get(isGenerating)) $$render(consequent_5);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => $.set_text(text_3, ` Max ${$0 ?? ''} displayed, ${$1 ?? ''}
        generated`),
		[
			() => formatNumber(ABSOLUTE_MAX_DISPLAY),
			() => formatNumber(ABSOLUTE_MAX_GENERATION)
		]
	);

	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(input), ($$value) => $.set(input, $$value));
	$.delegated('input', input_2, handleInputChange);
	$.bind_value(input_2, () => $.get(maxDisplayLimit), ($$value) => $.set(maxDisplayLimit, $$value));
	$.delegated('change', input_3, handleInputChange);
	$.bind_checked(input_3, () => $.get(includeNetwork), ($$value) => $.set(includeNetwork, $$value));
	$.delegated('change', input_4, handleInputChange);
	$.bind_checked(input_4, () => $.get(includeBroadcast), ($$value) => $.set(includeBroadcast, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'change', 'click']);