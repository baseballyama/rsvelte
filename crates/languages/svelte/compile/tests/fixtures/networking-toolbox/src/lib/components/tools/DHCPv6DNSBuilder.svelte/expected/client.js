import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildDNSv6Options,
	getDefaultDNSv6Config,
	validateDNSv6Config,
	DNSv6_EXAMPLES
} from '$lib/utils/dhcpv6-dns-rfc3646';

var root = $.from_html(`<div class="server-row svelte-10j5m6b"><div class="input-group flex-grow svelte-10j5m6b"><label class="svelte-10j5m6b"><!> </label> <input type="text" placeholder="2001:4860:4860::8888" class="svelte-10j5m6b"/></div> <button type="button" class="btn-icon btn-remove svelte-10j5m6b" aria-label="Remove DNS server"><!></button></div>`);
var root_1 = $.from_html(`<div class="server-row svelte-10j5m6b"><div class="input-group flex-grow svelte-10j5m6b"><label class="svelte-10j5m6b"><!> </label> <input type="text" placeholder="example.com" class="svelte-10j5m6b"/></div> <button type="button" class="btn-icon btn-remove svelte-10j5m6b" aria-label="Remove search domain"><!></button></div>`);
var root_2 = $.from_html(`<div class="error-message svelte-10j5m6b"><!> </div>`);
var root_3 = $.from_html(`<div class="card errors-card svelte-10j5m6b"><h3 class="svelte-10j5m6b">Validation Errors</h3> <!></div>`);
var root_4 = $.from_html(`<div class="server-item svelte-10j5m6b"><!> <span class="field-label svelte-10j5m6b"></span> <span class="field-value svelte-10j5m6b"> </span></div>`);
var root_5 = $.from_html(`<div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 23: DNS Recursive Name Servers</h3> <div class="summary-card svelte-10j5m6b"><div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Total Length:</strong> </div> <div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Servers:</strong> </div></div> <div class="servers-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">DNS Servers</h4> <!></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-10j5m6b"> </pre></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-10j5m6b"> </pre></div></div>`);
var root_6 = $.from_html(`<div class="breakdown-item svelte-10j5m6b"><div class="breakdown-label svelte-10j5m6b"> </div> <div class="breakdown-hex svelte-10j5m6b"> </div></div>`);
var root_7 = $.from_html(`<div class="breakdown-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">Domain Encoding Breakdown</h4> <!></div>`);
var root_8 = $.from_html(`<div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 24: Domain Search List</h3> <div class="summary-card svelte-10j5m6b"><div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Total Length:</strong> </div> <div class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Domains:</strong> </div></div> <div class="servers-section svelte-10j5m6b"><h4 class="svelte-10j5m6b">Search Domains</h4> <!></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-10j5m6b"> </pre></div> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-10j5m6b"> </pre></div> <!></div>`);
var root_9 = $.from_html(`<div class="card results svelte-10j5m6b"><h3 class="svelte-10j5m6b">Configuration Example</h3> <div class="output-group svelte-10j5m6b"><div class="output-header svelte-10j5m6b"><h4 class="svelte-10j5m6b">Kea DHCPv6 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-10j5m6b"> </pre></div></div>`);

var root_10 = $.from_html(
	`<!> <!> <!> <div class="card results info-card svelte-10j5m6b"><h3 class="svelte-10j5m6b">About RFC 3646</h3> <p class="svelte-10j5m6b">RFC 3646 defines DNS configuration options for DHCPv6, allowing IPv6 clients to automatically discover DNS
        servers and search domains.</p> <ul class="svelte-10j5m6b"><li class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Option 23:</strong> DNS Recursive Name Server - List of IPv6 DNS server addresses (16 bytes each)</li> <li class="svelte-10j5m6b"><strong class="svelte-10j5m6b">Option 24:</strong> Domain Search List - DNS search domains encoded in DNS wire format (length-prefixed
          labels)</li></ul> <p class="svelte-10j5m6b">These options are essential for IPv6 network autoconfiguration, enabling clients to resolve hostnames without
        manual DNS configuration.</p></div>`,
	1
);

var root_11 = $.from_html(`<!> <div class="card input-card svelte-10j5m6b"><div class="card-header svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 23: DNS Recursive Name Servers</h3> <p class="help-text svelte-10j5m6b">IPv6 addresses of DNS servers for client name resolution</p></div> <div class="card-content svelte-10j5m6b"><!> <button type="button" class="btn-add svelte-10j5m6b"><!> Add DNS Server</button></div></div> <div class="card input-card svelte-10j5m6b"><div class="card-header svelte-10j5m6b"><h3 class="svelte-10j5m6b">Option 24: Domain Search List</h3> <p class="help-text svelte-10j5m6b">DNS search domains for hostname resolution</p></div> <div class="card-content svelte-10j5m6b"><!> <button type="button" class="btn-add svelte-10j5m6b"><!> Add Search Domain</button></div></div> <!> <!>`, 1);

export default function DHCPv6DNSBuilder($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		...getDefaultDNSv6Config(),
		dnsServers: [''],
		searchDomains: ['']
	}));

	let result = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	const examples = [
		{
			label: 'Google Public DNS',
			config: DNSv6_EXAMPLES[0],
			description: 'Google Public DNS servers with example.com search domains'
		},

		{
			label: 'Cloudflare DNS',
			config: DNSv6_EXAMPLES[1],
			description: 'Cloudflare 1.1.1.1 DNS with local search domain'
		},

		{
			label: 'Quad9 DNS',
			config: DNSv6_EXAMPLES[2],
			description: 'Quad9 DNS with corporate search domains'
		},

		{
			label: 'Local Network',
			config: DNSv6_EXAMPLES[3],
			description: 'Local ULA DNS server with home.arpa domain'
		}
	];

	function loadExample(example, index) {
		$.set(
			config,
			{
				dnsServers: [...example.config.dnsServers],
				searchDomains: [...example.config.searchDomains]
			},
			true
		);

		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = examples[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const dnsMatch = $.get(config).dnsServers.length === example.config.dnsServers.length && $.get(config).dnsServers.every((s, i) => s === example.config.dnsServers[i]);
		const searchMatch = $.get(config).searchDomains.length === example.config.searchDomains.length && $.get(config).searchDomains.every((d, i) => d === example.config.searchDomains[i]);

		if (!dnsMatch || !searchMatch) {
			$.set(selectedExampleIndex, null);
		}
	}

	function addDNSServer() {
		$.get(config).dnsServers = [...$.get(config).dnsServers, ''];
	}

	function removeDNSServer(index) {
		if ($.get(config).dnsServers.length > 1) {
			$.get(config).dnsServers = $.get(config).dnsServers.filter((_, i) => i !== index);
		} else {
			$.get(config).dnsServers = [''];
		}
	}

	function addSearchDomain() {
		$.get(config).searchDomains = [...$.get(config).searchDomains, ''];
	}

	function removeSearchDomain(index) {
		if ($.get(config).searchDomains.length > 1) {
			$.get(config).searchDomains = $.get(config).searchDomains.filter((_, i) => i !== index);
		} else {
			$.get(config).searchDomains = [''];
		}
	}

	$.user_effect(() => {
		// Read config properties to trigger effect when they change
		const currentDNSServers = [...$.get(config).dnsServers];

		const currentSearchDomains = [...$.get(config).searchDomains];

		// Update validationErrors and result without tracking them (prevents infinite loop)
		untrack(() => {
			const currentConfig = {
				dnsServers: currentDNSServers,
				searchDomains: currentSearchDomains
			};

			// Check if form is in initial empty state
			const isInitialState = currentConfig.dnsServers.length === 1 && !currentConfig.dnsServers[0].trim() && currentConfig.searchDomains.length === 1 && !currentConfig.searchDomains[0].trim();

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateDNSv6Config(currentConfig), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, buildDNSv6Options(currentConfig), true);
					} catch(e) {
						$.set(validationErrors, [e instanceof Error ? e.message : String(e)], true);
						$.set(result, null);
					}
				} else {
					$.set(result, null);
				}
			}

			checkIfExampleStillMatches();
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCPv6 DNS Options (RFC 3646)',
		description: 'Configure DNS servers (Option 23) and search domains (Option 24) for DHCPv6 clients. Supports IPv6 DNS servers and multiple search domains.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_11();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return examples;
				},
				onSelect: loadExample,
				getLabel: (ex) => ex.label,
				getDescription: (ex) => ex.description,
				get selectedIndex() {
					return $.get(selectedExampleIndex);
				}
			});

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var node_1 = $.child(div_1);

			$.each(node_1, 19, () => $.get(config).dnsServers, (_, i) => `dns-${i}`, ($$anchor, _, i) => {
				var div_2 = root();
				var div_3 = $.child(div_2);
				var label = $.child(div_3);
				var node_2 = $.child(label);

				Icon(node_2, { name: 'server', size: 'sm' });

				var text = $.sibling(node_2);

				$.reset(label);

				var input = $.sibling(label, 2);

				$.remove_input_defaults(input);
				$.reset(div_3);

				var button = $.sibling(div_3, 2);
				var node_3 = $.child(button);

				Icon(node_3, { name: 'x', size: 'sm' });
				$.reset(button);
				$.reset(div_2);

				$.template_effect(() => {
					$.set_attribute(label, 'for', `dns-server-${$.get(i) ?? ''}`);
					$.set_text(text, ` DNS Server ${$.get(i) + 1}`);
					$.set_attribute(input, 'id', `dns-server-${$.get(i) ?? ''}`);
					button.disabled = $.get(config).dnsServers.length === 1;
				});

				$.bind_value(input, () => $.get(config).dnsServers[$.get(i)], ($$value) => $.get(config).dnsServers[$.get(i)] = $$value);
				$.delegated('click', button, () => removeDNSServer($.get(i)));
				$.append($$anchor, div_2);
			});

			var button_1 = $.sibling(node_1, 2);
			var node_4 = $.child(button_1);

			Icon(node_4, { name: 'plus', size: 'sm' });
			$.next();
			$.reset(button_1);
			$.reset(div_1);
			$.reset(div);

			var div_4 = $.sibling(div, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var node_5 = $.child(div_5);

			$.each(node_5, 19, () => $.get(config).searchDomains, (_, i) => `domain-${i}`, ($$anchor, _, i) => {
				var div_6 = root_1();
				var div_7 = $.child(div_6);
				var label_1 = $.child(div_7);
				var node_6 = $.child(label_1);

				Icon(node_6, { name: 'globe', size: 'sm' });

				var text_1 = $.sibling(node_6);

				$.reset(label_1);

				var input_1 = $.sibling(label_1, 2);

				$.remove_input_defaults(input_1);
				$.reset(div_7);

				var button_2 = $.sibling(div_7, 2);
				var node_7 = $.child(button_2);

				Icon(node_7, { name: 'x', size: 'sm' });
				$.reset(button_2);
				$.reset(div_6);

				$.template_effect(() => {
					$.set_attribute(label_1, 'for', `search-domain-${$.get(i) ?? ''}`);
					$.set_text(text_1, ` Search Domain ${$.get(i) + 1}`);
					$.set_attribute(input_1, 'id', `search-domain-${$.get(i) ?? ''}`);
					button_2.disabled = $.get(config).searchDomains.length === 1;
				});

				$.bind_value(input_1, () => $.get(config).searchDomains[$.get(i)], ($$value) => $.get(config).searchDomains[$.get(i)] = $$value);
				$.delegated('click', button_2, () => removeSearchDomain($.get(i)));
				$.append($$anchor, div_6);
			});

			var button_3 = $.sibling(node_5, 2);
			var node_8 = $.child(button_3);

			Icon(node_8, { name: 'plus', size: 'sm' });
			$.next();
			$.reset(button_3);
			$.reset(div_5);
			$.reset(div_4);

			var node_9 = $.sibling(div_4, 2);

			{
				var consequent = ($$anchor) => {
					var div_8 = root_3();
					var node_10 = $.sibling($.child(div_8), 2);

					$.each(node_10, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_9 = root_2();
						var node_11 = $.child(div_9);

						Icon(node_11, { name: 'alert-triangle', size: 'sm' });

						var text_2 = $.sibling(node_11);

						$.reset(div_9);
						$.template_effect(() => $.set_text(text_2, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_9);
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_9, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent);
				});
			}

			var node_12 = $.sibling(node_9, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_10();
					var node_13 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							var div_10 = root_5();
							var div_11 = $.sibling($.child(div_10), 2);
							var div_12 = $.child(div_11);
							var text_3 = $.sibling($.child(div_12));

							$.reset(div_12);

							var div_13 = $.sibling(div_12, 2);
							var text_4 = $.sibling($.child(div_13));

							$.reset(div_13);
							$.reset(div_11);

							var div_14 = $.sibling(div_11, 2);
							var node_14 = $.sibling($.child(div_14), 2);

							$.each(node_14, 17, () => $.get(result).option23.servers, $.index, ($$anchor, server, i) => {
								var div_15 = root_4();
								var node_15 = $.child(div_15);

								Icon(node_15, { name: 'server', size: 'sm' });

								var span = $.sibling(node_15, 2);

								span.textContent = `Server ${i + 1}:`;

								var span_1 = $.sibling(span, 2);
								var text_5 = $.only_child(span_1, true);

								$.reset(div_15);
								$.template_effect(() => $.set_text(text_5, $.get(server)));
								$.append($$anchor, div_15);
							});

							$.reset(div_14);

							var div_16 = $.sibling(div_14, 2);
							var div_17 = $.child(div_16);
							var button_4 = $.sibling($.child(div_17), 2);
							let classes;
							var node_16 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('opt23-hex') ? 'check' : 'copy');

								Icon(node_16, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_6 = $.sibling(node_16);

							$.reset(button_4);
							$.reset(div_17);

							var pre = $.sibling(div_17, 2);
							var text_7 = $.only_child(pre, true);

							$.reset(div_16);

							var div_18 = $.sibling(div_16, 2);
							var div_19 = $.child(div_18);
							var button_5 = $.sibling($.child(div_19), 2);
							let classes_1;
							var node_17 = $.child(button_5);

							{
								let $0 = $.derived(() => clipboard.isCopied('opt23-wire') ? 'check' : 'copy');

								Icon(node_17, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_8 = $.sibling(node_17);

							$.reset(button_5);
							$.reset(div_19);

							var pre_1 = $.sibling(div_19, 2);
							var text_9 = $.only_child(pre_1, true);

							$.reset(div_18);
							$.reset(div_10);

							$.template_effect(
								($0, $1, $2, $3) => {
									$.set_text(text_3, ` ${$.get(result).option23.totalLength ?? ''} bytes`);
									$.set_text(text_4, ` ${$.get(result).option23.servers.length ?? ''}`);
									classes = $.set_class(button_4, 1, 'copy-btn svelte-10j5m6b', null, classes, { copied: $0 });
									$.set_text(text_6, ` ${$1 ?? ''}`);
									$.set_text(text_7, $.get(result).option23.hexEncoded);
									classes_1 = $.set_class(button_5, 1, 'copy-btn svelte-10j5m6b', null, classes_1, { copied: $2 });
									$.set_text(text_8, ` ${$3 ?? ''}`);
									$.set_text(text_9, $.get(result).option23.wireFormat);
								},
								[
									() => clipboard.isCopied('opt23-hex'),
									() => clipboard.isCopied('opt23-hex') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('opt23-wire'),
									() => clipboard.isCopied('opt23-wire') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_4, () => clipboard.copy($.get(result).option23.hexEncoded, 'opt23-hex'));
							$.delegated('click', button_5, () => clipboard.copy($.get(result).option23.wireFormat, 'opt23-wire'));
							$.append($$anchor, div_10);
						};

						$.if(node_13, ($$render) => {
							if ($.get(result).option23) $$render(consequent_1);
						});
					}

					var node_18 = $.sibling(node_13, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_20 = root_8();
							var div_21 = $.sibling($.child(div_20), 2);
							var div_22 = $.child(div_21);
							var text_10 = $.sibling($.child(div_22));

							$.reset(div_22);

							var div_23 = $.sibling(div_22, 2);
							var text_11 = $.sibling($.child(div_23));

							$.reset(div_23);
							$.reset(div_21);

							var div_24 = $.sibling(div_21, 2);
							var node_19 = $.sibling($.child(div_24), 2);

							$.each(node_19, 17, () => $.get(result).option24.domains, $.index, ($$anchor, domain, i) => {
								var div_25 = root_4();
								var node_20 = $.child(div_25);

								Icon(node_20, { name: 'globe', size: 'sm' });

								var span_2 = $.sibling(node_20, 2);

								span_2.textContent = `Domain ${i + 1}:`;

								var span_3 = $.sibling(span_2, 2);
								var text_12 = $.only_child(span_3, true);

								$.reset(div_25);
								$.template_effect(() => $.set_text(text_12, $.get(domain)));
								$.append($$anchor, div_25);
							});

							$.reset(div_24);

							var div_26 = $.sibling(div_24, 2);
							var div_27 = $.child(div_26);
							var button_6 = $.sibling($.child(div_27), 2);
							let classes_2;
							var node_21 = $.child(button_6);

							{
								let $0 = $.derived(() => clipboard.isCopied('opt24-hex') ? 'check' : 'copy');

								Icon(node_21, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_13 = $.sibling(node_21);

							$.reset(button_6);
							$.reset(div_27);

							var pre_2 = $.sibling(div_27, 2);
							var text_14 = $.only_child(pre_2, true);

							$.reset(div_26);

							var div_28 = $.sibling(div_26, 2);
							var div_29 = $.child(div_28);
							var button_7 = $.sibling($.child(div_29), 2);
							let classes_3;
							var node_22 = $.child(button_7);

							{
								let $0 = $.derived(() => clipboard.isCopied('opt24-wire') ? 'check' : 'copy');

								Icon(node_22, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_15 = $.sibling(node_22);

							$.reset(button_7);
							$.reset(div_29);

							var pre_3 = $.sibling(div_29, 2);
							var text_16 = $.only_child(pre_3, true);

							$.reset(div_28);

							var node_23 = $.sibling(div_28, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_30 = root_7();
									var node_24 = $.sibling($.child(div_30), 2);

									$.each(node_24, 17, () => $.get(result).option24.breakdown, $.index, ($$anchor, item) => {
										var div_31 = root_6();
										var div_32 = $.child(div_31);
										var text_17 = $.only_child(div_32, true);
										var div_33 = $.sibling(div_32, 2);
										var text_18 = $.only_child(div_33, true);

										$.reset(div_31);

										$.template_effect(() => {
											$.set_text(text_17, $.get(item).domain);
											$.set_text(text_18, $.get(item).wireFormat);
										});

										$.append($$anchor, div_31);
									});

									$.reset(div_30);
									$.append($$anchor, div_30);
								};

								$.if(node_23, ($$render) => {
									if ($.get(result).option24.breakdown.length > 0) $$render(consequent_2);
								});
							}

							$.reset(div_20);

							$.template_effect(
								($0, $1, $2, $3) => {
									$.set_text(text_10, ` ${$.get(result).option24.totalLength ?? ''} bytes`);
									$.set_text(text_11, ` ${$.get(result).option24.domains.length ?? ''}`);
									classes_2 = $.set_class(button_6, 1, 'copy-btn svelte-10j5m6b', null, classes_2, { copied: $0 });
									$.set_text(text_13, ` ${$1 ?? ''}`);
									$.set_text(text_14, $.get(result).option24.hexEncoded);
									classes_3 = $.set_class(button_7, 1, 'copy-btn svelte-10j5m6b', null, classes_3, { copied: $2 });
									$.set_text(text_15, ` ${$3 ?? ''}`);
									$.set_text(text_16, $.get(result).option24.wireFormat);
								},
								[
									() => clipboard.isCopied('opt24-hex'),
									() => clipboard.isCopied('opt24-hex') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('opt24-wire'),
									() => clipboard.isCopied('opt24-wire') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_6, () => clipboard.copy($.get(result).option24.hexEncoded, 'opt24-hex'));
							$.delegated('click', button_7, () => clipboard.copy($.get(result).option24.wireFormat, 'opt24-wire'));
							$.append($$anchor, div_20);
						};

						$.if(node_18, ($$render) => {
							if ($.get(result).option24) $$render(consequent_3);
						});
					}

					var node_25 = $.sibling(node_18, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_34 = root_9();
							var div_35 = $.sibling($.child(div_34), 2);
							var div_36 = $.child(div_35);
							var button_8 = $.sibling($.child(div_36), 2);
							let classes_4;
							var node_26 = $.child(button_8);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

								Icon(node_26, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_19 = $.sibling(node_26);

							$.reset(button_8);
							$.reset(div_36);

							var pre_4 = $.sibling(div_36, 2);
							var text_20 = $.only_child(pre_4, true);

							$.reset(div_35);
							$.reset(div_34);

							$.template_effect(
								($0, $1) => {
									classes_4 = $.set_class(button_8, 1, 'copy-btn svelte-10j5m6b', null, classes_4, { copied: $0 });
									$.set_text(text_19, ` ${$1 ?? ''}`);
									$.set_text(text_20, $.get(result).examples.keaDhcp6);
								},
								[
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_8, () => clipboard.copy($.get(result).examples.keaDhcp6, 'kea'));
							$.append($$anchor, div_34);
						};

						$.if(node_25, ($$render) => {
							if ($.get(result).examples.keaDhcp6) $$render(consequent_4);
						});
					}

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				$.if(node_12, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_5);
				});
			}

			$.delegated('click', button_1, addDNSServer);
			$.delegated('click', button_3, addSearchDomain);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);