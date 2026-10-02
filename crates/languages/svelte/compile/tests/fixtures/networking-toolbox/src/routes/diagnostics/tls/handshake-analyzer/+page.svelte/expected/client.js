import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { tlsHandshakeContent } from '$lib/content/tls-handshake';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Analyzing...`, 1);
var root_1 = $.from_html(`<!> Analyze`, 1);
var root_2 = $.from_html(`<div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">ALPN Protocol</span> <span class="info-value svelte-180351m"> </span></div></div>`);
var root_3 = $.from_html(`<div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">SANs</span> <span class="info-value svelte-180351m"> </span></div></div>`);
var root_4 = $.from_html(`<div class="result-card svelte-180351m"><h4 class="svelte-180351m">Certificate Information</h4> <div class="info-list svelte-180351m"><div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Subject</span> <span class="info-value svelte-180351m"> </span></div></div> <div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Issuer</span> <span class="info-value svelte-180351m"> </span></div></div> <div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Valid</span> <span class="info-value cert-date svelte-180351m"> </span></div></div> <!></div></div>`);
var root_5 = $.from_html(`<span class="detail-badge svelte-180351m"> </span>`);
var root_6 = $.from_html(`<div class="phase-details svelte-180351m"></div>`);
var root_7 = $.from_html(`<div class="timeline-item svelte-180351m"><div class="timeline-marker svelte-180351m"></div> <div class="timeline-content svelte-180351m"><div class="timeline-header svelte-180351m"><span class="phase-name svelte-180351m"> </span> <span class="phase-duration svelte-180351m"> </span></div> <div class="phase-timestamp svelte-180351m"> </div> <!></div></div>`);
var root_8 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="results-grid svelte-180351m"><div class="result-card svelte-180351m"><h4 class="svelte-180351m">Connection Summary</h4> <div class="info-list svelte-180351m"><div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Total Time</span> <span class="info-value highlight svelte-180351m"> </span></div></div> <div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">TLS Version</span> <span class="info-value svelte-180351m"> </span></div></div> <div class="info-item svelte-180351m"><!> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Cipher Suite</span> <span class="info-value cipher svelte-180351m"> </span></div></div> <!></div></div> <!> <div class="result-card timeline-card svelte-180351m"><h4 class="svelte-180351m">Handshake Timeline</h4> <div class="timeline svelte-180351m"></div></div></div></div></div>`);
var root_9 = $.from_html(`<li><strong> </strong> </li>`);
var root_10 = $.from_html(`<li class="svelte-180351m"> </li>`);
var root_11 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <!> <div class="card input-card"><div class="card-header"><h3>Handshake Analysis</h3></div> <div class="card-content"><div class="lookup-form svelte-180351m"><div class="input-row svelte-180351m"><label for="hostname" class="svelte-180351m">Hostname</label> <input id="hostname" type="text" placeholder="google.com" class="svelte-180351m"/></div> <div class="port-row svelte-180351m"><label for="port" class="svelte-180351m">Port</label> <input id="port" type="number" placeholder="443" min="1" max="65535" class="svelte-180351m"/></div> <button class="lookup-btn svelte-180351m"><!></button></div></div></div> <!> <!> <div class="card info-card svelte-180351m"><div class="card-header"><h3>About TLS Handshakes</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4> </h4> <p> </p></div> <div class="info-section"><h4> </h4> <ul></ul></div> <div class="info-section"><h4> </h4> <ul></ul></div> <div class="info-section"><h4> </h4> <ul></ul></div></div> <div class="quick-tips svelte-180351m"><h4 class="svelte-180351m">Quick Tips</h4> <ul class="svelte-180351m"></ul></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let hostname = $.state('google.com');
	let port = $.state(443);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{ hostname: 'as93.net', port: 443, description: 'Alicia Sykes' },
		{
			hostname: 'apple.com',
			port: 443,
			description: 'Apple (Fast - 28ms)'
		},

		{
			hostname: 'cloudflare.com',
			port: 443,
			description: 'Cloudflare'
		},

		{
			hostname: 'amazon.com',
			port: 443,
			description: 'Amazon (High latency)'
		},

		{
			hostname: 'baidu.com',
			port: 443,
			description: 'Baidu (China - TLS 1.2)'
		},
		{ hostname: 'zoom.us', port: 443, description: 'Zoom' }
	];

	const examples = useExamples(examplesList);

	async function analyzeHandshake() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls-handshake', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ hostname: $.get(hostname).trim(), port: $.get(port) })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `Analysis failed: ${response.status}`);
			}

			diagnosticState.setResults(await response.json());
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(hostname, example.hostname, true);
		$.set(port, example.port, true);
		examples.select(index);
		analyzeHandshake();
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `TLS Handshake Analysis for ${diagnosticState.results.hostname}:${diagnosticState.results.port}\n`;

		text += `Generated at: ${diagnosticState.results.timestamp}\n\n`;
		text += `Total Time: ${diagnosticState.results.totalTime}ms\n`;
		text += `TLS Version: ${diagnosticState.results.tlsVersion}\n`;
		text += `Cipher Suite: ${diagnosticState.results.cipherSuite}\n`;

		if (diagnosticState.results.alpnProtocol) text += `ALPN Protocol: ${diagnosticState.results.alpnProtocol}\n`;

		text += `\nHandshake Phases:\n`;

		diagnosticState.results.phases.forEach((phase) => {
			text += `  ${phase.phase}: ${phase.duration}ms (at ${phase.timestamp}ms)\n`;
		});

		if (diagnosticState.results.certificateInfo) {
			text += `\nCertificate:\n`;
			text += `  Subject: ${diagnosticState.results.certificateInfo.subject}\n`;
			text += `  Issuer: ${diagnosticState.results.certificateInfo.issuer}\n`;
			text += `  Valid From: ${diagnosticState.results.certificateInfo.validFrom}\n`;
			text += `  Valid To: ${diagnosticState.results.certificateInfo.validTo}\n`;
		}

		clipboard.copy(text);
	}

	var div = root_11();
	var header = $.child(div);
	var h1 = $.child(header);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var node = $.sibling(header, 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Example Hosts',
		getLabel: (ex) => ex.hostname,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Analyze ${ex.hostname}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var input = $.sibling($.child(div_4), 2);

	$.remove_input_defaults(input);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var input_1 = $.sibling($.child(div_5), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_5);

	var button = $.sibling(div_5, 2);
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

			Icon(node_3, { name: 'activity', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_6 = root_8();
			var div_7 = $.child(div_6);
			var h3 = $.child(div_7);
			var text_3 = $.only_child(h3);
			var button_1 = $.sibling(h3, 2);
			var node_5 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_4 = $.sibling(node_5);

			$.reset(button_1);
			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var div_11 = $.sibling($.child(div_10), 2);
			var div_12 = $.child(div_11);
			var node_6 = $.child(div_12);

			Icon(node_6, { name: 'clock', size: 'sm' });

			var div_13 = $.sibling(node_6, 2);
			var span = $.sibling($.child(div_13), 2);
			var text_5 = $.only_child(span);

			$.reset(div_13);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);
			var node_7 = $.child(div_14);

			Icon(node_7, { name: 'shield', size: 'sm' });

			var div_15 = $.sibling(node_7, 2);
			var span_1 = $.sibling($.child(div_15), 2);
			var text_6 = $.only_child(span_1, true);

			$.reset(div_15);
			$.reset(div_14);

			var div_16 = $.sibling(div_14, 2);
			var node_8 = $.child(div_16);

			Icon(node_8, { name: 'key', size: 'sm' });

			var div_17 = $.sibling(node_8, 2);
			var span_2 = $.sibling($.child(div_17), 2);
			var text_7 = $.only_child(span_2, true);

			$.reset(div_17);
			$.reset(div_16);

			var node_9 = $.sibling(div_16, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_18 = root_2();
					var node_10 = $.child(div_18);

					Icon(node_10, { name: 'layers', size: 'sm' });

					var div_19 = $.sibling(node_10, 2);
					var span_3 = $.sibling($.child(div_19), 2);
					var text_8 = $.only_child(span_3, true);

					$.reset(div_19);
					$.reset(div_18);
					$.template_effect(() => $.set_text(text_8, diagnosticState.results.alpnProtocol));
					$.append($$anchor, div_18);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results.alpnProtocol) $$render(consequent_1);
				});
			}

			$.reset(div_11);
			$.reset(div_10);

			var node_11 = $.sibling(div_10, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_20 = root_4();
					var div_21 = $.sibling($.child(div_20), 2);
					var div_22 = $.child(div_21);
					var node_12 = $.child(div_22);

					Icon(node_12, { name: 'file', size: 'sm' });

					var div_23 = $.sibling(node_12, 2);
					var span_4 = $.sibling($.child(div_23), 2);
					var text_9 = $.only_child(span_4, true);

					$.reset(div_23);
					$.reset(div_22);

					var div_24 = $.sibling(div_22, 2);
					var node_13 = $.child(div_24);

					Icon(node_13, { name: 'building', size: 'sm' });

					var div_25 = $.sibling(node_13, 2);
					var span_5 = $.sibling($.child(div_25), 2);
					var text_10 = $.only_child(span_5, true);

					$.reset(div_25);
					$.reset(div_24);

					var div_26 = $.sibling(div_24, 2);
					var node_14 = $.child(div_26);

					Icon(node_14, { name: 'calendar', size: 'sm' });

					var div_27 = $.sibling(node_14, 2);
					var span_6 = $.sibling($.child(div_27), 2);
					var text_11 = $.only_child(span_6);

					$.reset(div_27);
					$.reset(div_26);

					var node_15 = $.sibling(div_26, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_28 = root_3();
							var node_16 = $.child(div_28);

							Icon(node_16, { name: 'globe', size: 'sm' });

							var div_29 = $.sibling(node_16, 2);
							var span_7 = $.sibling($.child(div_29), 2);
							var text_12 = $.only_child(span_7);

							$.reset(div_29);
							$.reset(div_28);
							$.template_effect(() => $.set_text(text_12, `${diagnosticState.results.certificateInfo.san.length ?? ''} domains`));
							$.append($$anchor, div_28);
						};

						$.if(node_15, ($$render) => {
							if (diagnosticState.results.certificateInfo.san) $$render(consequent_2);
						});
					}

					$.reset(div_21);
					$.reset(div_20);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_9, diagnosticState.results.certificateInfo.subject);
							$.set_text(text_10, diagnosticState.results.certificateInfo.issuer);

							$.set_text(text_11, `${$0 ?? ''} →
                      ${$1 ?? ''}`);
						},
						[
							() => new Date(diagnosticState.results.certificateInfo.validFrom).toLocaleDateString(),
							() => new Date(diagnosticState.results.certificateInfo.validTo).toLocaleDateString()
						]
					);

					$.append($$anchor, div_20);
				};

				$.if(node_11, ($$render) => {
					if (diagnosticState.results.certificateInfo) $$render(consequent_3);
				});
			}

			var div_30 = $.sibling(node_11, 2);
			var div_31 = $.sibling($.child(div_30), 2);

			$.each(div_31, 21, () => diagnosticState.results.phases, (phase) => phase.phase, ($$anchor, phase) => {
				var div_32 = root_7();
				var div_33 = $.sibling($.child(div_32), 2);
				var div_34 = $.child(div_33);
				var span_8 = $.child(div_34);
				var text_13 = $.only_child(span_8, true);
				var span_9 = $.sibling(span_8, 2);
				var text_14 = $.only_child(span_9);

				$.reset(div_34);

				var div_35 = $.sibling(div_34, 2);
				var text_15 = $.only_child(div_35);
				var node_17 = $.sibling(div_35, 2);

				{
					var consequent_4 = ($$anchor) => {
						var div_36 = root_6();

						$.each(div_36, 21, () => Object.entries($.get(phase).details), ([key, value]) => key, ($$anchor, $$item) => {
							var $$array = $.derived(() => $.to_array($.get($$item), 2));
							let key = () => $.get($$array)[0];
							let value = () => $.get($$array)[1];
							var span_10 = root_5();
							var text_16 = $.only_child(span_10);

							$.template_effect(() => $.set_text(text_16, `${key() ?? ''}: ${value() ?? ''}`));
							$.append($$anchor, span_10);
						});

						$.reset(div_36);
						$.append($$anchor, div_36);
					};

					var d = $.derived(() => $.get(phase).details && Object.keys($.get(phase).details).length > 0);

					$.if(node_17, ($$render) => {
						if ($.get(d)) $$render(consequent_4);
					});
				}

				$.reset(div_33);
				$.reset(div_32);

				$.template_effect(() => {
					$.set_text(text_13, $.get(phase).phase);
					$.set_text(text_14, `${$.get(phase).duration ?? ''}ms`);
					$.set_text(text_15, `at ${$.get(phase).timestamp ?? ''}ms`);
				});

				$.append($$anchor, div_32);
			});

			$.reset(div_31);
			$.reset(div_30);
			$.reset(div_9);
			$.reset(div_8);
			$.reset(div_6);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_3, `Handshake Results for ${diagnosticState.results.hostname ?? ''}:${diagnosticState.results.port ?? ''}`);
					button_1.disabled = $0;
					$.set_text(text_4, ` ${$1 ?? ''}`);
					$.set_text(text_5, `${diagnosticState.results.totalTime ?? ''}ms`);
					$.set_text(text_6, diagnosticState.results.tlsVersion);
					$.set_text(text_7, diagnosticState.results.cipherSuite);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, div_6);
		};

		$.if(node_4, ($$render) => {
			if (diagnosticState.results) $$render(consequent_5);
		});
	}

	var node_18 = $.sibling(node_4, 2);

	ErrorCard(node_18, {
		title: 'Analysis Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var div_37 = $.sibling(node_18, 2);
	var div_38 = $.sibling($.child(div_37), 2);
	var div_39 = $.child(div_38);
	var div_40 = $.child(div_39);
	var h4 = $.child(div_40);
	var text_17 = $.only_child(h4, true);
	var p_1 = $.sibling(h4, 2);
	var text_18 = $.only_child(p_1, true);

	$.reset(div_40);

	var div_41 = $.sibling(div_40, 2);
	var h4_1 = $.child(div_41);
	var text_19 = $.only_child(h4_1, true);
	var ul = $.sibling(h4_1, 2);

	$.each(ul, 21, () => tlsHandshakeContent.sections.tlsVersions.versions, (version) => version.version, ($$anchor, version) => {
		var li = root_9();
		var strong = $.child(li);
		var text_20 = $.only_child(strong);
		var text_21 = $.sibling(strong);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text_20, `${$.get(version).version ?? ''} (${$.get(version).status ?? ''}):`);
			$.set_text(text_21, ` ${$.get(version).description ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var h4_2 = $.child(div_42);
	var text_22 = $.only_child(h4_2, true);
	var ul_1 = $.sibling(h4_2, 2);

	$.each(ul_1, 21, () => tlsHandshakeContent.sections.performanceFactors.factors, (factor) => factor.factor, ($$anchor, factor) => {
		var li_1 = root_9();
		var strong_1 = $.child(li_1);
		var text_23 = $.only_child(strong_1);
		var text_24 = $.sibling(strong_1);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_23, `${$.get(factor).factor ?? ''}:`);
			$.set_text(text_24, ` ${$.get(factor).description ?? ''}`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_42);

	var div_43 = $.sibling(div_42, 2);
	var h4_3 = $.child(div_43);
	var text_25 = $.only_child(h4_3, true);
	var ul_2 = $.sibling(h4_3, 2);

	$.each(ul_2, 21, () => tlsHandshakeContent.sections.optimization.techniques.slice(0, 3), (technique) => technique.technique, ($$anchor, technique) => {
		var li_2 = root_9();
		var strong_2 = $.child(li_2);
		var text_26 = $.only_child(strong_2);
		var text_27 = $.sibling(strong_2);

		$.reset(li_2);

		$.template_effect(() => {
			$.set_text(text_26, `${$.get(technique).technique ?? ''}:`);
			$.set_text(text_27, ` ${$.get(technique).benefit ?? ''}`);
		});

		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_43);
	$.reset(div_39);

	var div_44 = $.sibling(div_39, 2);
	var ul_3 = $.sibling($.child(div_44), 2);

	$.each(ul_3, 21, () => tlsHandshakeContent.quickTips, $.index, ($$anchor, tip) => {
		var li_3 = root_10();
		var text_28 = $.only_child(li_3, true);

		$.template_effect(() => $.set_text(text_28, $.get(tip)));
		$.append($$anchor, li_3);
	});

	$.reset(ul_3);
	$.reset(div_44);
	$.reset(div_38);
	$.reset(div_37);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text_1, tlsHandshakeContent.title);
			$.set_text(text_2, tlsHandshakeContent.description);
			button.disabled = $0;
			$.set_text(text_17, tlsHandshakeContent.sections.whatIsHandshake.title);
			$.set_text(text_18, tlsHandshakeContent.sections.whatIsHandshake.content);
			$.set_text(text_19, tlsHandshakeContent.sections.tlsVersions.title);
			$.set_text(text_22, tlsHandshakeContent.sections.performanceFactors.title);
			$.set_text(text_25, tlsHandshakeContent.sections.optimization.title);
		},
		[() => diagnosticState.loading || !$.get(hostname).trim()]
	);

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(hostname).trim()) analyzeHandshake();
	});

	$.bind_value(input, () => $.get(hostname), ($$value) => $.set(hostname, $$value));
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.delegated('click', button, analyzeHandshake);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);