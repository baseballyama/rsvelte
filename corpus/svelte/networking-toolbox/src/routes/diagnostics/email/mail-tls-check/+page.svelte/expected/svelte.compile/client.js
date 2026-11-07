import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { mailTLSContent as content } from '$lib/content/mail-tls';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Checking TLS Support</h3> <p> </p></div></div></div></div>`);
var root_1 = $.from_html(`<div class="status-item success"><!> <div><h4>STARTTLS Supported</h4> <p>Server supports upgrading to TLS</p></div></div>`);
var root_2 = $.from_html(`<div class="status-item success"><!> <div><h4>Direct TLS Supported</h4> <p>Server supports implicit TLS</p></div></div>`);
var root_3 = $.from_html(`<div class="status-item error"><!> <div><h4>TLS Not Supported</h4> <p>Server does not support TLS encryption</p></div></div>`);
var root_4 = $.from_html(`<div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">TLS Version</span> <span class="detail-value svelte-1k1ysyv"> </span></div>`);
var root_5 = $.from_html(`<div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Cipher Suite</span> <span class="detail-value mono svelte-1k1ysyv"> </span></div>`);
var root_6 = $.from_html(`<div class="subsection svelte-1k1ysyv"><h4 class="svelte-1k1ysyv"><!> Connection Details</h4> <div class="details-grid svelte-1k1ysyv"><!> <!></div></div>`);
var root_7 = $.from_html(`<span class="badge warning svelte-1k1ysyv"> </span>`);
var root_8 = $.from_html(`<span class="alt-name-tag svelte-1k1ysyv"> </span>`);
var root_9 = $.from_html(`<div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv"> </span> <div class="alt-names svelte-1k1ysyv"></div></div>`);
var root_10 = $.from_html(`<div class="subsection svelte-1k1ysyv"><h4 class="svelte-1k1ysyv"><!> Certificate Information</h4> <div class="details-grid svelte-1k1ysyv"><div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Common Name</span> <span class="detail-value svelte-1k1ysyv"> </span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Issuer</span> <span class="detail-value svelte-1k1ysyv"> </span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Valid From</span> <span class="detail-value svelte-1k1ysyv"> </span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Valid To</span> <span> <!></span></div> <div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Serial Number</span> <span class="detail-value mono svelte-1k1ysyv"> </span></div> <div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Fingerprint</span> <span class="detail-value mono svelte-1k1ysyv"> </span></div> <!></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header"><h3> </h3></div> <div class="card-content"><div class="status-overview"><!> <!> <!></div> <!> <!></div></div>`);
var root_12 = $.from_html(`<div class="port-item svelte-1k1ysyv"><div class="port-number svelte-1k1ysyv"> </div> <div class="port-details svelte-1k1ysyv"><strong class="svelte-1k1ysyv"> </strong> <p class="svelte-1k1ysyv"> </p> <span class="security-badge svelte-1k1ysyv"> </span></div></div>`);
var root_13 = $.from_html(`<em class="example-text svelte-1k1ysyv"> </em>`);
var root_14 = $.from_html(`<li class="svelte-1k1ysyv"><strong> </strong> <!></li>`);
var root_15 = $.from_html(`<details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv"><!> <h4 class="svelte-1k1ysyv"> </h4></summary> <div class="accordion-content svelte-1k1ysyv"><ul class="svelte-1k1ysyv"></ul></div></details>`);
var root_16 = $.from_html(`<li class="svelte-1k1ysyv"> </li>`);
var root_17 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <div class="card input-card"><div class="card-header"><h3>Check Mail Server TLS</h3></div> <div class="card-content"><div class="lookup-form svelte-1k1ysyv"><input type="text" placeholder="mail.example.com" class="svelte-1k1ysyv"/> <input type="number" min="1" max="65535" placeholder="Port" class="port-input svelte-1k1ysyv"/> <button class="lookup-btn svelte-1k1ysyv"><!> </button></div></div></div> <!> <!> <!> <!> <div class="card info-card svelte-1k1ysyv"><div class="card-header"><h3>About SMTP TLS</h3></div> <div class="card-content"><details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv"><!> <h4 class="svelte-1k1ysyv"> </h4></summary> <div class="accordion-content svelte-1k1ysyv"><p class="svelte-1k1ysyv"> </p></div></details> <details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv"><!> <h4 class="svelte-1k1ysyv"> </h4></summary> <div class="accordion-content svelte-1k1ysyv"><div class="port-list svelte-1k1ysyv"></div></div></details> <!> <details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv"><!> <h4 class="svelte-1k1ysyv">Quick Tips</h4></summary> <div class="accordion-content svelte-1k1ysyv"><ul class="svelte-1k1ysyv"></ul></div></details></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const examplesList = [
		{ domain: 'gmail.com', port: 587, desc: 'Google Mail STARTTLS' },
		{
			domain: 'outlook.com',
			port: 587,
			desc: 'Microsoft Outlook STARTTLS'
		},

		{
			domain: 'smtp.gmail.com',
			port: 465,
			desc: 'Gmail Direct TLS'
		}
	];

	let domain = $.state('');
	let port = $.state(587);
	const diagnosticState = useDiagnosticState();
	const examples = useExamples(examplesList);

	async function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(port, example.port, true);
		examples.select(index);
		await checkTLS();
	}

	async function checkTLS() {
		if (!$.get(domain).trim()) {
			diagnosticState.setError('Please enter a domain name');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/mail-tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ domain: $.get(domain).trim(), port: $.get(port) })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || 'TLS check failed');
			}

			const data = await response.json();

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	var div = root_17();
	var header = $.child(div);
	var h1 = $.child(header);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var button = $.sibling(input_1, 2);
	var node = $.child(button);

	{
		let $0 = $.derived(() => diagnosticState.loading ? 'loader' : 'lock');
		let $1 = $.derived(() => diagnosticState.loading ? 'spin' : undefined);

		Icon(node, {
			get name() {
				return $.get($0);
			},
			size: 'sm',
			get animate() {
				return $.get($1);
			}
		});
	}

	var text_2 = $.sibling(node);

	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	ExamplesCard(node_1, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Quick Examples',
		getLabel: (ex) => `${ex.domain}:${ex.port}`,
		getDescription: (ex) => ex.desc,
		getTooltip: (ex) => `Check TLS for ${ex.domain} on port ${ex.port}`
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);
			var node_3 = $.child(div_6);

			Icon(node_3, { name: 'loader', size: 'lg', animate: 'spin' });

			var div_7 = $.sibling(node_3, 2);
			var p_1 = $.sibling($.child(div_7), 2);
			var text_3 = $.only_child(p_1);

			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_4);
			$.template_effect(() => $.set_text(text_3, `Testing connection to ${$.get(domain) ?? ''}:${$.get(port) ?? ''}...`));
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if (diagnosticState.loading) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	ErrorCard(node_4, {
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_8 = root_11();
			var div_9 = $.child(div_8);
			var h3 = $.child(div_9);
			var text_4 = $.only_child(h3);

			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var div_11 = $.child(div_10);
			var node_6 = $.child(div_11);

			{
				var consequent_1 = ($$anchor) => {
					var div_12 = root_1();
					var node_7 = $.child(div_12);

					Icon(node_7, { name: 'check-circle', size: 'md' });
					$.next(2);
					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				$.if(node_6, ($$render) => {
					if (diagnosticState.results.supportsSTARTTLS) $$render(consequent_1);
				});
			}

			var node_8 = $.sibling(node_6, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_13 = root_2();
					var node_9 = $.child(div_13);

					Icon(node_9, { name: 'lock', size: 'md' });
					$.next(2);
					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.supportsDirectTLS) $$render(consequent_2);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_14 = root_3();
					var node_11 = $.child(div_14);

					Icon(node_11, { name: 'x-circle', size: 'md' });
					$.next(2);
					$.reset(div_14);
					$.append($$anchor, div_14);
				};

				$.if(node_10, ($$render) => {
					if (!diagnosticState.results.supportsSTARTTLS && !diagnosticState.results.supportsDirectTLS) $$render(consequent_3);
				});
			}

			$.reset(div_11);

			var node_12 = $.sibling(div_11, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_15 = root_6();
					var h4 = $.child(div_15);
					var node_13 = $.child(h4);

					Icon(node_13, { name: 'shield', size: 'sm' });
					$.next();
					$.reset(h4);

					var div_16 = $.sibling(h4, 2);
					var node_14 = $.child(div_16);

					{
						var consequent_4 = ($$anchor) => {
							var div_17 = root_4();
							var span = $.sibling($.child(div_17), 2);
							var text_5 = $.only_child(span, true);

							$.reset(div_17);
							$.template_effect(() => $.set_text(text_5, diagnosticState.results.tlsVersion));
							$.append($$anchor, div_17);
						};

						$.if(node_14, ($$render) => {
							if (diagnosticState.results.tlsVersion) $$render(consequent_4);
						});
					}

					var node_15 = $.sibling(node_14, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_18 = root_5();
							var span_1 = $.sibling($.child(div_18), 2);
							var text_6 = $.only_child(span_1, true);

							$.reset(div_18);
							$.template_effect(() => $.set_text(text_6, diagnosticState.results.cipherSuite));
							$.append($$anchor, div_18);
						};

						$.if(node_15, ($$render) => {
							if (diagnosticState.results.cipherSuite) $$render(consequent_5);
						});
					}

					$.reset(div_16);
					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				$.if(node_12, ($$render) => {
					if (diagnosticState.results.tlsVersion || diagnosticState.results.cipherSuite) $$render(consequent_6);
				});
			}

			var node_16 = $.sibling(node_12, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_19 = root_10();
					var h4_1 = $.child(div_19);
					var node_17 = $.child(h4_1);

					Icon(node_17, { name: 'award', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_20 = $.sibling(h4_1, 2);
					var div_21 = $.child(div_20);
					var span_2 = $.sibling($.child(div_21), 2);
					var text_7 = $.only_child(span_2, true);

					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var span_3 = $.sibling($.child(div_22), 2);
					var text_8 = $.only_child(span_3, true);

					$.reset(div_22);

					var div_23 = $.sibling(div_22, 2);
					var span_4 = $.sibling($.child(div_23), 2);
					var text_9 = $.only_child(span_4, true);

					$.reset(div_23);

					var div_24 = $.sibling(div_23, 2);
					var span_5 = $.sibling($.child(div_24), 2);
					var text_10 = $.child(span_5);
					var node_18 = $.sibling(text_10);

					{
						var consequent_7 = ($$anchor) => {
							var span_6 = root_7();
							var text_11 = $.only_child(span_6);

							$.template_effect(() => $.set_text(text_11, `Expires in ${diagnosticState.results.certificate.daysUntilExpiry ?? ''} days`));
							$.append($$anchor, span_6);
						};

						$.if(node_18, ($$render) => {
							if (diagnosticState.results.certificate.daysUntilExpiry < 30) $$render(consequent_7);
						});
					}

					$.reset(span_5);
					$.reset(div_24);

					var div_25 = $.sibling(div_24, 2);
					var span_7 = $.sibling($.child(div_25), 2);
					var text_12 = $.only_child(span_7, true);

					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var span_8 = $.sibling($.child(div_26), 2);
					var text_13 = $.only_child(span_8, true);

					$.reset(div_26);

					var node_19 = $.sibling(div_26, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_27 = root_9();
							var span_9 = $.child(div_27);
							var text_14 = $.only_child(span_9);
							var div_28 = $.sibling(span_9, 2);

							$.each(div_28, 20, () => diagnosticState.results.certificate.altNames, (altName) => altName, ($$anchor, altName) => {
								var span_10 = root_8();
								var text_15 = $.only_child(span_10, true);

								$.template_effect(() => $.set_text(text_15, altName));
								$.append($$anchor, span_10);
							});

							$.reset(div_28);
							$.reset(div_27);
							$.template_effect(() => $.set_text(text_14, `Alternative Names (${diagnosticState.results.certificate.altNames.length ?? ''})`));
							$.append($$anchor, div_27);
						};

						$.if(node_19, ($$render) => {
							if (diagnosticState.results.certificate.altNames.length > 0) $$render(consequent_8);
						});
					}

					$.reset(div_20);
					$.reset(div_19);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_7, diagnosticState.results.certificate.commonName);
							$.set_text(text_8, diagnosticState.results.certificate.issuer);
							$.set_text(text_9, $0);
							$.set_class(span_5, 1, `detail-value ${diagnosticState.results.certificate.daysUntilExpiry < 30 ? 'warning' : ''}`, 'svelte-1k1ysyv');
							$.set_text(text_10, `${$1 ?? ''} `);
							$.set_text(text_12, diagnosticState.results.certificate.serialNumber);
							$.set_text(text_13, diagnosticState.results.certificate.fingerprint);
						},
						[
							() => new Date(diagnosticState.results.certificate.validFrom).toLocaleDateString(),
							() => new Date(diagnosticState.results.certificate.validTo).toLocaleDateString()
						]
					);

					$.append($$anchor, div_19);
				};

				$.if(node_16, ($$render) => {
					if (diagnosticState.results.certificate) $$render(consequent_9);
				});
			}

			$.reset(div_10);
			$.reset(div_8);
			$.template_effect(() => $.set_text(text_4, `TLS Check Results for ${diagnosticState.results.domain ?? ''}:${diagnosticState.results.port ?? ''}`));
			$.append($$anchor, div_8);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.results) $$render(consequent_10);
		});
	}

	var div_29 = $.sibling(node_5, 2);
	var div_30 = $.sibling($.child(div_29), 2);
	var details = $.child(div_30);
	var summary = $.child(details);
	var node_20 = $.child(summary);

	Icon(node_20, { name: 'chevron-right', size: 'sm' });

	var h4_2 = $.sibling(node_20, 2);
	var text_16 = $.only_child(h4_2, true);

	$.reset(summary);

	var div_31 = $.sibling(summary, 2);
	var p_2 = $.child(div_31);
	var text_17 = $.only_child(p_2, true);

	$.reset(div_31);
	$.reset(details);

	var details_1 = $.sibling(details, 2);
	var summary_1 = $.child(details_1);
	var node_21 = $.child(summary_1);

	Icon(node_21, { name: 'chevron-right', size: 'sm' });

	var h4_3 = $.sibling(node_21, 2);
	var text_18 = $.only_child(h4_3, true);

	$.reset(summary_1);

	var div_32 = $.sibling(summary_1, 2);
	var div_33 = $.child(div_32);

	$.each(div_33, 21, () => content.sections.portInfo.ports, (portInfo) => portInfo.port, ($$anchor, portInfo) => {
		var div_34 = root_12();
		var div_35 = $.child(div_34);
		var text_19 = $.only_child(div_35, true);
		var div_36 = $.sibling(div_35, 2);
		var strong = $.child(div_36);
		var text_20 = $.only_child(strong, true);
		var p_3 = $.sibling(strong, 2);
		var text_21 = $.only_child(p_3, true);
		var span_11 = $.sibling(p_3, 2);
		var text_22 = $.only_child(span_11, true);

		$.reset(div_36);
		$.reset(div_34);

		$.template_effect(() => {
			$.set_text(text_19, $.get(portInfo).port);
			$.set_text(text_20, $.get(portInfo).name);
			$.set_text(text_21, $.get(portInfo).desc);
			$.set_text(text_22, $.get(portInfo).security);
		});

		$.append($$anchor, div_34);
	});

	$.reset(div_33);
	$.reset(div_32);
	$.reset(details_1);

	var node_22 = $.sibling(details_1, 2);

	$.each(
		node_22,
		17,
		() => [
			{
				title: content.sections.tlsTypes.title,
				items: content.sections.tlsTypes.types,
				keys: ['name', 'desc', 'ports']
			},

			{
				title: content.sections.certificateFields.title,
				items: content.sections.certificateFields.fields,
				keys: ['field', 'desc']
			},

			{
				title: content.sections.security.title,
				items: content.sections.security.points,
				keys: ['point', 'desc']
			},

			{
				title: content.sections.troubleshooting.title,
				items: content.sections.troubleshooting.issues,
				keys: ['issue', 'solution']
			}
		],
		(section) => section.title,
		($$anchor, section) => {
			var details_2 = root_15();
			var summary_2 = $.child(details_2);
			var node_23 = $.child(summary_2);

			Icon(node_23, { name: 'chevron-right', size: 'sm' });

			var h4_4 = $.sibling(node_23, 2);
			var text_23 = $.only_child(h4_4, true);

			$.reset(summary_2);

			var div_37 = $.sibling(summary_2, 2);
			var ul = $.child(div_37);

			$.each(ul, 21, () => $.get(section).items, (item) => item[$.get(section).keys[0]], ($$anchor, item) => {
				var li = root_14();
				var strong_1 = $.child(li);
				var text_24 = $.only_child(strong_1);
				var text_25 = $.sibling(strong_1);
				var node_24 = $.sibling(text_25);

				{
					var consequent_11 = ($$anchor) => {
						var em = root_13();
						var text_26 = $.only_child(em);

						$.template_effect(() => $.set_text(text_26, `(${$.get(item)[$.get(section).keys[2]] ?? ''})`));
						$.append($$anchor, em);
					};

					$.if(node_24, ($$render) => {
						if ($.get(section).keys[2] && $.get(item)[$.get(section).keys[2]]) $$render(consequent_11);
					});
				}

				$.reset(li);

				$.template_effect(() => {
					$.set_text(text_24, `${$.get(item)[$.get(section).keys[0]] ?? ''}:`);
					$.set_text(text_25, ` ${$.get(item)[$.get(section).keys[1]] ?? ''} `);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_37);
			$.reset(details_2);
			$.template_effect(() => $.set_text(text_23, $.get(section).title));
			$.append($$anchor, details_2);
		}
	);

	var details_3 = $.sibling(node_22, 2);
	var summary_3 = $.child(details_3);
	var node_25 = $.child(summary_3);

	Icon(node_25, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary_3);

	var div_38 = $.sibling(summary_3, 2);
	var ul_1 = $.child(div_38);

	$.each(ul_1, 20, () => content.quickTips, (tip) => tip, ($$anchor, tip) => {
		var li_1 = root_16();
		var text_27 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_27, tip));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_38);
	$.reset(details_3);
	$.reset(div_30);
	$.reset(div_29);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, content.title);
		$.set_text(text_1, content.description);
		input.disabled = diagnosticState.loading;
		input_1.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading;
		$.set_text(text_2, ` ${diagnosticState.loading ? 'Checking...' : 'Check TLS'}`);
		$.set_text(text_16, content.sections.whatIsTLS.title);
		$.set_text(text_17, content.sections.whatIsTLS.content);
		$.set_text(text_18, content.sections.portInfo.title);
	});

	$.delegated('keydown', input, (e) => e.key === 'Enter' && checkTLS());
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.delegated('click', button, checkTLS);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);