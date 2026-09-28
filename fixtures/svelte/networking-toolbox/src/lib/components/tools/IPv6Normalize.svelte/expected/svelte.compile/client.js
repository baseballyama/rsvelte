import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { normalizeIPv6Addresses } from '$lib/utils/ipv6-normalize.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<div class="loading svelte-1q1k7x8"><!> Normalizing addresses...</div>`);
var root_1 = $.from_html(`<div class="error-item svelte-1q1k7x8"> </div>`);
var root_2 = $.from_html(`<div class="errors svelte-1q1k7x8"><h3 class="svelte-1q1k7x8"><!> Errors</h3> <!></div>`);
var root_3 = $.from_html(`<div class="normalized-address svelte-1q1k7x8"><span class="address-label svelte-1q1k7x8">Normalized:</span> <div class="normalized-content svelte-1q1k7x8"><button type="button" class="code-button normalized svelte-1q1k7x8" title="Click to copy"> </button> <button type="button" title="Copy normalized address"><!></button></div></div>`);
var root_4 = $.from_html(`<div class="already-normalized svelte-1q1k7x8"><!> Address is already in RFC 5952 canonical form</div>`);
var root_5 = $.from_html(`<div class="rule-applied svelte-1q1k7x8"><!> Converted to lowercase</div>`);
var root_6 = $.from_html(`<div class="rule-applied svelte-1q1k7x8"><!> Removed leading zeros</div>`);
var root_7 = $.from_html(`<div class="rule-applied svelte-1q1k7x8"><!> Applied zero compression (::)</div>`);
var root_8 = $.from_html(`<div class="step svelte-1q1k7x8"><div class="step-header svelte-1q1k7x8"><span class="step-number svelte-1q1k7x8"> </span> <span class="step-description svelte-1q1k7x8"> </span></div> <div class="step-transformation svelte-1q1k7x8"><div class="transformation-item svelte-1q1k7x8"><span class="transformation-label svelte-1q1k7x8">Before:</span> <code class="svelte-1q1k7x8"> </code></div> <div class="transformation-arrow svelte-1q1k7x8">→</div> <div class="transformation-item svelte-1q1k7x8"><span class="transformation-label svelte-1q1k7x8">After:</span> <code class="svelte-1q1k7x8"> </code></div></div></div>`);
var root_9 = $.from_html(`<div class="normalization-steps svelte-1q1k7x8"><h4 class="svelte-1q1k7x8">Normalization Steps:</h4> <!></div>`);
var root_10 = $.from_html(`<div class="applied-rules svelte-1q1k7x8"><h4 class="svelte-1q1k7x8">Applied Normalization Rules:</h4> <div class="rules-list svelte-1q1k7x8"><!> <!> <!></div></div> <!>`, 1);
var root_11 = $.from_html(`<div class="normalization-details svelte-1q1k7x8"><!></div>`);
var root_12 = $.from_html(`<div class="error-message svelte-1q1k7x8"><!> </div>`);
var root_13 = $.from_html(`<div><div class="status svelte-1q1k7x8"><!></div> <div class="card-content svelte-1q1k7x8"><div class="address-info svelte-1q1k7x8"><div class="original-address svelte-1q1k7x8"><span class="address-label svelte-1q1k7x8">Original:</span> <button type="button" class="code-button svelte-1q1k7x8" title="Click to copy"> </button></div> <!></div></div> <!></div>`);
var root_14 = $.from_html(`<div class="summary svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">Normalization Summary</h3> <div class="summary-stats svelte-1q1k7x8"><div class="stat svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8"> </span> <span class="stat-label svelte-1q1k7x8">Total Inputs</span></div> <div class="stat valid svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8"> </span> <span class="stat-label svelte-1q1k7x8">Valid</span></div> <div class="stat invalid svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8"> </span> <span class="stat-label svelte-1q1k7x8">Invalid</span></div> <div class="stat already-normalized svelte-1q1k7x8"><span class="stat-value svelte-1q1k7x8"> </span> <span class="stat-label svelte-1q1k7x8">Already Normalized</span></div></div></div> <div class="normalized-addresses"><div class="normalized-header svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">Normalized Addresses</h3> <div class="export-buttons svelte-1q1k7x8"><button><!> Copy All</button> <button class="svelte-1q1k7x8"><!> Export TXT</button> <button class="svelte-1q1k7x8"><!> Export CSV</button> <button class="svelte-1q1k7x8"><!> Export JSON</button></div></div></div> <div class="normalizations"><div class="normalizations-list svelte-1q1k7x8"></div></div>`, 1);
var root_15 = $.from_html(`<div class="results svelte-1q1k7x8"><!> <!></div>`);

var root_16 = $.from_html(`<div class="card svelte-1q1k7x8"><header class="card-header"><h2 class="svelte-1q1k7x8">IPv6 Normalizer</h2> <p class="svelte-1q1k7x8">Normalize IPv6 addresses to RFC 5952 canonical form with lowercase, zero compression, and leading zero removal</p></header> <div class="input-section svelte-1q1k7x8"><div class="input-group svelte-1q1k7x8"><label for="inputs" class="svelte-1q1k7x8">IPv6 Addresses</label> <textarea id="inputs" placeholder="2001:0db8:0000:0000:0000:ff00:0042:8329
2001:db8:0:0:1:0:0:1
2001:0db8:0001:0000:0000:0ab9:C0A8:0102
fe80::1%eth0" rows="6" class="svelte-1q1k7x8"></textarea> <div class="input-help svelte-1q1k7x8">Enter one IPv6 address per line. Supports zone identifiers (%) and IPv4-mapped addresses</div></div> <div class="rfc-info svelte-1q1k7x8"><h3 class="svelte-1q1k7x8">RFC 5952 Normalization Rules</h3> <ul class="svelte-1q1k7x8"><li class="svelte-1q1k7x8">Convert hexadecimal to lowercase</li> <li class="svelte-1q1k7x8">Remove leading zeros in each group</li> <li class="svelte-1q1k7x8">Compress longest sequence of consecutive zero groups with ::</li> <li class="svelte-1q1k7x8">Preserve zone identifiers (%)</li> <li class="svelte-1q1k7x8">Support IPv4-mapped IPv6 addresses</li></ul></div></div> <!> <!></div>`);

export default function IPv6Normalize($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('2001:0db8:0000:0000:0000:ff00:0042:8329\n2001:db8:0:0:1:0:0:1\n2001:0db8:0001:0000:0000:0ab9:C0A8:0102\n2001:db8::1\nfe80::1%eth0');
	let result = $.state(null);
	let isLoading = $.state(false);
	const clipboard = useClipboard();

	function normalizeAddresses() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

			$.set(result, normalizeIPv6Addresses(inputs), true);
		} catch(error) {
			$.set(
				result,
				{
					normalizations: [],
					summary: {
						totalInputs: 0,
						validInputs: 0,
						invalidInputs: 0,
						alreadyNormalizedInputs: 0
					},
					errors: [error instanceof Error ? error.message : 'Unknown error']
				},
				true
			);
		} finally {
			$.set(isLoading, false);
		}
	}

	function exportResults(format) {
		if (!$.get(result)) return;

		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
		let content = '';
		let filename = '';
		let mimeType = 'text/plain';

		if (format === 'csv') {
			const headers = 'Input,Normalized,Valid,Compression Applied,Leading Zeros Removed,Lowercase Applied,Error';
			const rows = $.get(result).normalizations.map((norm) => `"${norm.input}","${norm.normalized}","${norm.isValid}","${norm.compressionApplied}","${norm.leadingZerosRemoved}","${norm.lowercaseApplied}","${norm.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `ipv6-normalized-${timestamp}.csv`;
			mimeType = 'text/csv';
		} else if (format === 'json') {
			content = JSON.stringify($.get(result), null, 2);
			filename = `ipv6-normalized-${timestamp}.json`;
			mimeType = 'application/json';
		} else {
			// Plain text format with just normalized addresses
			content = $.get(result).normalizations.filter((n) => n.isValid).map((n) => n.normalized).join('\n');

			filename = `ipv6-normalized-${timestamp}.txt`;
			mimeType = 'text/plain';
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyAllNormalized() {
		if ($.get(result)) {
			const normalized = $.get(result).normalizations.filter((n) => n.isValid).map((n) => n.normalized).join('\n');

			clipboard.copy(normalized, 'copy-all');
		}
	}

	// Auto-normalize when inputs change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(normalizeAddresses, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_16();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var textarea = $.sibling($.child(div_2), 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_2);
	$.next(2);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			Icon(node_1, { name: 'loader' });
			$.next();
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(isLoading)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_4 = root_15();
			var node_3 = $.child(div_4);

			{
				var consequent_1 = ($$anchor) => {
					var div_5 = root_2();
					var h3 = $.child(div_5);
					var node_4 = $.child(h3);

					Icon(node_4, { name: 'alert-triangle' });
					$.next();
					$.reset(h3);

					var node_5 = $.sibling(h3, 2);

					$.each(node_5, 16, () => $.get(result).errors, (error) => error, ($$anchor, error) => {
						var div_6 = root_1();
						var text = $.only_child(div_6, true);

						$.template_effect(() => $.set_text(text, error));
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_1);
				});
			}

			var node_6 = $.sibling(node_3, 2);

			{
				var consequent_10 = ($$anchor) => {
					var fragment = root_14();
					var div_7 = $.first_child(fragment);
					var div_8 = $.sibling($.child(div_7), 2);
					var div_9 = $.child(div_8);
					var span = $.child(div_9);
					var text_1 = $.only_child(span, true);

					$.next(2);
					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var span_1 = $.child(div_10);
					var text_2 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_10);

					var div_11 = $.sibling(div_10, 2);
					var span_2 = $.child(div_11);
					var text_3 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var span_3 = $.child(div_12);
					var text_4 = $.only_child(span_3, true);

					$.next(2);
					$.reset(div_12);
					$.reset(div_8);
					$.reset(div_7);

					var div_13 = $.sibling(div_7, 2);
					var div_14 = $.child(div_13);
					var div_15 = $.sibling($.child(div_14), 2);
					var button = $.child(div_15);
					let classes;
					var node_7 = $.child(button);

					{
						let $0 = $.derived(() => clipboard.isCopied('copy-all') ? 'check' : 'copy');

						Icon(node_7, {
							get name() {
								return $.get($0);
							}
						});
					}

					$.next();
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_8 = $.child(button_1);

					Icon(node_8, { name: 'download' });
					$.next();
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_9 = $.child(button_2);

					Icon(node_9, { name: 'csv-file' });
					$.next();
					$.reset(button_2);

					var button_3 = $.sibling(button_2, 2);
					var node_10 = $.child(button_3);

					Icon(node_10, { name: 'json-file' });
					$.next();
					$.reset(button_3);
					$.reset(div_15);
					$.reset(div_14);
					$.reset(div_13);

					var div_16 = $.sibling(div_13, 2);
					var div_17 = $.child(div_16);

					$.each(div_17, 23, () => $.get(result).normalizations, (normalization, index) => `norm-${index}`, ($$anchor, normalization, index) => {
						var div_18 = root_13();
						let classes_1;
						var div_19 = $.child(div_18);
						var node_11 = $.child(div_19);

						{
							var consequent_2 = ($$anchor) => {
								Icon($$anchor, { name: 'check-circle' });
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, { name: 'x-circle' });
							};

							$.if(node_11, ($$render) => {
								if ($.get(normalization).isValid) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(div_19);

						var div_20 = $.sibling(div_19, 2);
						var div_21 = $.child(div_20);
						var div_22 = $.child(div_21);
						var button_4 = $.sibling($.child(div_22), 2);
						var text_5 = $.only_child(button_4, true);

						$.reset(div_22);

						var node_12 = $.sibling(div_22, 2);

						{
							var consequent_3 = ($$anchor) => {
								var div_23 = root_3();
								var div_24 = $.sibling($.child(div_23), 2);
								var button_5 = $.child(div_24);
								var text_6 = $.only_child(button_5, true);
								var button_6 = $.sibling(button_5, 2);
								let classes_2;
								var node_13 = $.child(button_6);

								{
									let $0 = $.derived(() => clipboard.isCopied(`copy-${$.get(index)}`) ? 'check' : 'copy');

									Icon(node_13, {
										get name() {
											return $.get($0);
										},
										size: 'sm'
									});
								}

								$.reset(button_6);
								$.reset(div_24);
								$.reset(div_23);

								$.template_effect(
									($0) => {
										$.set_text(text_6, $.get(normalization).normalized);
										classes_2 = $.set_class(button_6, 1, 'copy-button svelte-1q1k7x8', null, classes_2, { copied: $0 });
									},
									[() => clipboard.isCopied(`copy-${$.get(index)}`)]
								);

								$.delegated('click', button_5, () => clipboard.copy($.get(normalization).normalized, `normalized-${$.get(index)}`));
								$.delegated('click', button_6, () => clipboard.copy($.get(normalization).normalized, `copy-${$.get(index)}`));
								$.append($$anchor, div_23);
							};

							$.if(node_12, ($$render) => {
								if ($.get(normalization).isValid) $$render(consequent_3);
							});
						}

						$.reset(div_21);
						$.reset(div_20);

						var node_14 = $.sibling(div_20, 2);

						{
							var consequent_9 = ($$anchor) => {
								var div_25 = root_11();
								var node_15 = $.child(div_25);

								{
									var consequent_4 = ($$anchor) => {
										var div_26 = root_4();
										var node_16 = $.child(div_26);

										Icon(node_16, { name: 'check' });
										$.next();
										$.reset(div_26);
										$.append($$anchor, div_26);
									};

									var alternate_1 = ($$anchor) => {
										var fragment_3 = root_10();
										var div_27 = $.first_child(fragment_3);
										var div_28 = $.sibling($.child(div_27), 2);
										var node_17 = $.child(div_28);

										{
											var consequent_5 = ($$anchor) => {
												var div_29 = root_5();
												var node_18 = $.child(div_29);

												Icon(node_18, { name: 'check' });
												$.next();
												$.reset(div_29);
												$.append($$anchor, div_29);
											};

											$.if(node_17, ($$render) => {
												if ($.get(normalization).lowercaseApplied) $$render(consequent_5);
											});
										}

										var node_19 = $.sibling(node_17, 2);

										{
											var consequent_6 = ($$anchor) => {
												var div_30 = root_6();
												var node_20 = $.child(div_30);

												Icon(node_20, { name: 'check' });
												$.next();
												$.reset(div_30);
												$.append($$anchor, div_30);
											};

											$.if(node_19, ($$render) => {
												if ($.get(normalization).leadingZerosRemoved) $$render(consequent_6);
											});
										}

										var node_21 = $.sibling(node_19, 2);

										{
											var consequent_7 = ($$anchor) => {
												var div_31 = root_7();
												var node_22 = $.child(div_31);

												Icon(node_22, { name: 'check' });
												$.next();
												$.reset(div_31);
												$.append($$anchor, div_31);
											};

											$.if(node_21, ($$render) => {
												if ($.get(normalization).compressionApplied) $$render(consequent_7);
											});
										}

										$.reset(div_28);
										$.reset(div_27);

										var node_23 = $.sibling(div_27, 2);

										{
											var consequent_8 = ($$anchor) => {
												var div_32 = root_9();
												var node_24 = $.sibling($.child(div_32), 2);

												$.each(node_24, 17, () => $.get(normalization).steps, (step) => `step-${step.step}`, ($$anchor, step) => {
													var div_33 = root_8();
													var div_34 = $.child(div_33);
													var span_4 = $.child(div_34);
													var text_7 = $.only_child(span_4);
													var span_5 = $.sibling(span_4, 2);
													var text_8 = $.only_child(span_5, true);

													$.reset(div_34);

													var div_35 = $.sibling(div_34, 2);
													var div_36 = $.child(div_35);
													var code = $.sibling($.child(div_36), 2);
													var text_9 = $.only_child(code, true);

													$.reset(div_36);

													var div_37 = $.sibling(div_36, 4);
													var code_1 = $.sibling($.child(div_37), 2);
													var text_10 = $.only_child(code_1, true);

													$.reset(div_37);
													$.reset(div_35);
													$.reset(div_33);

													$.template_effect(() => {
														$.set_text(text_7, `Step ${$.get(step).step ?? ''}`);
														$.set_text(text_8, $.get(step).description);
														$.set_text(text_9, $.get(step).before);
														$.set_text(text_10, $.get(step).after);
													});

													$.append($$anchor, div_33);
												});

												$.reset(div_32);
												$.append($$anchor, div_32);
											};

											$.if(node_23, ($$render) => {
												if ($.get(normalization).steps.length > 0) $$render(consequent_8);
											});
										}

										$.append($$anchor, fragment_3);
									};

									$.if(node_15, ($$render) => {
										if ($.get(normalization).input === $.get(normalization).normalized) $$render(consequent_4); else $$render(alternate_1, -1);
									});
								}

								$.reset(div_25);
								$.append($$anchor, div_25);
							};

							var alternate_2 = ($$anchor) => {
								var div_38 = root_12();
								var node_25 = $.child(div_38);

								Icon(node_25, { name: 'alert-triangle' });

								var text_11 = $.sibling(node_25);

								$.reset(div_38);
								$.template_effect(() => $.set_text(text_11, ` ${$.get(normalization).error ?? ''}`));
								$.append($$anchor, div_38);
							};

							$.if(node_14, ($$render) => {
								if ($.get(normalization).isValid) $$render(consequent_9); else $$render(alternate_2, -1);
							});
						}

						$.reset(div_18);

						$.template_effect(() => {
							classes_1 = $.set_class(div_18, 1, 'normalization-card svelte-1q1k7x8', null, classes_1, {
								valid: $.get(normalization).isValid,
								invalid: !$.get(normalization).isValid
							});

							$.set_text(text_5, $.get(normalization).input);
						});

						$.delegated('click', button_4, () => clipboard.copy($.get(normalization).input, `original-${$.get(index)}`));
						$.append($$anchor, div_18);
					});

					$.reset(div_17);
					$.reset(div_16);

					$.template_effect(
						($0) => {
							$.set_text(text_1, $.get(result).summary.totalInputs);
							$.set_text(text_2, $.get(result).summary.validInputs);
							$.set_text(text_3, $.get(result).summary.invalidInputs);
							$.set_text(text_4, $.get(result).summary.alreadyNormalizedInputs);
							classes = $.set_class(button, 1, 'svelte-1q1k7x8', null, classes, { copied: $0 });
						},
						[() => clipboard.isCopied('copy-all')]
					);

					$.delegated('click', button, copyAllNormalized);
					$.delegated('click', button_1, () => exportResults('txt'));
					$.delegated('click', button_2, () => exportResults('csv'));
					$.delegated('click', button_3, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).normalizations.length > 0) $$render(consequent_10);
				});
			}

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($.get(result)) $$render(consequent_11);
		});
	}

	$.reset(div);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);