import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p> <small class="svelte-15x3kkc"> </small></button>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<!> Checking DNSSEC...`, 1);
var root_3 = $.from_html(`<!> Check DNSSEC`, 1);
var root_4 = $.from_html(`<div class="status-item info svelte-15x3kkc"><!> <div><strong class="svelte-15x3kkc">CD (Checking Disabled) Flag</strong> <p class="svelte-15x3kkc">SET - DNSSEC validation was disabled for this query</p></div></div>`);
var root_5 = $.from_html(`<div class="record-ttl svelte-15x3kkc"> </div>`);
var root_6 = $.from_html(`<div class="record-item"><div class="record-data mono"> </div> <!></div>`);
var root_7 = $.from_html(`<div class="result-section"><h4> </h4> <div class="records-list"></div></div>`);
var root_8 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><span><!></span> </button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Query:</span> <span class="info-value mono"> </span></div> <div class="info-item"><span class="info-label">DoH Resolver:</span> <span class="info-value"> </span></div></div> <div class="result-section"><h4>DNSSEC Validation Status</h4> <div class="dnssec-status svelte-15x3kkc"><div><!> <div><strong class="svelte-15x3kkc">AD (Authenticated Data) Flag</strong> <p class="svelte-15x3kkc"> </p></div></div> <!> <div><!> <div><strong class="svelte-15x3kkc">Response Code</strong> <p class="svelte-15x3kkc"> </p></div></div></div> <div class="explanation svelte-15x3kkc"><h5 class="svelte-15x3kkc">Explanation</h5> <p class="svelte-15x3kkc"> </p></div></div> <!> <!></div></div>`);
var root_9 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>DNSSEC Check Failed</strong> <p> </p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and exists</li> <li>Try a different record type if the current one doesn't exist</li> <li>Switch to a different DoH resolver</li> <li>Some domains may not have the requested record type</li></ul></div></div></div></div></div>`);

var root_10 = $.from_html(`<div class="card"><header class="card-header"><h1>DNSSEC AD Flag Checker</h1> <p>Query DNS records via DoH and report if the AD (Authenticated Data) bit is set. The AD bit indicates whether the
      DNS response has been cryptographically verified through DNSSEC validation.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Example DNSSEC Tests</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>DNSSEC Query Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-15x3kkc"><div class="form-group svelte-15x3kkc"><label for="domain" class="svelte-15x3kkc">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div> <div class="form-group svelte-15x3kkc"><label for="recordType" class="svelte-15x3kkc">Record Type <select id="recordType"></select></label></div> <div class="form-group svelte-15x3kkc"><label for="resolver" class="svelte-15x3kkc">DoH Resolver <select id="resolver"></select></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>About DNSSEC and the AD Flag</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is DNSSEC?</h4> <p>DNS Security Extensions (DNSSEC) adds cryptographic authentication to DNS responses, protecting against DNS
            spoofing and cache poisoning attacks by ensuring response integrity.</p></div> <div class="info-section"><h4>The AD (Authenticated Data) Flag</h4> <p>The AD bit in DNS responses indicates that the resolver has successfully validated the response using
            DNSSEC. When set, you can trust the response hasn't been tampered with.</p></div> <div class="info-section"><h4>Why Use DoH for DNSSEC?</h4> <p>DNS-over-HTTPS preserves DNSSEC validation status in the AD flag, while traditional DNS queries may not
            expose this information clearly to clients.</p></div> <div class="info-section"><h4>Interpreting Results</h4> <ul><li><strong>AD Set:</strong> Response is cryptographically verified</li> <li><strong>AD Not Set:</strong> Domain unsigned, validation failed, or resolver doesn't validate</li> <li><strong>CD Set:</strong> Validation was disabled for this query</li> <li><strong>SERVFAIL:</strong> May indicate DNSSEC validation failure</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let recordType = $.state('A');
	let resolver = $.state('cloudflare');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const recordTypes = [
		{ value: 'A', label: 'A', description: 'IPv4 address records' },
		{
			value: 'AAAA',
			label: 'AAAA',
			description: 'IPv6 address records'
		},

		{
			value: 'CNAME',
			label: 'CNAME',
			description: 'Canonical name records'
		},

		{
			value: 'MX',
			label: 'MX',
			description: 'Mail exchange records'
		},
		{ value: 'TXT', label: 'TXT', description: 'Text records' },
		{ value: 'NS', label: 'NS', description: 'Name server records' },
		{
			value: 'SOA',
			label: 'SOA',
			description: 'Start of authority records'
		}
	];

	const resolvers = [
		{ value: 'cloudflare', label: 'Cloudflare (1.1.1.1)' },
		{ value: 'google', label: 'Google (8.8.8.8)' },
		{ value: 'quad9', label: 'Quad9 (9.9.9.9)' },
		{ value: 'opendns', label: 'OpenDNS (208.67.222.222)' }
	];

	const examples = [
		{
			domain: 'cloudflare.com',
			type: 'A',
			description: 'DNSSEC-signed domain'
		},

		{
			domain: 'dnssec-failed.org',
			type: 'A',
			description: 'DNSSEC validation failure test'
		},

		{
			domain: 'example.com',
			type: 'A',
			description: 'Unsigned domain example'
		},

		{
			domain: 'google.com',
			type: 'A',
			description: 'Popular signed domain'
		},

		{
			domain: 'iana.org',
			type: 'A',
			description: 'Internet registry domain'
		}
	];

	async function checkDNSSEC() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/dns', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'dnssec-adflag',
					name: $.get(domain).trim(),
					type: $.get(recordType),
					resolverOpts: { doh: $.get(resolver) }
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `DNSSEC check failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err.message, true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(recordType, example.type, true);
		$.set(selectedExampleIndex, index, true);
		checkDNSSEC();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyResults() {
		if (!$.get(results)?.raw) return;

		try {
			await navigator.clipboard.writeText(JSON.stringify($.get(results).raw, null, 2));
			$.set(copiedState, true);
			setTimeout(() => $.set(copiedState, false), 1500);
		} catch(err) {
			console.error('Failed to copy:', err);
		}
	}

	var div = root_10();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_1 = $.only_child(p, true);
		var small = $.sibling(p, 2);
		var text_2 = $.only_child(small);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Check DNSSEC for ${$.get(example).domain} (${$.get(example).description})`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card svelte-15x3kkc', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text, $.get(example).domain);
			$.set_text(text_1, $.get(example).description);
			$.set_text(text_2, `${$.get(example).type ?? ''} record`);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a domain name to check DNSSEC validation status');
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_1 = $.child(div_7);
	var select = $.sibling($.child(label_1));

	$.each(select, 21, () => recordTypes, $.index, ($$anchor, type) => {
		var option = root_1();
		var text_3 = $.only_child(option);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_3, `${$.get(type).label ?? ''} - ${$.get(type).description ?? ''}`);

			if (option_value !== (option_value = $.get(type).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Select the DNS record type to query');
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var label_2 = $.child(div_8);
	var select_1 = $.sibling($.child(label_2));

	$.each(select_1, 21, () => resolvers, $.index, ($$anchor, res) => {
		var option_1 = root_1();
		var text_4 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_4, $.get(res).label);

			if (option_1_value !== (option_1_value = $.get(res).value)) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select_1);
	$.init_select(select_1);
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Choose a DNS-over-HTTPS resolver for the query');
	$.reset(div_8);
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var button_1 = $.child(div_9);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_2();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_9);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_10 = root_8();
			var div_11 = $.child(div_10);
			var h3 = $.child(div_11);
			var text_5 = $.only_child(h3);
			var button_2 = $.sibling(h3, 2);
			var span = $.child(button_2);
			var node_5 = $.child(span);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			$.reset(span);

			var text_6 = $.sibling(span);

			$.reset(button_2);
			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var span_1 = $.child(div_14);

			$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain and record type that was queried');

			var span_2 = $.sibling(span_1, 2);
			var text_7 = $.only_child(span_2);

			$.reset(div_14);

			var div_15 = $.sibling(div_14, 2);
			var span_3 = $.child(div_15);

			$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS-over-HTTPS resolver used for the query');

			var span_4 = $.sibling(span_3, 2);
			var text_8 = $.only_child(span_4, true);

			$.reset(div_15);
			$.reset(div_13);

			var div_16 = $.sibling(div_13, 2);
			var div_17 = $.sibling($.child(div_16), 2);
			var div_18 = $.child(div_17);
			var node_6 = $.child(div_18);

			{
				let $0 = $.derived(() => $.get(results).authenticated ? 'shield-check' : 'shield-alert');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var div_19 = $.sibling(node_6, 2);
			var p_1 = $.sibling($.child(div_19), 2);
			var text_9 = $.only_child(p_1, true);

			$.reset(div_19);
			$.reset(div_18);

			var node_7 = $.sibling(div_18, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_20 = root_4();
					var node_8 = $.child(div_20);

					Icon(node_8, { name: 'info', size: 'md' });
					$.next(2);
					$.reset(div_20);
					$.append($$anchor, div_20);
				};

				$.if(node_7, ($$render) => {
					if ($.get(results).checkingDisabled) $$render(consequent_1);
				});
			}

			var div_21 = $.sibling(node_7, 2);
			var node_9 = $.child(div_21);

			{
				let $0 = $.derived(() => $.get(results).rcode === 0 ? 'check-circle' : 'x-circle');

				Icon(node_9, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var div_22 = $.sibling(node_9, 2);
			var p_2 = $.sibling($.child(div_22), 2);
			var text_10 = $.only_child(p_2, true);

			$.reset(div_22);
			$.reset(div_21);
			$.reset(div_17);

			var div_23 = $.sibling(div_17, 2);
			var p_3 = $.sibling($.child(div_23), 2);
			var text_11 = $.only_child(p_3, true);

			$.reset(div_23);
			$.reset(div_16);

			var node_10 = $.sibling(div_16, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_24 = root_7();
					var h4 = $.child(div_24);
					var text_12 = $.only_child(h4);
					var div_25 = $.sibling(h4, 2);

					$.each(div_25, 21, () => $.get(results).records, $.index, ($$anchor, record) => {
						var div_26 = root_6();
						var div_27 = $.child(div_26);
						var text_13 = $.only_child(div_27, true);
						var node_11 = $.sibling(div_27, 2);

						{
							var consequent_2 = ($$anchor) => {
								var div_28 = root_5();
								var text_14 = $.only_child(div_28);

								$.template_effect(() => $.set_text(text_14, `TTL: ${$.get(record).TTL ?? ''}s`));
								$.append($$anchor, div_28);
							};

							$.if(node_11, ($$render) => {
								if ($.get(record).TTL) $$render(consequent_2);
							});
						}

						$.reset(div_26);
						$.template_effect(() => $.set_text(text_13, $.get(record).data));
						$.append($$anchor, div_26);
					});

					$.reset(div_25);
					$.reset(div_24);
					$.template_effect(() => $.set_text(text_12, `DNS Records (${$.get(results).records.length ?? ''})`));
					$.append($$anchor, div_24);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).records?.length) $$render(consequent_3);
				});
			}

			var node_12 = $.sibling(node_10, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_29 = root_7();
					var h4_1 = $.child(div_29);
					var text_15 = $.only_child(h4_1);
					var div_30 = $.sibling(h4_1, 2);

					$.each(div_30, 21, () => $.get(results).authority, $.index, ($$anchor, record) => {
						var div_31 = root_6();
						var div_32 = $.child(div_31);
						var text_16 = $.only_child(div_32);
						var node_13 = $.sibling(div_32, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_33 = root_5();
								var text_17 = $.only_child(div_33);

								$.template_effect(() => $.set_text(text_17, `TTL: ${$.get(record).TTL ?? ''}s`));
								$.append($$anchor, div_33);
							};

							$.if(node_13, ($$render) => {
								if ($.get(record).TTL) $$render(consequent_4);
							});
						}

						$.reset(div_31);
						$.template_effect(() => $.set_text(text_16, `${$.get(record).name ?? ''} ${$.get(record).type ?? ''} ${$.get(record).data ?? ''}`));
						$.append($$anchor, div_31);
					});

					$.reset(div_30);
					$.reset(div_29);
					$.template_effect(() => $.set_text(text_15, `Authority Section (${$.get(results).authority.length ?? ''})`));
					$.append($$anchor, div_29);
				};

				$.if(node_12, ($$render) => {
					if ($.get(results).authority?.length) $$render(consequent_5);
				});
			}

			$.reset(div_12);
			$.reset(div_10);

			$.template_effect(() => {
				$.set_text(text_5, `DNSSEC Status for ${$.get(results).name ?? ''}`);
				button_2.disabled = $.get(copiedState);
				$.set_class(span, 1, $.clsx($.get(copiedState) ? 'text-green-500' : ''));
				$.set_text(text_6, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Raw JSON'}`);
				$.set_text(text_7, `${$.get(results).name ?? ''} (${$.get(results).type ?? ''})`);
				$.set_text(text_8, $.get(results).resolver);
				$.set_class(div_18, 1, `status-item ${$.get(results).authenticated ? 'success' : 'warning'}`, 'svelte-15x3kkc');

				$.set_text(text_9, $.get(results).authenticated
					? 'SET - Response is DNSSEC validated'
					: 'NOT SET - Response is not validated');

				$.set_class(div_21, 1, `status-item ${$.get(results).rcode === 0 ? 'success' : 'error'}`, 'svelte-15x3kkc');
				$.set_text(text_10, $.get(results).rcodeText);
				$.set_text(text_11, $.get(results).explanation);
			});

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_10);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_6);
		});
	}

	var node_14 = $.sibling(node_4, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_34 = root_9();
			var div_35 = $.child(div_34);
			var div_36 = $.child(div_35);
			var node_15 = $.child(div_36);

			Icon(node_15, { name: 'alert-triangle', size: 'md' });

			var div_37 = $.sibling(node_15, 2);
			var p_4 = $.sibling($.child(div_37), 2);
			var text_18 = $.only_child(p_4, true);

			$.next(2);
			$.reset(div_37);
			$.reset(div_36);
			$.reset(div_35);
			$.reset(div_34);
			$.template_effect(() => $.set_text(text_18, $.get(error)));
			$.append($$anchor, div_34);
		};

		$.if(node_14, ($$render) => {
			if ($.get(error)) $$render(consequent_7);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => $.get(loading) || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(domain).trim()) checkDNSSEC();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));

	$.delegated('change', select, () => {
		clearExampleSelection();

		if ($.get(domain).trim()) checkDNSSEC();
	});

	$.bind_select_value(select, () => $.get(recordType), ($$value) => $.set(recordType, $$value));

	$.delegated('change', select_1, () => {
		if ($.get(domain).trim()) checkDNSSEC();
	});

	$.bind_select_value(select_1, () => $.get(resolver), ($$value) => $.set(resolver, $$value));
	$.delegated('click', button_1, checkDNSSEC);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);