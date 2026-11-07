import * as $ from 'svelte/internal/server';

import {
	ipv4ToIPv6,
	ipv6ToIPv4,
	validateIPv4,
	validateIPv6,
	getIPv6Info,
	expandIPv6,
	compressIPv6
} from '$lib/utils/ip-family-conversions.js';

import IPInput from './IPInput.svelte';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPFamilyConverter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { direction, title, description } = $$props;
		let inputValue = '';
		let conversionResult = null;
		const clipboard = useClipboard();
		let ipv6Info = null;

		/**
		 * Perform the conversion based on direction
		 */
		function performConversion() {
			if (!inputValue.trim()) {
				conversionResult = null;
				ipv6Info = null;

				return;
			}

			if (direction === 'ipv4-to-ipv6') {
				conversionResult = ipv4ToIPv6(inputValue.trim());
			} else {
				conversionResult = ipv6ToIPv4(inputValue.trim());

				// Also get IPv6 info for analysis
				if (validateIPv6(inputValue.trim()).valid) {
					ipv6Info = getIPv6Info(inputValue.trim());
				}
			}
		}

		/**
		 * Validate input based on direction
		 */
		function getInputValidation() {
			if (!inputValue.trim()) {
				return { valid: true };
			}

			if (direction === 'ipv4-to-ipv6') {
				return validateIPv4(inputValue.trim());
			} else {
				return validateIPv6(inputValue.trim());
			}
		}

		/**
		 * Copy text to clipboard with visual feedback
		 */
		// React to input changes
		const validation = $.derived(getInputValidation);

		const isIPv4ToIPv6 = $.derived(() => direction === 'ipv4-to-ipv6');
		const placeholder = $.derived(() => isIPv4ToIPv6() ? '192.168.1.1' : '::ffff:192.168.1.1');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="card"><header class="card-header"><h2>${$.escape(title)}</h2> <p>${$.escape(description)}</p></header> <div class="form-group">`);

			IPInput($$renderer, {
				label: isIPv4ToIPv6() ? 'IPv4 Address' : 'IPv6 Address',
				placeholder: placeholder(),
				get value() {
					return inputValue;
				},

				set value($$value) {
					inputValue = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			if (validation().valid && conversionResult) {
				$$renderer.push(`<!--[0--><div class="results-section fade-in svelte-1vx97tj">`);

				if (conversionResult.success) {
					$$renderer.push(`<!--[0--><section class="info-panel success"><h3>Conversion Result</h3> <div class="result-display svelte-1vx97tj"><div class="result-item svelte-1vx97tj"><span class="result-label svelte-1vx97tj">${$.escape(isIPv4ToIPv6() ? 'IPv6 Address' : 'IPv4 Address')}</span> <div class="result-value-container svelte-1vx97tj"><code class="result-value svelte-1vx97tj">${$.escape(conversionResult.result)}</code> `);

					Tooltip($$renderer, {
						text: clipboard.isCopied('result')
							? 'Copied!'
							: `Copy ${isIPv4ToIPv6() ? 'IPv6' : 'IPv4'} address`,
						position: 'left',
						children: ($$renderer) => {
							$$renderer.push(`<button type="button"${$.attr_class(`copy-btn ${clipboard.isCopied('result') ? 'copied' : ''}`, 'svelte-1vx97tj')} aria-label="Copy result to clipboard">`);

							SvgIcon($$renderer, {
								icon: clipboard.isCopied('result') ? 'check' : 'clipboard',
								size: 'sm'
							});

							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div> <div class="result-item svelte-1vx97tj"><span class="result-label svelte-1vx97tj">Conversion Type</span> <span class="conversion-type svelte-1vx97tj">${$.escape(conversionResult.type)}</span></div></div></section> `);

					if (conversionResult.details) {
						$$renderer.push(`<!--[0--><section class="info-panel details"><h3>Detailed Information</h3> <div class="details-grid svelte-1vx97tj">`);

						if (isIPv4ToIPv6()) {
							$$renderer.push(`<!--[0--><div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Compressed Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj">${$.escape(conversionResult.details.compressed)}</code> `);

							Tooltip($$renderer, {
								text: clipboard.isCopied('compressed') ? 'Copied!' : 'Copy compressed format',
								position: 'left',
								children: ($$renderer) => {
									$$renderer.push(`<button type="button"${$.attr_class(`copy-btn-small ${clipboard.isCopied('compressed') ? 'copied' : ''}`, 'svelte-1vx97tj')}>`);

									SvgIcon($$renderer, {
										icon: clipboard.isCopied('compressed') ? 'check' : 'clipboard',
										size: 'sm'
									});

									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> <div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Expanded Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj">${$.escape(conversionResult.details.expanded)}</code> `);

							Tooltip($$renderer, {
								text: clipboard.isCopied('expanded') ? 'Copied!' : 'Copy expanded format',
								position: 'left',
								children: ($$renderer) => {
									$$renderer.push(`<button type="button"${$.attr_class(`copy-btn-small ${clipboard.isCopied('expanded') ? 'copied' : ''}`, 'svelte-1vx97tj')}>`);

									SvgIcon($$renderer, {
										icon: clipboard.isCopied('expanded') ? 'check' : 'clipboard',
										size: 'sm'
									});

									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> <div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Dotted Notation</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj">${$.escape(conversionResult.details.dotted)}</code> `);

							Tooltip($$renderer, {
								text: clipboard.isCopied('dotted') ? 'Copied!' : 'Copy dotted notation',
								position: 'left',
								children: ($$renderer) => {
									$$renderer.push(`<button type="button"${$.attr_class(`copy-btn-small ${clipboard.isCopied('dotted') ? 'copied' : ''}`, 'svelte-1vx97tj')}>`);

									SvgIcon($$renderer, {
										icon: clipboard.isCopied('dotted') ? 'check' : 'clipboard',
										size: 'sm'
									});

									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (conversionResult.details.hex1 && conversionResult.details.hex2) {
								$$renderer.push(`<!--[0--><div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Hex Components</span> <code class="detail-value svelte-1vx97tj">${$.escape(conversionResult.details.hex1)}:${$.escape(conversionResult.details.hex2)}</code></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div> <div class="description-box svelte-1vx97tj"><p class="svelte-1vx97tj">${$.escape(conversionResult.details.description)}</p></div></section>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (!isIPv4ToIPv6() && ipv6Info) {
						$$renderer.push(`<!--[0--><section class="info-panel ipv6-info"><h3>IPv6 Address Information</h3> <div class="ipv6-analysis svelte-1vx97tj"><div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Address Types</span> <div class="type-badges svelte-1vx97tj"><!--[-->`);

						const each_array = $.ensure_array_like(ipv6Info.types);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let type = each_array[$$index];

							$$renderer.push(`<span class="type-badge svelte-1vx97tj">${$.escape(type)}</span>`);
						}

						$$renderer.push(`<!--]--></div></div> <div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Expanded Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj">${$.escape(expandIPv6(ipv6Info.cleaned))}</code> `);

						Tooltip($$renderer, {
							text: clipboard.isCopied('ipv6-expanded') ? 'Copied!' : 'Copy expanded IPv6',
							position: 'left',
							children: ($$renderer) => {
								$$renderer.push(`<button type="button"${$.attr_class(`copy-btn-small ${clipboard.isCopied('ipv6-expanded') ? 'copied' : ''}`, 'svelte-1vx97tj')}>`);

								SvgIcon($$renderer, {
									icon: clipboard.isCopied('ipv6-expanded') ? 'check' : 'clipboard',
									size: 'sm'
								});

								$$renderer.push(`<!----></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Compressed Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj">${$.escape(compressIPv6(ipv6Info.cleaned))}</code> `);

						Tooltip($$renderer, {
							text: clipboard.isCopied('ipv6-compressed') ? 'Copied!' : 'Copy compressed IPv6',
							position: 'left',
							children: ($$renderer) => {
								$$renderer.push(`<button type="button"${$.attr_class(`copy-btn-small ${clipboard.isCopied('ipv6-compressed') ? 'copied' : ''}`, 'svelte-1vx97tj')}>`);

								SvgIcon($$renderer, {
									icon: clipboard.isCopied('ipv6-compressed') ? 'check' : 'clipboard',
									size: 'sm'
								});

								$$renderer.push(`<!----></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div></div> <div class="description-box svelte-1vx97tj"><p class="svelte-1vx97tj">${$.escape(ipv6Info.description)}</p></div></section>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><section class="info-panel error"><h3>Conversion Failed</h3> <div class="error-content svelte-1vx97tj"><p class="error-message svelte-1vx97tj">${$.escape(conversionResult.error)}</p> `);

					if (conversionResult.details?.suggestion) {
						$$renderer.push(`<!--[0--><div class="suggestion-box svelte-1vx97tj"><strong>Suggestion:</strong> ${$.escape(conversionResult.details.suggestion)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></section>`);
				}

				$$renderer.push(`<!--]--></div>`);
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
	});
}