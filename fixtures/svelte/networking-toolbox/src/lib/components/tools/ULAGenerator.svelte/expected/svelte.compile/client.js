import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { generateULAAddresses, parseULA } from '$lib/utils/ula';

var root = $.from_html(`<div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Failed:</span> <span class="value error svelte-1vyxf2j"> </span></div>`);
var root_1 = $.from_html(`<li class="error svelte-1vyxf2j"> </li>`);
var root_2 = $.from_html(`<div class="errors svelte-1vyxf2j"><h4 class="svelte-1vyxf2j">Errors</h4> <ul class="svelte-1vyxf2j"></ul></div>`);
var root_3 = $.from_html(`<div class="generation-result svelte-1vyxf2j"><div class="generation-header svelte-1vyxf2j"><h4 class="svelte-1vyxf2j"> </h4> <button class="copy-btn svelte-1vyxf2j" title="Copy network address">📋</button></div> <div class="address-info svelte-1vyxf2j"><div class="address-row svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Network:</span> <code class="network svelte-1vyxf2j"> </code></div> <div class="address-row svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Prefix:</span> <code class="svelte-1vyxf2j"> </code></div></div> <div class="components svelte-1vyxf2j"><h5 class="svelte-1vyxf2j">Address Components</h5> <div class="component-grid svelte-1vyxf2j"><div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">ULA Prefix:</span> <code class="svelte-1vyxf2j"> </code> <small class="svelte-1vyxf2j"> </small></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Global ID:</span> <code class="svelte-1vyxf2j"> </code> <small class="svelte-1vyxf2j"> </small></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Subnet ID:</span> <code class="svelte-1vyxf2j"> </code> <small class="svelte-1vyxf2j"> </small></div></div></div> <div class="generation-details svelte-1vyxf2j"><h5 class="svelte-1vyxf2j">Generation Details</h5> <div class="detail-grid svelte-1vyxf2j"><div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Algorithm:</span> <span class="svelte-1vyxf2j"> </span></div> <div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Timestamp:</span> <span class="svelte-1vyxf2j"> </span></div> <div class="detail svelte-1vyxf2j"><span class="detail-label svelte-1vyxf2j">Entropy:</span> <code> </code></div></div></div></div>`);
var root_4 = $.from_html(`<div class="generation-result error-result svelte-1vyxf2j"><h4> </h4> <p class="error svelte-1vyxf2j"> </p></div>`);
var root_5 = $.from_html(`<div class="generations svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">Generated ULA Addresses</h3> <!></div>`);
var root_6 = $.from_html(`<div class="results-section svelte-1vyxf2j"><div class="summary svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">Generation Summary</h3> <div class="summary-stats svelte-1vyxf2j"><div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Total Requested:</span> <span class="value svelte-1vyxf2j"> </span></div> <div class="stat svelte-1vyxf2j"><span class="label svelte-1vyxf2j">Successfully Generated:</span> <span class="value success svelte-1vyxf2j"> </span></div> <!></div></div> <!> <!></div>`);
var root_7 = $.from_html(`<div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Interface ID:</span> <code class="svelte-1vyxf2j"> </code></div>`);
var root_8 = $.from_html(`<div class="parse-results svelte-1vyxf2j"><h4 class="svelte-1vyxf2j">Parsed Components</h4> <div class="component-grid svelte-1vyxf2j"><div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">ULA Prefix:</span> <code class="svelte-1vyxf2j"> </code></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Global ID:</span> <code class="svelte-1vyxf2j"> </code></div> <div class="component svelte-1vyxf2j"><span class="comp-label svelte-1vyxf2j">Subnet ID:</span> <code class="svelte-1vyxf2j"> </code></div> <!></div></div>`);
var root_9 = $.from_html(`<div class="error-message svelte-1vyxf2j"><p class="error svelte-1vyxf2j"> </p></div>`);
var root_10 = $.from_html(`<div class="container svelte-1vyxf2j"><div class="card svelte-1vyxf2j"><h2 class="svelte-1vyxf2j">ULA Generator</h2> <p class="svelte-1vyxf2j">Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs.</p> <div class="input-section svelte-1vyxf2j"><div class="input-group svelte-1vyxf2j"><label for="count" class="svelte-1vyxf2j">Number of ULAs to generate (1-100):</label> <input id="count" type="number" min="1" max="100" placeholder="1" class="svelte-1vyxf2j"/></div> <div class="input-group svelte-1vyxf2j"><label for="subnet-ids" class="svelte-1vyxf2j">Subnet IDs (optional, comma/newline separated):</label> <textarea id="subnet-ids" rows="3" placeholder="0001, 0002, 0003 or leave empty for random generation" class="svelte-1vyxf2j"></textarea> <small class="svelte-1vyxf2j">If provided, must be 1-4 hex digits. Leave empty for random generation.</small></div> <button class="generate-btn svelte-1vyxf2j"> </button></div> <!></div> <div class="card svelte-1vyxf2j"><h3 class="svelte-1vyxf2j">ULA Address Parser</h3> <p class="svelte-1vyxf2j">Parse and analyze existing ULA addresses to extract their components.</p> <div class="input-group svelte-1vyxf2j"><label for="parse-input" class="svelte-1vyxf2j">ULA Address:</label> <input id="parse-input" type="text" placeholder="fd12:3456:789a:0001::/64" class="svelte-1vyxf2j"/></div> <!></div></div>`);

export default function ULAGenerator($$anchor, $$props) {
	$.push($$props, true);

	let count = 1;
	let subnetIds = '';
	let result = null;
	let loading = false;
	let parseInput = '';
	let parseResult = null;

	async function generateULAs() {
		if (count < 1 || count > 100) return;

		loading = true;

		try {
			// Parse subnet IDs if provided
			const subnetIdArray = subnetIds.split(/[,\n]/).map((s) => s.trim()).filter((s) => s.length > 0);

			result = generateULAAddresses(count, subnetIdArray.length > 0 ? subnetIdArray : undefined);
		} finally {
			loading = false;
		}
	}

	function parseULAAddress() {
		if (!parseInput.trim()) {
			parseResult = null;

			return;
		}

		parseResult = parseULA(parseInput.trim());
	}

	function copyToClipboard(text) {
		navigator.clipboard?.writeText(text);
	}

	var div = root_10();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var div_3 = $.child(div_2);
	var input = $.sibling($.child(div_3), 2);

	$.remove_input_defaults(input);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var textarea = $.sibling($.child(div_4), 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_4);

	var button = $.sibling(div_4, 2);
	var text_1 = $.only_child(button, true);

	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_5 = root_6();
			var div_6 = $.child(div_5);
			var div_7 = $.sibling($.child(div_6), 2);
			var div_8 = $.child(div_7);
			var span = $.sibling($.child(div_8), 2);
			var text_2 = $.only_child(span, true);

			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var span_1 = $.sibling($.child(div_9), 2);
			var text_3 = $.only_child(span_1, true);

			$.reset(div_9);

			var node_1 = $.sibling(div_9, 2);

			{
				var consequent = ($$anchor) => {
					var div_10 = root();
					var span_2 = $.sibling($.child(div_10), 2);
					var text_4 = $.only_child(span_2, true);

					$.reset(div_10);
					$.template_effect(() => $.set_text(text_4, result.summary.failedGenerations));
					$.append($$anchor, div_10);
				};

				$.if(node_1, ($$render) => {
					if (result.summary.failedGenerations > 0) $$render(consequent);
				});
			}

			$.reset(div_7);
			$.reset(div_6);

			var node_2 = $.sibling(div_6, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_11 = root_2();
					var ul = $.sibling($.child(div_11), 2);

					$.each(ul, 21, () => result.errors, $.index, ($$anchor, error) => {
						var li = root_1();
						var text_5 = $.only_child(li, true);

						$.template_effect(() => $.set_text(text_5, $.get(error)));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				$.if(node_2, ($$render) => {
					if (result.errors.length > 0) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_12 = root_5();
					var node_4 = $.sibling($.child(div_12), 2);

					$.each(node_4, 19, () => result.generations, (generation) => generation.globalID, ($$anchor, generation, i) => {
						var fragment = $.comment();
						var node_5 = $.first_child(fragment);

						{
							var consequent_2 = ($$anchor) => {
								var div_13 = root_3();
								var div_14 = $.child(div_13);
								var h4 = $.child(div_14);
								var text_6 = $.only_child(h4);
								var button_1 = $.sibling(h4, 2);

								$.reset(div_14);

								var div_15 = $.sibling(div_14, 2);
								var div_16 = $.child(div_15);
								var code = $.sibling($.child(div_16), 2);
								var text_7 = $.only_child(code, true);

								$.reset(div_16);

								var div_17 = $.sibling(div_16, 2);
								var code_1 = $.sibling($.child(div_17), 2);
								var text_8 = $.only_child(code_1);

								$.reset(div_17);
								$.reset(div_15);

								var div_18 = $.sibling(div_15, 2);
								var div_19 = $.sibling($.child(div_18), 2);
								var div_20 = $.child(div_19);
								var code_2 = $.sibling($.child(div_20), 2);
								var text_9 = $.only_child(code_2, true);
								var small = $.sibling(code_2, 2);
								var text_10 = $.only_child(small, true);

								$.reset(div_20);

								var div_21 = $.sibling(div_20, 2);
								var code_3 = $.sibling($.child(div_21), 2);
								var text_11 = $.only_child(code_3, true);
								var small_1 = $.sibling(code_3, 2);
								var text_12 = $.only_child(small_1, true);

								$.reset(div_21);

								var div_22 = $.sibling(div_21, 2);
								var code_4 = $.sibling($.child(div_22), 2);
								var text_13 = $.only_child(code_4, true);
								var small_2 = $.sibling(code_4, 2);
								var text_14 = $.only_child(small_2, true);

								$.reset(div_22);
								$.reset(div_19);
								$.reset(div_18);

								var div_23 = $.sibling(div_18, 2);
								var div_24 = $.sibling($.child(div_23), 2);
								var div_25 = $.child(div_24);
								var span_3 = $.sibling($.child(div_25), 2);
								var text_15 = $.only_child(span_3, true);

								$.reset(div_25);

								var div_26 = $.sibling(div_25, 2);
								var span_4 = $.sibling($.child(div_26), 2);
								var text_16 = $.only_child(span_4, true);

								$.reset(div_26);

								var div_27 = $.sibling(div_26, 2);
								var code_5 = $.sibling($.child(div_27), 2);
								var text_17 = $.only_child(code_5, true);

								$.reset(div_27);
								$.reset(div_24);
								$.reset(div_23);
								$.reset(div_13);

								$.template_effect(
									($0) => {
										$.set_text(text_6, `ULA #${$.get(i) + 1}`);
										$.set_text(text_7, $.get(generation).network);
										$.set_text(text_8, `${$.get(generation).fullPrefix ?? ''}::/64`);
										$.set_text(text_9, $.get(generation).prefix);
										$.set_text(text_10, $.get(generation).details.prefixBinary);
										$.set_text(text_11, $.get(generation).globalID);
										$.set_text(text_12, $.get(generation).details.globalIDBinary);
										$.set_text(text_13, $.get(generation).subnetID);
										$.set_text(text_14, $.get(generation).details.subnetIDBinary);
										$.set_text(text_15, $.get(generation).details.algorithm);
										$.set_text(text_16, $0);
										$.set_text(text_17, $.get(generation).details.entropy);
									},
									[
										() => new Date($.get(generation).details.timestamp).toISOString()
									]
								);

								$.event('click', button_1, () => copyToClipboard($.get(generation).network));
								$.append($$anchor, div_13);
							};

							var alternate = ($$anchor) => {
								var div_28 = root_4();
								var h4_1 = $.child(div_28);
								var text_18 = $.only_child(h4_1);
								var p = $.sibling(h4_1, 2);
								var text_19 = $.only_child(p, true);

								$.reset(div_28);

								$.template_effect(() => {
									$.set_text(text_18, `ULA #${$.get(i) + 1} - Error`);
									$.set_text(text_19, $.get(generation).error);
								});

								$.append($$anchor, div_28);
							};

							$.if(node_5, ($$render) => {
								if ($.get(generation).isValid) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment);
					});

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				var d = $.derived(() => result.generations.some((g) => g.isValid));

				$.if(node_3, ($$render) => {
					if ($.get(d)) $$render(consequent_3);
				});
			}

			$.reset(div_5);

			$.template_effect(() => {
				$.set_text(text_2, result.summary.totalRequests);
				$.set_text(text_3, result.summary.successfulGenerations);
			});

			$.append($$anchor, div_5);
		};

		$.if(node, ($$render) => {
			if (result) $$render(consequent_4);
		});
	}

	$.reset(div_1);

	var div_29 = $.sibling(div_1, 2);
	var div_30 = $.sibling($.child(div_29), 4);
	var input_1 = $.sibling($.child(div_30), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_30);

	var node_6 = $.sibling(div_30, 2);

	{
		var consequent_7 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_7 = $.first_child(fragment_1);

			{
				var consequent_6 = ($$anchor) => {
					var div_31 = root_8();
					var div_32 = $.sibling($.child(div_31), 2);
					var div_33 = $.child(div_32);
					var code_6 = $.sibling($.child(div_33), 2);
					var text_20 = $.only_child(code_6, true);

					$.reset(div_33);

					var div_34 = $.sibling(div_33, 2);
					var code_7 = $.sibling($.child(div_34), 2);
					var text_21 = $.only_child(code_7, true);

					$.reset(div_34);

					var div_35 = $.sibling(div_34, 2);
					var code_8 = $.sibling($.child(div_35), 2);
					var text_22 = $.only_child(code_8, true);

					$.reset(div_35);

					var node_8 = $.sibling(div_35, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_36 = root_7();
							var code_9 = $.sibling($.child(div_36), 2);
							var text_23 = $.only_child(code_9, true);

							$.reset(div_36);
							$.template_effect(() => $.set_text(text_23, parseResult.interfaceID));
							$.append($$anchor, div_36);
						};

						$.if(node_8, ($$render) => {
							if (parseResult.interfaceID) $$render(consequent_5);
						});
					}

					$.reset(div_32);
					$.reset(div_31);

					$.template_effect(() => {
						$.set_text(text_20, parseResult.prefix);
						$.set_text(text_21, parseResult.globalID);
						$.set_text(text_22, parseResult.subnetID);
					});

					$.append($$anchor, div_31);
				};

				var alternate_1 = ($$anchor) => {
					var div_37 = root_9();
					var p_1 = $.child(div_37);
					var text_24 = $.only_child(p_1, true);

					$.reset(div_37);
					$.template_effect(() => $.set_text(text_24, parseResult.error));
					$.append($$anchor, div_37);
				};

				$.if(node_7, ($$render) => {
					if (parseResult.isValid) $$render(consequent_6); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_6, ($$render) => {
			if (parseResult) $$render(consequent_7);
		});
	}

	$.reset(div_29);
	$.reset(div);

	$.template_effect(() => {
		button.disabled = loading || count < 1 || count > 100;
		$.set_text(text_1, loading ? 'Generating...' : 'Generate ULA Addresses');
	});

	$.bind_value(input, () => count, ($$value) => count = $$value);
	$.bind_value(textarea, () => subnetIds, ($$value) => subnetIds = $$value);
	$.event('click', button, generateULAs);
	$.bind_value(input_1, () => parseInput, ($$value) => parseInput = $$value);
	$.event('input', input_1, parseULAAddress);
	$.append($$anchor, div);
	$.pop();
}