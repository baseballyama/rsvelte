import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<button type="button" aria-label="Copy result to clipboard"><!></button>`);
var root_1 = $.from_html(`<button type="button"><!></button>`);
var root_2 = $.from_html(`<div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Compressed Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj"> </code> <!></div></div> <div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Expanded Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj"> </code> <!></div></div> <div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Dotted Notation</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj"> </code> <!></div></div>`, 1);
var root_3 = $.from_html(`<div class="detail-item svelte-1vx97tj"><span class="detail-label svelte-1vx97tj">Hex Components</span> <code class="detail-value svelte-1vx97tj"> </code></div>`);
var root_4 = $.from_html(`<section class="info-panel details"><h3>Detailed Information</h3> <div class="details-grid svelte-1vx97tj"><!></div> <div class="description-box svelte-1vx97tj"><p class="svelte-1vx97tj"> </p></div></section>`);
var root_5 = $.from_html(`<span class="type-badge svelte-1vx97tj"> </span>`);
var root_6 = $.from_html(`<section class="info-panel ipv6-info"><h3>IPv6 Address Information</h3> <div class="ipv6-analysis svelte-1vx97tj"><div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Address Types</span> <div class="type-badges svelte-1vx97tj"></div></div> <div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Expanded Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj"> </code> <!></div></div> <div class="analysis-item svelte-1vx97tj"><span class="analysis-label svelte-1vx97tj">Compressed Format</span> <div class="detail-value-container svelte-1vx97tj"><code class="detail-value svelte-1vx97tj"> </code> <!></div></div></div> <div class="description-box svelte-1vx97tj"><p class="svelte-1vx97tj"> </p></div></section>`);
var root_7 = $.from_html(`<section class="info-panel success"><h3>Conversion Result</h3> <div class="result-display svelte-1vx97tj"><div class="result-item svelte-1vx97tj"><span class="result-label svelte-1vx97tj"> </span> <div class="result-value-container svelte-1vx97tj"><code class="result-value svelte-1vx97tj"> </code> <!></div></div> <div class="result-item svelte-1vx97tj"><span class="result-label svelte-1vx97tj">Conversion Type</span> <span class="conversion-type svelte-1vx97tj"> </span></div></div></section> <!> <!>`, 1);
var root_8 = $.from_html(`<div class="suggestion-box svelte-1vx97tj"><strong>Suggestion:</strong> </div>`);
var root_9 = $.from_html(`<section class="info-panel error"><h3>Conversion Failed</h3> <div class="error-content svelte-1vx97tj"><p class="error-message svelte-1vx97tj"> </p> <!></div></section>`);
var root_10 = $.from_html(`<div class="results-section fade-in svelte-1vx97tj"><!></div>`);
var root_11 = $.from_html(`<div class="card"><header class="card-header"><h2> </h2> <p> </p></header> <div class="form-group"><!></div> <!></div>`);

export default function IPFamilyConverter($$anchor, $$props) {
	$.push($$props, true);

	let inputValue = $.state('');
	let conversionResult = $.state(null);
	const clipboard = useClipboard();
	let ipv6Info = $.state(null);

	/**
	 * Perform the conversion based on direction
	 */
	function performConversion() {
		if (!$.get(inputValue).trim()) {
			$.set(conversionResult, null);
			$.set(ipv6Info, null);

			return;
		}

		if ($$props.direction === 'ipv4-to-ipv6') {
			$.set(conversionResult, ipv4ToIPv6($.get(inputValue).trim()), true);
		} else {
			$.set(conversionResult, ipv6ToIPv4($.get(inputValue).trim()), true);

			// Also get IPv6 info for analysis
			if (validateIPv6($.get(inputValue).trim()).valid) {
				$.set(ipv6Info, getIPv6Info($.get(inputValue).trim()), true);
			}
		}
	}

	/**
	 * Validate input based on direction
	 */
	function getInputValidation() {
		if (!$.get(inputValue).trim()) {
			return { valid: true };
		}

		if ($$props.direction === 'ipv4-to-ipv6') {
			return validateIPv4($.get(inputValue).trim());
		} else {
			return validateIPv6($.get(inputValue).trim());
		}
	}

	/**
	 * Copy text to clipboard with visual feedback
	 */
	// React to input changes
	$.user_effect(() => {
		performConversion();
	});

	const validation = $.derived(getInputValidation);
	const isIPv4ToIPv6 = $.derived(() => $$props.direction === 'ipv4-to-ipv6');
	const placeholder = $.derived(() => $.get(isIPv4ToIPv6) ? '192.168.1.1' : '::ffff:192.168.1.1');
	var div = root_11();
	var header = $.child(div);
	var h2 = $.child(header);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(isIPv4ToIPv6) ? 'IPv4 Address' : 'IPv6 Address');

		IPInput(node, {
			get label() {
				return $.get($0);
			},

			get placeholder() {
				return $.get(placeholder);
			},

			get value() {
				return $.get(inputValue);
			},

			set value($$value) {
				$.set(inputValue, $$value, true);
			}
		});
	}

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_2 = root_10();
			var node_2 = $.child(div_2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment = root_7();
					var section = $.first_child(fragment);
					var div_3 = $.sibling($.child(section), 2);
					var div_4 = $.child(div_3);
					var span = $.child(div_4);
					var text_2 = $.only_child(span, true);
					var div_5 = $.sibling(span, 2);
					var code = $.child(div_5);
					var text_3 = $.only_child(code, true);
					var node_3 = $.sibling(code, 2);

					{
						let $0 = $.derived(() => clipboard.isCopied('result')
							? 'Copied!'
							: `Copy ${$.get(isIPv4ToIPv6) ? 'IPv6' : 'IPv4'} address`);

						Tooltip(node_3, {
							get text() {
								return $.get($0);
							},
							position: 'left',
							children: ($$anchor, $$slotProps) => {
								var button = root();
								var node_4 = $.child(button);

								{
									let $0 = $.derived(() => clipboard.isCopied('result') ? 'check' : 'clipboard');

									SvgIcon(node_4, {
										get icon() {
											return $.get($0);
										},
										size: 'sm'
									});
								}

								$.reset(button);
								$.template_effect(($0) => $.set_class(button, 1, `copy-btn ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('result') ? 'copied' : '']);
								$.delegated('click', button, () => clipboard.copy($.get(conversionResult)?.result || '', 'result'));
								$.append($$anchor, button);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_5);
					$.reset(div_4);

					var div_6 = $.sibling(div_4, 2);
					var span_1 = $.sibling($.child(div_6), 2);
					var text_4 = $.only_child(span_1, true);

					$.reset(div_6);
					$.reset(div_3);
					$.reset(section);

					var node_5 = $.sibling(section, 2);

					{
						var consequent_2 = ($$anchor) => {
							var section_1 = root_4();
							var div_7 = $.sibling($.child(section_1), 2);
							var node_6 = $.child(div_7);

							{
								var consequent = ($$anchor) => {
									var fragment_1 = root_2();
									var div_8 = $.first_child(fragment_1);
									var div_9 = $.sibling($.child(div_8), 2);
									var code_1 = $.child(div_9);
									var text_5 = $.only_child(code_1, true);
									var node_7 = $.sibling(code_1, 2);

									{
										let $0 = $.derived(() => clipboard.isCopied('compressed') ? 'Copied!' : 'Copy compressed format');

										Tooltip(node_7, {
											get text() {
												return $.get($0);
											},
											position: 'left',
											children: ($$anchor, $$slotProps) => {
												var button_1 = root_1();
												var node_8 = $.child(button_1);

												{
													let $0 = $.derived(() => clipboard.isCopied('compressed') ? 'check' : 'clipboard');

													SvgIcon(node_8, {
														get icon() {
															return $.get($0);
														},
														size: 'sm'
													});
												}

												$.reset(button_1);
												$.template_effect(($0) => $.set_class(button_1, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('compressed') ? 'copied' : '']);
												$.delegated('click', button_1, () => clipboard.copy($.get(conversionResult)?.details?.compressed || '', 'compressed'));
												$.append($$anchor, button_1);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_9);
									$.reset(div_8);

									var div_10 = $.sibling(div_8, 2);
									var div_11 = $.sibling($.child(div_10), 2);
									var code_2 = $.child(div_11);
									var text_6 = $.only_child(code_2, true);
									var node_9 = $.sibling(code_2, 2);

									{
										let $0 = $.derived(() => clipboard.isCopied('expanded') ? 'Copied!' : 'Copy expanded format');

										Tooltip(node_9, {
											get text() {
												return $.get($0);
											},
											position: 'left',
											children: ($$anchor, $$slotProps) => {
												var button_2 = root_1();
												var node_10 = $.child(button_2);

												{
													let $0 = $.derived(() => clipboard.isCopied('expanded') ? 'check' : 'clipboard');

													SvgIcon(node_10, {
														get icon() {
															return $.get($0);
														},
														size: 'sm'
													});
												}

												$.reset(button_2);
												$.template_effect(($0) => $.set_class(button_2, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('expanded') ? 'copied' : '']);
												$.delegated('click', button_2, () => clipboard.copy($.get(conversionResult)?.details?.expanded || '', 'expanded'));
												$.append($$anchor, button_2);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_11);
									$.reset(div_10);

									var div_12 = $.sibling(div_10, 2);
									var div_13 = $.sibling($.child(div_12), 2);
									var code_3 = $.child(div_13);
									var text_7 = $.only_child(code_3, true);
									var node_11 = $.sibling(code_3, 2);

									{
										let $0 = $.derived(() => clipboard.isCopied('dotted') ? 'Copied!' : 'Copy dotted notation');

										Tooltip(node_11, {
											get text() {
												return $.get($0);
											},
											position: 'left',
											children: ($$anchor, $$slotProps) => {
												var button_3 = root_1();
												var node_12 = $.child(button_3);

												{
													let $0 = $.derived(() => clipboard.isCopied('dotted') ? 'check' : 'clipboard');

													SvgIcon(node_12, {
														get icon() {
															return $.get($0);
														},
														size: 'sm'
													});
												}

												$.reset(button_3);
												$.template_effect(($0) => $.set_class(button_3, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('dotted') ? 'copied' : '']);
												$.delegated('click', button_3, () => clipboard.copy($.get(conversionResult)?.details?.dotted || '', 'dotted'));
												$.append($$anchor, button_3);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_13);
									$.reset(div_12);

									$.template_effect(() => {
										$.set_text(text_5, $.get(conversionResult).details.compressed);
										$.set_text(text_6, $.get(conversionResult).details.expanded);
										$.set_text(text_7, $.get(conversionResult).details.dotted);
									});

									$.append($$anchor, fragment_1);
								};

								var alternate = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_13 = $.first_child(fragment_2);

									{
										var consequent_1 = ($$anchor) => {
											var div_14 = root_3();
											var code_4 = $.sibling($.child(div_14), 2);
											var text_8 = $.only_child(code_4);

											$.reset(div_14);
											$.template_effect(() => $.set_text(text_8, `${$.get(conversionResult).details.hex1 ?? ''}:${$.get(conversionResult).details.hex2 ?? ''}`));
											$.append($$anchor, div_14);
										};

										$.if(node_13, ($$render) => {
											if ($.get(conversionResult).details.hex1 && $.get(conversionResult).details.hex2) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_2);
								};

								$.if(node_6, ($$render) => {
									if ($.get(isIPv4ToIPv6)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div_7);

							var div_15 = $.sibling(div_7, 2);
							var p_1 = $.child(div_15);
							var text_9 = $.only_child(p_1, true);

							$.reset(div_15);
							$.reset(section_1);
							$.template_effect(() => $.set_text(text_9, $.get(conversionResult).details.description));
							$.append($$anchor, section_1);
						};

						$.if(node_5, ($$render) => {
							if ($.get(conversionResult).details) $$render(consequent_2);
						});
					}

					var node_14 = $.sibling(node_5, 2);

					{
						var consequent_3 = ($$anchor) => {
							var section_2 = root_6();
							var div_16 = $.sibling($.child(section_2), 2);
							var div_17 = $.child(div_16);
							var div_18 = $.sibling($.child(div_17), 2);

							$.each(div_18, 20, () => $.get(ipv6Info).types, (type) => type, ($$anchor, type) => {
								var span_2 = root_5();
								var text_10 = $.only_child(span_2, true);

								$.template_effect(() => $.set_text(text_10, type));
								$.append($$anchor, span_2);
							});

							$.reset(div_18);
							$.reset(div_17);

							var div_19 = $.sibling(div_17, 2);
							var div_20 = $.sibling($.child(div_19), 2);
							var code_5 = $.child(div_20);
							var text_11 = $.only_child(code_5, true);
							var node_15 = $.sibling(code_5, 2);

							{
								let $0 = $.derived(() => clipboard.isCopied('ipv6-expanded') ? 'Copied!' : 'Copy expanded IPv6');

								Tooltip(node_15, {
									get text() {
										return $.get($0);
									},
									position: 'left',
									children: ($$anchor, $$slotProps) => {
										var button_4 = root_1();
										var node_16 = $.child(button_4);

										{
											let $0 = $.derived(() => clipboard.isCopied('ipv6-expanded') ? 'check' : 'clipboard');

											SvgIcon(node_16, {
												get icon() {
													return $.get($0);
												},
												size: 'sm'
											});
										}

										$.reset(button_4);
										$.template_effect(($0) => $.set_class(button_4, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('ipv6-expanded') ? 'copied' : '']);
										$.delegated('click', button_4, () => clipboard.copy(expandIPv6($.get(ipv6Info)?.cleaned || ''), 'ipv6-expanded'));
										$.append($$anchor, button_4);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_20);
							$.reset(div_19);

							var div_21 = $.sibling(div_19, 2);
							var div_22 = $.sibling($.child(div_21), 2);
							var code_6 = $.child(div_22);
							var text_12 = $.only_child(code_6, true);
							var node_17 = $.sibling(code_6, 2);

							{
								let $0 = $.derived(() => clipboard.isCopied('ipv6-compressed') ? 'Copied!' : 'Copy compressed IPv6');

								Tooltip(node_17, {
									get text() {
										return $.get($0);
									},
									position: 'left',
									children: ($$anchor, $$slotProps) => {
										var button_5 = root_1();
										var node_18 = $.child(button_5);

										{
											let $0 = $.derived(() => clipboard.isCopied('ipv6-compressed') ? 'check' : 'clipboard');

											SvgIcon(node_18, {
												get icon() {
													return $.get($0);
												},
												size: 'sm'
											});
										}

										$.reset(button_5);
										$.template_effect(($0) => $.set_class(button_5, 1, `copy-btn-small ${$0 ?? ''}`, 'svelte-1vx97tj'), [() => clipboard.isCopied('ipv6-compressed') ? 'copied' : '']);
										$.delegated('click', button_5, () => clipboard.copy(compressIPv6($.get(ipv6Info)?.cleaned || ''), 'ipv6-compressed'));
										$.append($$anchor, button_5);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_22);
							$.reset(div_21);
							$.reset(div_16);

							var div_23 = $.sibling(div_16, 2);
							var p_2 = $.child(div_23);
							var text_13 = $.only_child(p_2, true);

							$.reset(div_23);
							$.reset(section_2);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_11, $0);
									$.set_text(text_12, $1);
									$.set_text(text_13, $.get(ipv6Info).description);
								},
								[
									() => expandIPv6($.get(ipv6Info).cleaned),
									() => compressIPv6($.get(ipv6Info).cleaned)
								]
							);

							$.append($$anchor, section_2);
						};

						$.if(node_14, ($$render) => {
							if (!$.get(isIPv4ToIPv6) && $.get(ipv6Info)) $$render(consequent_3);
						});
					}

					$.template_effect(() => {
						$.set_text(text_2, $.get(isIPv4ToIPv6) ? 'IPv6 Address' : 'IPv4 Address');
						$.set_text(text_3, $.get(conversionResult).result);
						$.set_text(text_4, $.get(conversionResult).type);
					});

					$.append($$anchor, fragment);
				};

				var alternate_1 = ($$anchor) => {
					var section_3 = root_9();
					var div_24 = $.sibling($.child(section_3), 2);
					var p_3 = $.child(div_24);
					var text_14 = $.only_child(p_3, true);
					var node_19 = $.sibling(p_3, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_25 = root_8();
							var text_15 = $.sibling($.child(div_25));

							$.reset(div_25);
							$.template_effect(() => $.set_text(text_15, ` ${$.get(conversionResult).details.suggestion ?? ''}`));
							$.append($$anchor, div_25);
						};

						$.if(node_19, ($$render) => {
							if ($.get(conversionResult).details?.suggestion) $$render(consequent_5);
						});
					}

					$.reset(div_24);
					$.reset(section_3);
					$.template_effect(() => $.set_text(text_14, $.get(conversionResult).error));
					$.append($$anchor, section_3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(conversionResult).success) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(validation).valid && $.get(conversionResult)) $$render(consequent_6);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);