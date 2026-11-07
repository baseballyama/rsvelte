import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import { SvelteSet } from 'svelte/reactivity';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<button><!></button>`);
var root_2 = $.from_html(`<div class="network-item added svelte-mi177p"><code class="network-cidr svelte-mi177p"> </code> <button><!></button></div>`);
var root_3 = $.from_html(`<div class="networks-list svelte-mi177p"></div>`);
var root_4 = $.from_html(`<div class="empty-category svelte-mi177p"><!> <span>No networks added</span></div>`);
var root_5 = $.from_html(`<div class="network-item removed svelte-mi177p"><code class="network-cidr svelte-mi177p"> </code> <button><!></button></div>`);
var root_6 = $.from_html(`<div class="empty-category svelte-mi177p"><!> <span>No networks removed</span></div>`);
var root_7 = $.from_html(`<div class="network-item unchanged svelte-mi177p"><code class="network-cidr svelte-mi177p"> </code> <button><!></button></div>`);
var root_8 = $.from_html(`<div class="empty-category svelte-mi177p"><!> <span>No networks remained unchanged</span></div>`);
var root_9 = $.from_html(`<div class="comparison-summary svelte-mi177p"><h3 class="svelte-mi177p">Comparison Summary</h3> <div class="summary-grid svelte-mi177p"><div class="summary-card svelte-mi177p"><div class="summary-icon added svelte-mi177p"><!></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p"> </div> <div class="summary-label svelte-mi177p">Added</div></div></div> <div class="summary-card svelte-mi177p"><div class="summary-icon removed svelte-mi177p"><!></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p"> </div> <div class="summary-label svelte-mi177p">Removed</div></div></div> <div class="summary-card svelte-mi177p"><div class="summary-icon unchanged svelte-mi177p"><!></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p"> </div> <div class="summary-label svelte-mi177p">Unchanged</div></div></div></div> <div class="list-totals svelte-mi177p"><span class="total-item"> </span> <span class="total-item"> </span></div></div> <div class="changes-grid svelte-mi177p"><div class="change-category added svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p"><!> </h4> <!></div> <!></div> <div class="change-category removed svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p"><!> </h4> <!></div> <!></div> <div class="change-category unchanged svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p"><!> </h4> <!></div> <!></div></div>`, 1);
var root_10 = $.from_html(`<div class="error-message svelte-mi177p"><!> <h4 class="svelte-mi177p">Comparison Error</h4> <p> </p></div>`);
var root_11 = $.from_html(`<section class="results-section svelte-mi177p"><!></section>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h2>CIDR Compare</h2> <p>Compare two lists of networks to identify changes for auditing</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <section class="input-section svelte-mi177p"><div class="input-header svelte-mi177p"><h3 class="svelte-mi177p">Network Lists</h3> <button class="swap-button svelte-mi177p"><!> Swap</button></div> <div class="input-grid svelte-mi177p"><div class="input-group svelte-mi177p"><label for="list-a" class="svelte-mi177p"><!> List A (Before)</label> <textarea id="list-a" placeholder="192.168.0.0/16
10.0.0.0/8
172.16.1.0-172.16.1.255" rows="8" class="svelte-mi177p"></textarea></div> <div class="input-group svelte-mi177p"><label for="list-b" class="svelte-mi177p"><!> List B (After)</label> <textarea id="list-b" placeholder="192.168.0.0/16
10.0.0.0/8
192.168.100.0/24" rows="8" class="svelte-mi177p"></textarea></div></div></section> <!></div>`);

export default function CIDRCompare($$anchor, $$props) {
	$.push($$props, true);

	let listA = $.state(`192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`);

	let listB = $.state(`192.168.0.0/16
10.0.0.0/8
192.168.100.0/24
172.16.5.0/24`);

	let result = $.state(null);
	const clipboard = useClipboard();
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Network Addition',
			listA: `192.168.1.0/24
10.0.0.0/16`,

			listB: `192.168.1.0/24
10.0.0.0/16
172.16.0.0/24`,
			description: 'Added 172.16.0.0/24'
		},

		{
			label: 'Network Removal',
			listA: `192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`,

			listB: `192.168.0.0/16
10.0.0.0/8`,
			description: 'Removed 172.16.0.0/12'
		},

		{
			label: 'Mixed Changes',
			listA: `192.168.1.0/24
10.0.0.0/16
172.16.1.0/24`,

			listB: `192.168.1.0/24
10.0.1.0/24
172.16.2.0/24`,
			description: 'Swapped subnets'
		},

		{
			label: 'VLAN Reconfiguration',
			listA: `192.168.10.0/24
192.168.20.0/24
192.168.30.0/24`,

			listB: `192.168.10.0/24
192.168.25.0/24
192.168.35.0/24`,
			description: 'Replaced VLANs 20,30 with 25,35'
		},

		{
			label: 'Network Consolidation',
			listA: `10.1.0.0/24
10.1.1.0/24
10.1.2.0/24
10.1.3.0/24`,
			listB: `10.1.0.0/22`,
			description: 'Merged 4 /24s into 1 /22'
		},

		{
			label: 'Branch Office Migration',
			listA: `172.16.1.0/24
172.16.2.0/24
192.168.100.0/24`,

			listB: `10.10.1.0/24
10.10.2.0/24
192.168.100.0/24`,
			description: 'Migrated 172.16.x.x to 10.10.x.x'
		}
	];

	function loadExample(example, index) {
		$.set(listA, example.listA, true);
		$.set(listB, example.listB, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
		performComparison();
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

	function normalizeCIDR(cidr) {
		if (!cidr.includes('/')) {
			// Single IP, convert to /32
			return `${cidr}/32`;
		}

		const [ipStr, prefixStr] = cidr.split('/');
		const prefixLength = parseInt(prefixStr);

		if (prefixLength < 0 || prefixLength > 32) {
			throw new Error(`Invalid prefix length: /${prefixLength}`);
		}

		// Calculate network address
		const ip = parseIP(ipStr);

		const mask = 0xffffffff << 32 - prefixLength;
		const networkAddress = ip & mask;

		return `${ipToString(networkAddress)}/${prefixLength}`;
	}

	function parseAndNormalizeList(input) {
		if (!input.trim()) return [];

		const lines = input.trim().split('\n').filter((line) => line.trim());
		const normalized = new SvelteSet();

		for (const line of lines) {
			const trimmed = line.trim();

			if (!trimmed) continue;

			try {
				if (trimmed.includes('-')) {
					// IP range - convert to CIDR blocks
					const [startStr, endStr] = trimmed.split('-').map((s) => s.trim());

					const startIP = parseIP(startStr);
					const endIP = parseIP(endStr);

					if (startIP > endIP) {
						throw new Error(`Invalid range: start IP is greater than end IP in ${trimmed}`);
					}

					// Convert range to CIDR blocks (simplified - assumes aligned blocks)
					let current = startIP;

					while (current <= endIP) {
						// Find the largest CIDR block that fits
						let prefixLength = 32;

						let blockSize = 1;

						// Find largest power of 2 that fits
						for (let p = 0; p <= 32; p++) {
							const size = Math.pow(2, 32 - p);

							if (current % size === 0 && current + size - 1 <= endIP) {
								prefixLength = p;
								blockSize = size;
							} else {
								break;
							}
						}

						normalized.add(`${ipToString(current)}/${prefixLength}`);
						current += blockSize;
					}
				} else if (trimmed.match(/^\d+\.\d+\.\d+\.\d+(\/\d+)?$/)) {
					// CIDR or single IP
					normalized.add(normalizeCIDR(trimmed));
				} else {
					throw new Error(`Invalid format: ${trimmed}`);
				}
			} catch(error) {
				throw new Error(`Error processing "${trimmed}": ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}

		// Sort by network address
		return Array.from(normalized).sort((a, b) => {
			const aNetwork = parseIP(a.split('/')[0]);
			const bNetwork = parseIP(b.split('/')[0]);

			if (aNetwork !== bNetwork) {
				return aNetwork - bNetwork;
			}

			// If same network, sort by prefix length (more specific first)
			const aPrefix = parseInt(a.split('/')[1]);

			const bPrefix = parseInt(b.split('/')[1]);

			return bPrefix - aPrefix;
		});
	}

	function performComparison() {
		try {
			const normalizedA = parseAndNormalizeList($.get(listA));
			const normalizedB = parseAndNormalizeList($.get(listB));
			const setA = new Set(normalizedA);
			const setB = new Set(normalizedB);
			const added = normalizedB.filter((item) => !setA.has(item));
			const removed = normalizedA.filter((item) => !setB.has(item));
			const unchanged = normalizedA.filter((item) => setB.has(item));

			$.set(
				result,
				{
					success: true,
					added,
					removed,
					unchanged,
					normalizedA,
					normalizedB,
					summary: {
						totalA: normalizedA.length,
						totalB: normalizedB.length,
						addedCount: added.length,
						removedCount: removed.length,
						unchangedCount: unchanged.length
					}
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					added: [],
					removed: [],
					unchanged: [],
					normalizedA: [],
					normalizedB: [],
					summary: {
						totalA: 0,
						totalB: 0,
						addedCount: 0,
						removedCount: 0,
						unchangedCount: 0
					}
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
		performComparison();
	}

	async function copyCategory(items, category) {
		if (!items.length) return;

		const text = items.join('\n');

		await clipboard.copy(text, `category-${category}`);
	}

	function swapLists() {
		const temp = $.get(listA);

		$.set(listA, $.get(listB), true);
		$.set(listB, temp, true);
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
		performComparison();
	}

	// Calculate on component load
	performComparison();

	var div = root_12();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example) => example.label, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var div_3 = $.child(button);
		var text_1 = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_2 = $.only_child(div_4, true);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text_1, $.get(example).label);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var div_5 = $.child(section);
	var h3 = $.child(div_5);

	$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Compare two network lists to identify additions, removals, and unchanged items');

	var button_1 = $.sibling(h3, 2);
	var node_1 = $.child(button_1);

	Icon(node_1, { name: 'swap', size: 'sm' });
	$.next();
	$.reset(button_1);
	$.action(button_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Swap List A and List B');
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var label = $.child(div_7);
	var node_2 = $.child(label);

	Icon(node_2, { name: 'list', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Original or 'before' state - CIDR blocks, IP ranges, or individual IPs");

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_1 = $.child(div_8);
	var node_3 = $.child(label_1);

	Icon(node_3, { name: 'list-check', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Updated or 'after' state - CIDR blocks, IP ranges, or individual IPs");

	var textarea_1 = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea_1);
	$.reset(div_8);
	$.reset(div_6);
	$.reset(section);

	var node_4 = $.sibling(section, 2);

	{
		var consequent_7 = ($$anchor) => {
			var section_1 = root_11();
			var node_5 = $.child(section_1);

			{
				var consequent_6 = ($$anchor) => {
					var fragment = root_9();
					var div_9 = $.first_child(fragment);
					var h3_1 = $.child(div_9);

					$.action(h3_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Overview of changes between the two network lists');

					var div_10 = $.sibling(h3_1, 2);
					var div_11 = $.child(div_10);
					var div_12 = $.child(div_11);
					var node_6 = $.child(div_12);

					Icon(node_6, { name: 'plus-circle' });
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var div_14 = $.child(div_13);
					var text_3 = $.only_child(div_14, true);

					$.next(2);
					$.reset(div_13);
					$.reset(div_11);

					var div_15 = $.sibling(div_11, 2);
					var div_16 = $.child(div_15);
					var node_7 = $.child(div_16);

					Icon(node_7, { name: 'minus-circle' });
					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var div_18 = $.child(div_17);
					var text_4 = $.only_child(div_18, true);

					$.next(2);
					$.reset(div_17);
					$.reset(div_15);

					var div_19 = $.sibling(div_15, 2);
					var div_20 = $.child(div_19);
					var node_8 = $.child(div_20);

					Icon(node_8, { name: 'check-circle' });
					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var div_22 = $.child(div_21);
					var text_5 = $.only_child(div_22, true);

					$.next(2);
					$.reset(div_21);
					$.reset(div_19);
					$.reset(div_10);

					var div_23 = $.sibling(div_10, 2);
					var span = $.child(div_23);
					var text_6 = $.only_child(span);
					var span_1 = $.sibling(span, 2);
					var text_7 = $.only_child(span_1);

					$.reset(div_23);
					$.reset(div_9);

					var div_24 = $.sibling(div_9, 2);
					var div_25 = $.child(div_24);
					var div_26 = $.child(div_25);
					var h4 = $.child(div_26);
					var node_9 = $.child(h4);

					Icon(node_9, { name: 'plus-circle', size: 'sm' });

					var text_8 = $.sibling(node_9);

					$.reset(h4);
					$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks present in List B but not in List A');

					var node_10 = $.sibling(h4, 2);

					{
						var consequent = ($$anchor) => {
							var button_2 = root_1();
							var node_11 = $.child(button_2);

							{
								let $0 = $.derived(() => clipboard.isCopied('category-added') ? 'check-circle' : 'copy');

								Icon(node_11, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							$.reset(button_2);
							$.template_effect(($0) => $.set_class(button_2, 1, `copy-category ${$0 ?? ''}`, 'svelte-mi177p'), [() => clipboard.isCopied('category-added') ? 'copied' : '']);
							$.delegated('click', button_2, () => $.get(result) && copyCategory($.get(result).added, 'added'));
							$.append($$anchor, button_2);
						};

						$.if(node_10, ($$render) => {
							if ($.get(result).added.length > 0) $$render(consequent);
						});
					}

					$.reset(div_26);

					var node_12 = $.sibling(div_26, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_27 = root_3();

							$.each(div_27, 20, () => $.get(result).added, (network) => network, ($$anchor, network) => {
								var div_28 = root_2();
								var code = $.child(div_28);
								var text_9 = $.only_child(code, true);
								var button_3 = $.sibling(code, 2);
								var node_13 = $.child(button_3);

								{
									let $0 = $.derived(() => clipboard.isCopied(`added-${network}`) ? 'check-circle' : 'copy');

									Icon(node_13, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_3);
								$.reset(div_28);

								$.template_effect(
									($0) => {
										$.set_text(text_9, network);
										$.set_class(button_3, 1, `copy-button ${$0 ?? ''}`, 'svelte-mi177p');
									},
									[() => clipboard.isCopied(`added-${network}`) ? 'copied' : '']
								);

								$.delegated('click', button_3, () => clipboard.copy(network, `added-${network}`));
								$.append($$anchor, div_28);
							});

							$.reset(div_27);
							$.append($$anchor, div_27);
						};

						var alternate = ($$anchor) => {
							var div_29 = root_4();
							var node_14 = $.child(div_29);

							Icon(node_14, { name: 'check' });
							$.next(2);
							$.reset(div_29);
							$.append($$anchor, div_29);
						};

						$.if(node_12, ($$render) => {
							if ($.get(result).added.length > 0) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(div_25);

					var div_30 = $.sibling(div_25, 2);
					var div_31 = $.child(div_30);
					var h4_1 = $.child(div_31);
					var node_15 = $.child(h4_1);

					Icon(node_15, { name: 'minus-circle', size: 'sm' });

					var text_10 = $.sibling(node_15);

					$.reset(h4_1);
					$.action(h4_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks present in List A but not in List B');

					var node_16 = $.sibling(h4_1, 2);

					{
						var consequent_2 = ($$anchor) => {
							var button_4 = root_1();
							var node_17 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('category-removed') ? 'check-circle' : 'copy');

								Icon(node_17, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							$.reset(button_4);
							$.template_effect(($0) => $.set_class(button_4, 1, `copy-category ${$0 ?? ''}`, 'svelte-mi177p'), [() => clipboard.isCopied('category-removed') ? 'copied' : '']);
							$.delegated('click', button_4, () => $.get(result) && copyCategory($.get(result).removed, 'removed'));
							$.append($$anchor, button_4);
						};

						$.if(node_16, ($$render) => {
							if ($.get(result).removed.length > 0) $$render(consequent_2);
						});
					}

					$.reset(div_31);

					var node_18 = $.sibling(div_31, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_32 = root_3();

							$.each(div_32, 20, () => $.get(result).removed, (network) => network, ($$anchor, network) => {
								var div_33 = root_5();
								var code_1 = $.child(div_33);
								var text_11 = $.only_child(code_1, true);
								var button_5 = $.sibling(code_1, 2);
								var node_19 = $.child(button_5);

								{
									let $0 = $.derived(() => clipboard.isCopied(`removed-${network}`) ? 'check-circle' : 'copy');

									Icon(node_19, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_5);
								$.reset(div_33);

								$.template_effect(
									($0) => {
										$.set_text(text_11, network);
										$.set_class(button_5, 1, `copy-button ${$0 ?? ''}`, 'svelte-mi177p');
									},
									[
										() => clipboard.isCopied(`removed-${network}`) ? 'copied' : ''
									]
								);

								$.delegated('click', button_5, () => clipboard.copy(network, `removed-${network}`));
								$.append($$anchor, div_33);
							});

							$.reset(div_32);
							$.append($$anchor, div_32);
						};

						var alternate_1 = ($$anchor) => {
							var div_34 = root_6();
							var node_20 = $.child(div_34);

							Icon(node_20, { name: 'check' });
							$.next(2);
							$.reset(div_34);
							$.append($$anchor, div_34);
						};

						$.if(node_18, ($$render) => {
							if ($.get(result).removed.length > 0) $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_30);

					var div_35 = $.sibling(div_30, 2);
					var div_36 = $.child(div_35);
					var h4_2 = $.child(div_36);
					var node_21 = $.child(h4_2);

					Icon(node_21, { name: 'check-circle', size: 'sm' });

					var text_12 = $.sibling(node_21);

					$.reset(h4_2);
					$.action(h4_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Networks present in both List A and List B');

					var node_22 = $.sibling(h4_2, 2);

					{
						var consequent_4 = ($$anchor) => {
							var button_6 = root_1();
							var node_23 = $.child(button_6);

							{
								let $0 = $.derived(() => clipboard.isCopied('category-unchanged') ? 'check-circle' : 'copy');

								Icon(node_23, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							$.reset(button_6);

							$.template_effect(($0) => $.set_class(button_6, 1, `copy-category ${$0 ?? ''}`, 'svelte-mi177p'), [
								() => clipboard.isCopied('category-unchanged') ? 'copied' : ''
							]);

							$.delegated('click', button_6, () => copyCategory($.get(result)?.unchanged || [], 'unchanged'));
							$.append($$anchor, button_6);
						};

						$.if(node_22, ($$render) => {
							if ($.get(result).unchanged.length > 0) $$render(consequent_4);
						});
					}

					$.reset(div_36);

					var node_24 = $.sibling(div_36, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_37 = root_3();

							$.each(div_37, 20, () => $.get(result).unchanged, (network) => network, ($$anchor, network) => {
								var div_38 = root_7();
								var code_2 = $.child(div_38);
								var text_13 = $.only_child(code_2, true);
								var button_7 = $.sibling(code_2, 2);
								var node_25 = $.child(button_7);

								{
									let $0 = $.derived(() => clipboard.isCopied(`unchanged-${network}`) ? 'check-circle' : 'copy');

									Icon(node_25, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_7);
								$.reset(div_38);

								$.template_effect(
									($0) => {
										$.set_text(text_13, network);
										$.set_class(button_7, 1, `copy-button ${$0 ?? ''}`, 'svelte-mi177p');
									},
									[
										() => clipboard.isCopied(`unchanged-${network}`) ? 'copied' : ''
									]
								);

								$.delegated('click', button_7, () => clipboard.copy(network, `unchanged-${network}`));
								$.append($$anchor, div_38);
							});

							$.reset(div_37);
							$.append($$anchor, div_37);
						};

						var alternate_2 = ($$anchor) => {
							var div_39 = root_8();
							var node_26 = $.child(div_39);

							Icon(node_26, { name: 'alert-circle' });
							$.next(2);
							$.reset(div_39);
							$.append($$anchor, div_39);
						};

						$.if(node_24, ($$render) => {
							if ($.get(result).unchanged.length > 0) $$render(consequent_5); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_35);
					$.reset(div_24);

					$.template_effect(() => {
						$.set_text(text_3, $.get(result).summary.addedCount);
						$.set_text(text_4, $.get(result).summary.removedCount);
						$.set_text(text_5, $.get(result).summary.unchangedCount);
						$.set_text(text_6, `List A: ${$.get(result).summary.totalA ?? ''} items`);
						$.set_text(text_7, `List B: ${$.get(result).summary.totalB ?? ''} items`);
						$.set_text(text_8, ` Added Networks (${$.get(result).added.length ?? ''})`);
						$.set_text(text_10, ` Removed Networks (${$.get(result).removed.length ?? ''})`);
						$.set_text(text_12, ` Unchanged Networks (${$.get(result).unchanged.length ?? ''})`);
					});

					$.append($$anchor, fragment);
				};

				var alternate_3 = ($$anchor) => {
					var div_40 = root_10();
					var node_27 = $.child(div_40);

					Icon(node_27, { name: 'alert-triangle' });

					var p_1 = $.sibling(node_27, 4);
					var text_14 = $.only_child(p_1, true);

					$.reset(div_40);
					$.template_effect(() => $.set_text(text_14, $.get(result).error || 'Unknown error occurred'));
					$.append($$anchor, div_40);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).success) $$render(consequent_6); else $$render(alternate_3, -1);
				});
			}

			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		$.if(node_4, ($$render) => {
			if ($.get(result)) $$render(consequent_7);
		});
	}

	$.reset(div);
	$.delegated('click', button_1, swapLists);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(listA), ($$value) => $.set(listA, $$value));
	$.delegated('input', textarea_1, handleInputChange);
	$.bind_value(textarea_1, () => $.get(listB), ($$value) => $.set(listB, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);