import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import { calculateIPDistances } from '$lib/utils/ip-distance.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

export default function IPDistance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '192.168.1.1 -> 192.168.1.100\n10.0.0.1 -> 10.0.0.255\n2001:db8::1 -> 2001:db8::ffff';
		let inclusive = true;
		let showIntermediates = false;
		let result = null;
		let isLoading = false;
		let selectedExampleIndex = null;
		let userModified = false;
		const clipboard = useClipboard();

		const examples = [
			{
				input: '192.168.1.1 -> 192.168.1.10',
				description: 'Basic IPv4 range counting'
			},

			{
				input: '2001:db8::1 -> 2001:db8::100\nfe80::1 -> fe80::ffff',
				description: 'IPv6 address distances'
			},

			{
				input: '10.0.0.1 -> 10.255.255.254\n172.16.0.1 -> 172.31.255.254',
				description: 'Large private network ranges'
			},

			{
				input: '192.168.1.1 -> 192.168.1.2\n192.168.1.2 -> 192.168.1.1',
				description: 'Adjacent IPs and reverse counting'
			}
		];

		function calculateDistances() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				if (inputs.length === 0) {
					result = {
						calculations: [],
						summary: {
							totalCalculations: 0,
							validCalculations: 0,
							invalidCalculations: 0,
							totalDistance: '0',
							averageDistance: '0'
						},
						errors: ['No valid input lines found']
					};

					return;
				}

				result = calculateIPDistances(inputs, inclusive, showIntermediates);
			} catch(error) {
				result = {
					calculations: [],
					summary: {
						totalCalculations: 0,
						validCalculations: 0,
						invalidCalculations: 0,
						totalDistance: '0',
						averageDistance: '0'
					},
					errors: [
						error instanceof Error
							? error.message
							: 'Unknown error occurred while calculating distances'
					]
				};
			} finally {
				isLoading = false;
			}
		}

		function exportResults(format) {
			if (!result) return;

			const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
			let content = '';
			let filename = '';

			if (format === 'csv') {
				const headers = 'Start IP,End IP,Distance,Version,Inclusive,Direction,Valid,Error';
				const rows = result.calculations.map((calc) => `"${calc.startIP}","${calc.endIP}","${calc.distance}","IPv${calc.version}","${calc.inclusive}","${calc.direction}","${calc.isValid}","${calc.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `ip-distances-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
				filename = `ip-distances-${timestamp}.json`;
			}

			const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		function loadExample(example, index) {
			inputText = example.input;
			selectedExampleIndex = index;
			userModified = false;
			calculateDistances();
		}

		function handleInputChange() {
			userModified = true;
			selectedExampleIndex = null;
		}

		function formatDirection(direction) {
			return direction === 'forward' ? '→' : '←';
		}

		function getDirectionColor(direction) {
			return direction === 'forward' ? '#059669' : '#d97706';
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>IP Distance Calculator</h1> <p>Calculate the number of addresses between two IP addresses with inclusive/exclusive counting and detailed
      analysis.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Auto-calculate when inputs change
			examples
		);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i && !userModified })}><h5>${$.escape(example.input.split('\n')[0])}</h5> <p>${$.escape(example.description)}</p></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card"><div class="card-header"><h3>Distance Configuration</h3></div> <div class="card-content"><div class="form-row svelte-esn2mq"><div class="form-group textarea-group svelte-esn2mq"><label for="inputs" class="svelte-esn2mq">IP Address Pairs</label> <textarea id="inputs" placeholder="192.168.1.1 -> 192.168.1.100
10.0.0.1 -> 10.0.0.255
2001:db8::1 -> 2001:db8::ffff" rows="6" class="svelte-esn2mq">`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-esn2mq">Enter one pair per line. Formats: start → end, start -> end, start end, start - end</div></div> <div class="checkbox-section svelte-esn2mq"><div class="checkbox-group svelte-esn2mq"><label class="checkbox-label svelte-esn2mq"><input type="checkbox"${$.attr('checked', inclusive, true)}/> <div class="checkbox-text svelte-esn2mq"><span>Inclusive Counting</span> <span>`);
		Icon($$renderer, { name: 'help-circle', size: 'xs' });
		$$renderer.push(`<!----></span></div></label></div> <div class="checkbox-group svelte-esn2mq"><label class="checkbox-label svelte-esn2mq"><input type="checkbox"${$.attr('checked', showIntermediates, true)}/> <div class="checkbox-text svelte-esn2mq"><span>Show Intermediate IPs</span> <span>`);
		Icon($$renderer, { name: 'help-circle', size: 'xs' });
		$$renderer.push(`<!----></span></div></label></div></div></div></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="card loading-card"><div class="card-content"><div class="loading svelte-esn2mq">`);
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Calculating distances...</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-esn2mq">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="card error-card svelte-esn2mq"><div class="card-content"><div class="error-content svelte-esn2mq">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'md' });
				$$renderer.push(`<!----> <div><strong class="svelte-esn2mq">Calculation Errors</strong> <!--[-->`);

				const each_array_1 = $.ensure_array_like(result.errors);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let error = each_array_1[$$index_1];

					$$renderer.push(`<p class="svelte-esn2mq">${$.escape(error)}</p>`);
				}

				$$renderer.push(`<!--]--></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.calculations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card summary-card svelte-esn2mq"><div class="card-header svelte-esn2mq"><h3>Distance Summary</h3> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied('summary') })}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('summary') ? 'check' : 'copy',
					size: 'xs'
				});

				$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('summary') ? 'Copied!' : 'Copy')}</button></div> <div class="card-content"><div class="summary-stats svelte-esn2mq"><div class="info-card svelte-esn2mq"><div class="info-label">Total Pairs</div> <div class="metric-value">${$.escape(result.summary.totalCalculations)}</div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Valid</div> <div class="metric-value success">${$.escape(result.summary.validCalculations)}</div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Invalid</div> <div${$.attr_class('metric-value', void 0, { 'error': result.summary.invalidCalculations > 0 })}>${$.escape(result.summary.invalidCalculations)}</div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Total Distance</div> <div class="metric-value info">${$.escape(result.summary.totalDistance)}</div></div> <div class="info-card svelte-esn2mq"><div class="info-label">Average Distance</div> <div class="metric-value">${$.escape(result.summary.averageDistance)}</div></div></div></div></div> <div class="card calculations-card svelte-esn2mq"><div class="card-header svelte-esn2mq"><h3>Distance Calculations</h3> <div class="export-buttons svelte-esn2mq"><button class="svelte-esn2mq">`);
				Icon($$renderer, { name: 'csv-file', size: 'xs' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-esn2mq">`);
				Icon($$renderer, { name: 'json-file', size: 'xs' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="card-content"><div class="calculations-list svelte-esn2mq"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.calculations);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let calculation = each_array_2[index];

					$$renderer.push(`<div${$.attr_class('calculation-card svelte-esn2mq', void 0, {
						'valid': calculation.isValid,
						'invalid': !calculation.isValid
					})}><div class="calc-header svelte-esn2mq"><div class="ip-pair svelte-esn2mq"><div class="ip-address svelte-esn2mq"><span class="ip-label svelte-esn2mq">Start</span> <div class="value-copy"><span class="ip-value">${$.escape(calculation.startIP)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`start-${index}`) })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`start-${index}`) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div></div> <div class="direction-arrow svelte-esn2mq"${$.attr_style(`color: ${$.stringify(getDirectionColor(calculation.direction))}`)}>${$.escape(formatDirection(calculation.direction))}</div> <div class="ip-address svelte-esn2mq"><span class="ip-label svelte-esn2mq">End</span> <div class="value-copy"><span class="ip-value">${$.escape(calculation.endIP)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`end-${index}`) })}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(`end-${index}`) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div></div></div> <div class="status svelte-esn2mq">`);

					if (calculation.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle', size: 'sm' });
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle', size: 'sm' });
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (calculation.isValid) {
						$$renderer.push(`<!--[0--><div class="calculation-details svelte-esn2mq"><div class="distance-info svelte-esn2mq"><div class="distance-value svelte-esn2mq"><div class="value-copy"><span class="distance-number svelte-esn2mq">${$.escape(calculation.distance)}</span> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`distance-${index}`) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`distance-${index}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div> <span class="distance-label svelte-esn2mq">address${$.escape(calculation.distanceNumber === 1n ? '' : 'es')}
                            (${$.escape(calculation.inclusive ? 'inclusive' : 'exclusive')})</span></div> <div class="calculation-meta svelte-esn2mq"><span class="meta-item svelte-esn2mq">`);

						Icon($$renderer, { name: 'globe', size: 'xs' });
						$$renderer.push(`<!----> IPv${$.escape(calculation.version)}</span> <span class="meta-item svelte-esn2mq"${$.attr_style(`color: ${$.stringify(getDirectionColor(calculation.direction))}`)}>`);
						Icon($$renderer, { name: 'arrow-right', size: 'xs' });
						$$renderer.push(`<!----> ${$.escape(calculation.direction)}</span></div></div> `);

						if (calculation.intermediateAddresses.length > 0) {
							$$renderer.push(`<!--[0--><div class="intermediates svelte-esn2mq"><div class="intermediates-header svelte-esn2mq"><h4 class="svelte-esn2mq">Intermediate Addresses</h4> <button${$.attr_class('copy-btn', void 0, { 'copied': clipboard.isCopied(`intermediates-${index}`) })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied(`intermediates-${index}`) ? 'check' : 'copy',
								size: 'xs'
							});

							$$renderer.push(`<!----> Copy All</button></div> <div class="intermediate-list svelte-esn2mq"><!--[-->`);

							const each_array_3 = $.ensure_array_like(calculation.intermediateAddresses);

							for (let ipIndex = 0, $$length = each_array_3.length; ipIndex < $$length; ipIndex++) {
								let ip = each_array_3[ipIndex];

								$$renderer.push(`<div class="value-copy"><span class="ip-value">${$.escape(ip)}</span> <button${$.attr_class('copy-btn', void 0, {
									'copied': clipboard.isCopied(`intermediate-${index}-${ipIndex}`)
								})}>`);

								Icon($$renderer, {
									name: clipboard.isCopied(`intermediate-${index}-${ipIndex}`) ? 'check' : 'copy',
									size: 'xs'
								});

								$$renderer.push(`<!----></button></div>`);
							}

							$$renderer.push(`<!--]--> `);

							if (calculation.distanceNumber > BigInt(calculation.intermediateAddresses.length + 2)) {
								$$renderer.push(`<!--[0--><span class="more-indicator svelte-esn2mq">... and ${$.escape(formatNumber(Number(calculation.distanceNumber - BigInt(calculation.intermediateAddresses.length + 2))))} more</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-esn2mq">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <span class="svelte-esn2mq">${$.escape(calculation.error)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}