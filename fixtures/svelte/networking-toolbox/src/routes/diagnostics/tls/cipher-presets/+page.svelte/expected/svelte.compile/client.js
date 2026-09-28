import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Testing...`, 1);
var root_1 = $.from_html(`<!> Test`, 1);
var root_2 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Testing Cipher Presets</h3> <p>Testing modern, intermediate, and legacy cipher suites...</p></div></div></div></div>`);
var root_3 = $.from_html(`<span> </span>`);
var root_4 = $.from_html(`<div class="protocols-section svelte-1wqq1vu"><span class="protocols-label svelte-1wqq1vu">Protocols:</span> <div class="protocols-list svelte-1wqq1vu"></div></div>`);
var root_5 = $.from_html(`<div class="cipher-item supported svelte-1wqq1vu"><!> <span class="cipher-name svelte-1wqq1vu"> </span></div>`);
var root_6 = $.from_html(`<details class="ciphers-details svelte-1wqq1vu"><summary class="svelte-1wqq1vu"> </summary> <div class="cipher-list svelte-1wqq1vu"></div></details>`);
var root_7 = $.from_html(`<div class="cipher-item unsupported svelte-1wqq1vu"><!> <span class="cipher-name svelte-1wqq1vu"> </span></div>`);
var root_8 = $.from_html(`<div><!> </div>`);
var root_9 = $.from_html(`<div><div class="preset-header svelte-1wqq1vu"><div class="preset-title svelte-1wqq1vu"><h3 class="svelte-1wqq1vu"> </h3> <span class="preset-level svelte-1wqq1vu"> </span></div> <div> </div></div> <div class="preset-description svelte-1wqq1vu"> </div> <div class="preset-stats svelte-1wqq1vu"><div class="stat svelte-1wqq1vu"><span class="stat-label svelte-1wqq1vu">Supported:</span> <span class="stat-value svelte-1wqq1vu"> </span></div> <div class="stat svelte-1wqq1vu"><span class="stat-label svelte-1wqq1vu">Coverage:</span> <span class="stat-value svelte-1wqq1vu"> </span></div></div> <div class="preset-progress svelte-1wqq1vu"><div class="progress-bar svelte-1wqq1vu"><div class="progress-fill svelte-1wqq1vu"></div></div></div> <!> <!> <!> <!></div>`);
var root_10 = $.from_html(`<li class="svelte-1wqq1vu"> </li>`);
var root_11 = $.from_html(`<div class="recommendations svelte-1wqq1vu"><h4 class="svelte-1wqq1vu">Recommendations</h4> <ul class="svelte-1wqq1vu"></ul></div>`);
var root_12 = $.from_html(`<div class="summary-section svelte-1wqq1vu"><h3 class="svelte-1wqq1vu">Overall Assessment</h3> <div class="summary-content svelte-1wqq1vu"><div class="summary-score svelte-1wqq1vu"><div> </div> <div class="score-details svelte-1wqq1vu"><h4 class="svelte-1wqq1vu"> </h4> <p class="svelte-1wqq1vu"> </p></div></div> <!></div></div>`);
var root_13 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>Cipher Presets Results</h3></div> <div class="card-content"><div class="results-section"><div class="presets-grid svelte-1wqq1vu"></div> <!></div></div></div>`);
var root_14 = $.from_html(`<div class="card"><header class="card-header"><h1>TLS Cipher Presets</h1> <p>Probe connectivity with preset cipher lists (modern/intermediate/legacy)</p></header> <!> <div class="card input-card"><div class="card-header"><h3>Cipher Presets Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="hostname">Hostname and Port</label> <div class="input-flex-container"><input id="hostname" type="text" placeholder="example.com" class="flex-grow"/> <input id="port" type="text" placeholder="443" class="port-input"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let hostname = $.state('example.com');
	let port = $.state('443');
	const diagnosticState = useDiagnosticState();

	const examplesList = [
		{
			host: 'github.com',
			port: '443',
			description: 'GitHub cipher support'
		},

		{
			host: 'cloudflare.com',
			port: '443',
			description: 'Cloudflare cipher support'
		},

		{
			host: 'google.com',
			port: '443',
			description: 'Google cipher support'
		}
	];

	const examples = useExamples(examplesList);

	async function testCiphers() {
		if (!$.get(hostname)?.trim()) {
			diagnosticState.setError('Please enter a hostname');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'cipher-presets',
					hostname: $.get(hostname).trim().toLowerCase(),
					port: parseInt($.get(port)) || 443
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to test cipher presets');
			}

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'An error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(hostname, example.host, true);
		$.set(port, example.port, true);
		examples.select(index);
		testCiphers();
	}

	function getPresetScore(preset) {
		if (!preset.supported) return 0;

		const total = preset.ciphers.length;
		const supported = preset.supportedCiphers.length;

		return Math.round(supported / total * 100);
	}

	function getPresetGrade(preset) {
		const score = getPresetScore(preset);

		if (!preset.supported) return 'F';
		if (preset.level === 'modern' && score >= 80) return 'A+';
		if (preset.level === 'modern' && score >= 60) return 'A';
		if (preset.level === 'intermediate' && score >= 80) return 'B';
		if (preset.level === 'intermediate' && score >= 60) return 'C';
		if (preset.level === 'legacy') return 'D';

		return 'F';
	}

	var div = root_14();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		getLabel: (ex) => `${ex.host}:${ex.port}`,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Test cipher presets for ${ex.host}:${ex.port}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var input = $.child(div_4);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var button = $.sibling(input_1, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	ErrorCard(node_4, {
		title: 'Cipher Test Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_2();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			Icon(node_6, { name: 'loader', size: 'lg', animate: 'spin' });
			$.next(2);
			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_8 = root_13();
			var div_9 = $.sibling($.child(div_8), 2);
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);

			$.each(div_11, 21, () => diagnosticState.results.presets, (preset) => preset.name, ($$anchor, preset) => {
				var div_12 = root_9();
				let classes;
				var div_13 = $.child(div_12);
				var div_14 = $.child(div_13);
				var h3 = $.child(div_14);
				var text = $.only_child(h3, true);
				var span = $.sibling(h3, 2);
				var text_1 = $.only_child(span, true);

				$.reset(div_14);

				var div_15 = $.sibling(div_14, 2);
				var text_2 = $.only_child(div_15, true);

				$.reset(div_13);

				var div_16 = $.sibling(div_13, 2);
				var text_3 = $.only_child(div_16, true);
				var div_17 = $.sibling(div_16, 2);
				var div_18 = $.child(div_17);
				var span_1 = $.sibling($.child(div_18), 2);
				var text_4 = $.only_child(span_1);

				$.reset(div_18);

				var div_19 = $.sibling(div_18, 2);
				var span_2 = $.sibling($.child(div_19), 2);
				var text_5 = $.only_child(span_2);

				$.reset(div_19);
				$.reset(div_17);

				var div_20 = $.sibling(div_17, 2);
				var div_21 = $.child(div_20);
				var div_22 = $.only_child(div_21);

				$.reset(div_20);

				var node_8 = $.sibling(div_20, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_23 = root_4();
						var div_24 = $.sibling($.child(div_23), 2);

						$.each(div_24, 21, () => $.get(preset).protocols, (protocol) => protocol.name, ($$anchor, protocol) => {
							var span_3 = root_3();
							let classes_1;
							var text_6 = $.only_child(span_3, true);

							$.template_effect(() => {
								classes_1 = $.set_class(span_3, 1, 'protocol-badge svelte-1wqq1vu', null, classes_1, { supported: $.get(protocol).supported });
								$.set_text(text_6, $.get(protocol).name);
							});

							$.append($$anchor, span_3);
						});

						$.reset(div_24);
						$.reset(div_23);
						$.append($$anchor, div_23);
					};

					$.if(node_8, ($$render) => {
						if ($.get(preset).protocols) $$render(consequent_2);
					});
				}

				var node_9 = $.sibling(node_8, 2);

				{
					var consequent_3 = ($$anchor) => {
						var details = root_6();
						var summary = $.child(details);
						var text_7 = $.only_child(summary);
						var div_25 = $.sibling(summary, 2);

						$.each(div_25, 20, () => $.get(preset).supportedCiphers, (cipher) => cipher, ($$anchor, cipher) => {
							var div_26 = root_5();
							var node_10 = $.child(div_26);

							Icon(node_10, { name: 'check-circle' });

							var span_4 = $.sibling(node_10, 2);
							var text_8 = $.only_child(span_4, true);

							$.reset(div_26);
							$.template_effect(() => $.set_text(text_8, cipher));
							$.append($$anchor, div_26);
						});

						$.reset(div_25);
						$.reset(details);
						$.template_effect(() => $.set_text(text_7, `Supported Ciphers (${$.get(preset).supportedCiphers.length ?? ''})`));
						$.append($$anchor, details);
					};

					$.if(node_9, ($$render) => {
						if ($.get(preset).supportedCiphers.length > 0) $$render(consequent_3);
					});
				}

				var node_11 = $.sibling(node_9, 2);

				{
					var consequent_4 = ($$anchor) => {
						var details_1 = root_6();
						var summary_1 = $.child(details_1);
						var text_9 = $.only_child(summary_1);
						var div_27 = $.sibling(summary_1, 2);

						$.each(div_27, 20, () => $.get(preset).unsupportedCiphers, (cipher) => cipher, ($$anchor, cipher) => {
							var div_28 = root_7();
							var node_12 = $.child(div_28);

							Icon(node_12, { name: 'x-circle' });

							var span_5 = $.sibling(node_12, 2);
							var text_10 = $.only_child(span_5, true);

							$.reset(div_28);
							$.template_effect(() => $.set_text(text_10, cipher));
							$.append($$anchor, div_28);
						});

						$.reset(div_27);
						$.reset(details_1);
						$.template_effect(() => $.set_text(text_9, `Unsupported Ciphers (${$.get(preset).unsupportedCiphers.length ?? ''})`));
						$.append($$anchor, details_1);
					};

					$.if(node_11, ($$render) => {
						if ($.get(preset).unsupportedCiphers && $.get(preset).unsupportedCiphers.length > 0) $$render(consequent_4);
					});
				}

				var node_13 = $.sibling(node_11, 2);

				{
					var consequent_5 = ($$anchor) => {
						var div_29 = root_8();
						let classes_2;
						var node_14 = $.child(div_29);

						{
							let $0 = $.derived(() => $.get(preset).level === 'legacy' ? 'alert-triangle' : 'info');

							Icon(node_14, {
								get name() {
									return $.get($0);
								}
							});
						}

						var text_11 = $.sibling(node_14);

						$.reset(div_29);

						$.template_effect(() => {
							classes_2 = $.set_class(div_29, 1, 'recommendation svelte-1wqq1vu', null, classes_2, { warning: $.get(preset).level === 'legacy' });
							$.set_text(text_11, ` ${$.get(preset).recommendation ?? ''}`);
						});

						$.append($$anchor, div_29);
					};

					$.if(node_13, ($$render) => {
						if ($.get(preset).recommendation) $$render(consequent_5);
					});
				}

				$.reset(div_12);

				$.template_effect(
					($0, $1, $2, $3) => {
						classes = $.set_class(div_12, 1, `preset-card ${$.get(preset).level ?? ''}`, 'svelte-1wqq1vu', classes, { supported: $.get(preset).supported });
						$.set_text(text, $.get(preset).name);
						$.set_text(text_1, $.get(preset).level);
						$.set_class(div_15, 1, `preset-grade grade-${$0 ?? ''}`, 'svelte-1wqq1vu');
						$.set_text(text_2, $1);
						$.set_text(text_3, $.get(preset).description);
						$.set_text(text_4, `${$.get(preset).supportedCiphers.length ?? ''}/${$.get(preset).ciphers.length ?? ''}`);
						$.set_text(text_5, `${$2 ?? ''}%`);
						$.set_style(div_22, `width: ${$3 ?? ''}%`);
					},
					[
						() => getPresetGrade($.get(preset)).toLowerCase(),
						() => getPresetGrade($.get(preset)),
						() => getPresetScore($.get(preset)),
						() => getPresetScore($.get(preset))
					]
				);

				$.append($$anchor, div_12);
			});

			$.reset(div_11);

			var node_15 = $.sibling(div_11, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_30 = root_12();
					var div_31 = $.sibling($.child(div_30), 2);
					var div_32 = $.child(div_31);
					var div_33 = $.child(div_32);
					var text_12 = $.only_child(div_33, true);
					var div_34 = $.sibling(div_33, 2);
					var h4 = $.child(div_34);
					var text_13 = $.only_child(h4, true);
					var p = $.sibling(h4, 2);
					var text_14 = $.only_child(p, true);

					$.reset(div_34);
					$.reset(div_32);

					var node_16 = $.sibling(div_32, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_35 = root_11();
							var ul = $.sibling($.child(div_35), 2);

							$.each(ul, 20, () => diagnosticState.results.summary.recommendations, (rec) => rec, ($$anchor, rec) => {
								var li = root_10();
								var text_15 = $.only_child(li, true);

								$.template_effect(() => $.set_text(text_15, rec));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_35);
							$.append($$anchor, div_35);
						};

						$.if(node_16, ($$render) => {
							if (diagnosticState.results.summary.recommendations && diagnosticState.results.summary.recommendations.length > 0) $$render(consequent_6);
						});
					}

					$.reset(div_31);
					$.reset(div_30);

					$.template_effect(
						($0) => {
							$.set_class(div_33, 1, `score-circle grade-${$0 ?? ''}`, 'svelte-1wqq1vu');
							$.set_text(text_12, diagnosticState.results.summary.overallGrade);
							$.set_text(text_13, diagnosticState.results.summary.rating);
							$.set_text(text_14, diagnosticState.results.summary.description);
						},
						[
							() => diagnosticState.results.summary.overallGrade.toLowerCase()
						]
					);

					$.append($$anchor, div_30);
				};

				$.if(node_15, ($$render) => {
					if (diagnosticState.results.summary) $$render(consequent_7);
				});
			}

			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_8);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = diagnosticState.loading;
		input_1.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading;
	});

	$.delegated('change', input, () => examples.clear());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && testCiphers());
	$.bind_value(input, () => $.get(hostname), ($$value) => $.set(hostname, $$value));
	$.delegated('change', input_1, () => examples.clear());
	$.delegated('keydown', input_1, (e) => e.key === 'Enter' && testCiphers());
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.delegated('click', button, testCiphers);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'keydown', 'click']);