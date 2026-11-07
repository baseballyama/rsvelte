import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

import {
	generateCIDRPTRs,
	generateReverseZoneFile,
	calculateReverseZones
} from '$lib/utils/reverse-dns';

var root = $.from_html(`<button><div class="example-header"><div class="example-label svelte-n9rls7"> </div></div> <code class="example-input svelte-n9rls7"> </code> <div class="example-template svelte-n9rls7">Template: <code class="svelte-n9rls7"> </code></div> <div class="example-description svelte-n9rls7"> </div></button>`);
var root_1 = $.from_html(`<div class="placeholder-item svelte-n9rls7"><code class="placeholder svelte-n9rls7"> </code> <span class="placeholder-desc svelte-n9rls7"> </span></div>`);
var root_2 = $.from_html(`<div class="zone-file svelte-n9rls7"><div class="zone-file-header svelte-n9rls7"><div class="zone-info svelte-n9rls7"><h4 class="svelte-n9rls7"> </h4> <div class="zone-meta svelte-n9rls7"><span> </span> <span class="record-count svelte-n9rls7"> </span></div></div> <button><!> Copy Zone File</button></div> <div class="zone-content-container svelte-n9rls7"><pre class="zone-content svelte-n9rls7"><code class="svelte-n9rls7"> </code></pre></div></div>`);
var root_3 = $.from_html(`<div class="results-header svelte-n9rls7"><h3 class="svelte-n9rls7">Generated Zone Files</h3> <div class="summary-stats svelte-n9rls7"><div class="stat-item svelte-n9rls7"><span class="stat-value svelte-n9rls7"> </span> <span class="stat-label svelte-n9rls7">Zone Files</span></div> <div class="stat-item svelte-n9rls7"><span class="stat-value svelte-n9rls7"> </span> <span class="stat-label svelte-n9rls7">PTR Records</span></div></div></div> <div class="zone-files svelte-n9rls7"></div>`, 1);
var root_4 = $.from_html(`<div class="error-result svelte-n9rls7"><!> <h4 class="svelte-n9rls7">Generation Error</h4> <p class="svelte-n9rls7"> </p> <div class="error-help svelte-n9rls7"><strong>Valid formats:</strong> <ul class="svelte-n9rls7"><li class="svelte-n9rls7">IPv4 CIDR: 192.168.1.0/24, 10.0.0.0/16</li> <li class="svelte-n9rls7">IPv6 CIDR: 2001:db8::/64, fe80::/10</li></ul></div></div>`);
var root_5 = $.from_html(`<div class="card results-card svelte-n9rls7"><!></div>`);

var root_6 = $.from_html(`<div class="card"><header class="card-header"><h1>Reverse Zone Generator</h1> <p>Generate complete reverse DNS zone files from CIDR blocks with customizable hostname templates</p></header> <div class="card info-card svelte-n9rls7"><div class="overview-content svelte-n9rls7"><div class="overview-item svelte-n9rls7"><!> <div><strong class="svelte-n9rls7">Full Zone Files:</strong> Complete DNS zone files with SOA, NS, and PTR records ready for deployment.</div></div> <div class="overview-item svelte-n9rls7"><!> <div><strong class="svelte-n9rls7">Hostname Templates:</strong> Customize hostname patterns using placeholders like <code class="svelte-n9rls7"></code> and <code class="svelte-n9rls7"></code>.</div></div> <div class="overview-item svelte-n9rls7"><!> <div><strong class="svelte-n9rls7">Zone Configuration:</strong> Configure name servers, contact email, TTL values, and domain settings.</div></div></div></div> <div class="card examples-card svelte-n9rls7"><details class="examples-details svelte-n9rls7"><summary class="examples-summary svelte-n9rls7"><!> <h3 class="svelte-n9rls7">Quick Examples</h3></summary> <div class="examples-grid svelte-n9rls7"></div></details></div> <div class="card input-card svelte-n9rls7"><div class="input-group svelte-n9rls7"><label for="cidr-input" class="svelte-n9rls7"><!> CIDR Block</label> <input id="cidr-input" type="text" placeholder="192.168.1.0/24 or 2001:db8::/64" spellcheck="false"/></div> <div class="input-group svelte-n9rls7"><label for="template-input" class="svelte-n9rls7"><!> Hostname Template</label> <input id="template-input" type="text" placeholder="host-[ip-dashes].example.com." class="template-input svelte-n9rls7" spellcheck="false"/> <div class="template-help svelte-n9rls7"><h4 class="svelte-n9rls7">Available Placeholders:</h4> <div class="placeholder-grid svelte-n9rls7"></div></div></div> <div class="config-section svelte-n9rls7"><h3 class="svelte-n9rls7">Zone Configuration</h3> <div class="config-grid svelte-n9rls7"><div class="config-group svelte-n9rls7"><label for="nameservers-input" class="svelte-n9rls7"><!> Name Servers</label> <textarea id="nameservers-input" placeholder="ns1.example.com
ns2.example.com" class="nameservers-input svelte-n9rls7" rows="3" spellcheck="false"></textarea></div> <div class="config-group svelte-n9rls7"><label for="contact-input" class="svelte-n9rls7"><!> Contact Email</label> <input id="contact-input" type="email" placeholder="hostmaster.example.com." class="contact-input svelte-n9rls7" spellcheck="false"/></div> <div class="config-group svelte-n9rls7"><label for="ttl-input" class="svelte-n9rls7"><!> Default TTL (seconds)</label> <input id="ttl-input" type="number" placeholder="86400" class="ttl-input svelte-n9rls7" min="60" max="2147483647"/></div></div></div></div> <!> <div class="education-card svelte-n9rls7"><div class="education-grid svelte-n9rls7"><div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Zone File Structure</h4> <p class="svelte-n9rls7">Generated zone files include proper SOA records with serial numbers, refresh/retry/expire timers, and NS
          records for delegation. All PTR records are automatically generated based on your template.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Hostname Templates</h4> <p class="svelte-n9rls7">Use placeholders to create consistent naming patterns. <code class="svelte-n9rls7">[ip-dashes]</code> is popular for creating
          hostnames like <code class="svelte-n9rls7">host-192-168-1-100.example.com</code> from IP addresses.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Zone Delegation</h4> <p class="svelte-n9rls7">The generated zones need to be properly delegated by your ISP or DNS provider. Ensure your name servers are
          configured to serve these zones and are reachable from the internet.</p></div> <div class="education-item info-panel svelte-n9rls7"><h4 class="svelte-n9rls7">Best Practices</h4> <p class="svelte-n9rls7">Keep TTL values reasonable (3600-86400 seconds). Use descriptive hostnames that help with network
          troubleshooting. Ensure forward DNS (A/AAAA) records exist for consistency.</p></div></div></div></div>`);

export default function ReverseZoneGenerator($$anchor, $$props) {
	$.push($$props, true);

	let cidrInput = $.state('192.168.1.0/24');
	let hostnameTemplate = $.state('host-{ip-dashes}.example.com.');
	let nameServers = $.state('ns1.example.com.\nns2.example.com.');
	let contactEmail = $.state('hostmaster.example.com.');
	let ttl = $.state(86400);
	let results = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'IPv4 /24 Network',
			cidr: '192.168.1.0/24',
			template: 'host-{ip-dashes}.example.com.',
			description: 'Generate zone for full /24 subnet'
		},

		{
			label: 'IPv4 /28 Block',
			cidr: '10.0.0.16/28',
			template: 'server{ip}.lan.example.com.',
			description: 'Small block with custom naming'
		},

		{
			label: 'IPv6 /64 Network',
			cidr: '2001:db8:1000::/64',
			template: 'host-{ip-dashes}.ipv6.example.com.',
			description: 'IPv6 reverse zone generation'
		},

		{
			label: 'Corporate Network',
			cidr: '172.16.100.0/24',
			template: 'workstation-{ip-dashes}.corp.example.com.',
			description: 'Corporate naming convention'
		}
	];

	const templateHelp = [
		{
			placeholder: '{ip}',
			description: 'Original IP address (192.168.1.100)'
		},

		{
			placeholder: '{ip-dashes}',
			description: 'IP with dashes (192-168-1-100)'
		},

		{
			placeholder: '{domain}',
			description: 'Base domain from settings'
		}
	];

	function loadExample(example) {
		$.set(cidrInput, example.cidr, true);
		$.set(hostnameTemplate, example.template, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		generateZones();
	}

	function generateZones() {
		if (!$.get(cidrInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const trimmed = $.get(cidrInput).trim();

			// Generate PTR records for the CIDR
			const ptrRecords = generateCIDRPTRs(trimmed, 5000);

			if (ptrRecords.length === 0) {
				throw new Error('No valid PTR records could be generated from this CIDR');
			}

			// Get the zones that need to be created
			const zoneInfos = calculateReverseZones(trimmed);

			// Parse name servers
			const nsArray = $.get(nameServers).split('\n').map((ns) => ns.trim()).filter((ns) => ns.length > 0).map((ns) => ns.endsWith('.') ? ns : ns + '.');

			const domainSuffix = $.get(contactEmail).split('@')[1] || 'example.com';

			const options = {
				nameServers: nsArray,
				contactEmail: $.get(contactEmail).endsWith('.') ? $.get(contactEmail) : $.get(contactEmail) + '.',
				domainSuffix: domainSuffix.endsWith('.') ? domainSuffix : domainSuffix + '.',
				ttl: $.get(ttl)
			};

			const zones = zoneInfos.map((zoneInfo) => {
				const zoneRecords = ptrRecords.filter((record) => record.zone === zoneInfo.zone);
				const content = generateReverseZoneFile(zoneInfo.zone, zoneRecords, $.get(hostnameTemplate), options);

				return {
					zone: zoneInfo.zone,
					type: zoneInfo.type,
					content,
					recordCount: zoneRecords.length
				};
			});

			const summary = { totalZones: zones.length, totalRecords: ptrRecords.length };

			$.set(results, { success: true, zones, summary }, true);
		} catch(error) {
			$.set(
				results,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					zones: [],
					summary: { totalZones: 0, totalRecords: 0 }
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		generateZones();
	}

	// Generate on component load
	generateZones();

	var div = root_6();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'file', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'template', size: 'sm' });

	var div_5 = $.sibling(node_1, 2);
	var code = $.sibling($.child(div_5), 2);

	code.textContent = '{ip}';

	var code_1 = $.sibling(code, 2);

	code_1.textContent = '{ip-dashes}';
	$.next();
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var node_2 = $.child(div_6);

	Icon(node_2, { name: 'settings', size: 'sm' });
	$.next(2);
	$.reset(div_6);
	$.reset(div_2);
	$.reset(div_1);

	var div_7 = $.sibling(div_1, 2);
	var details = $.child(div_7);
	var summary_1 = $.child(details);
	var node_3 = $.child(summary_1);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary_1);

	var div_8 = $.sibling(summary_1, 2);

	$.each(div_8, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root();
		var div_9 = $.child(button);
		var div_10 = $.child(div_9);
		var text = $.only_child(div_10, true);

		$.reset(div_9);

		var code_2 = $.sibling(div_9, 2);
		var text_1 = $.only_child(code_2, true);
		var div_11 = $.sibling(code_2, 2);
		var code_3 = $.sibling($.child(div_11));
		var text_2 = $.only_child(code_3, true);

		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var text_3 = $.only_child(div_12, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-n9rls7');
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, $.get(example).cidr);
			$.set_text(text_2, $.get(example).template);
			$.set_text(text_3, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_8);
	$.reset(details);
	$.reset(div_7);

	var div_13 = $.sibling(div_7, 2);
	var div_14 = $.child(div_13);
	var label = $.child(div_14);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a CIDR block to generate reverse zones for');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var label_1 = $.child(div_15);
	var node_5 = $.child(label_1);

	Icon(node_5, { name: 'tag', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Use placeholders like ${'{ip}'}, ${'{ip-dashes}'} to customize hostnames");

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);

	var div_16 = $.sibling(input_1, 2);
	var div_17 = $.sibling($.child(div_16), 2);

	$.each(div_17, 21, () => templateHelp, (item) => item.placeholder, ($$anchor, item) => {
		var div_18 = root_1();
		var code_4 = $.child(div_18);
		var text_4 = $.only_child(code_4, true);
		var span = $.sibling(code_4, 2);
		var text_5 = $.only_child(span, true);

		$.reset(div_18);

		$.template_effect(() => {
			$.set_text(text_4, $.get(item).placeholder);
			$.set_text(text_5, $.get(item).description);
		});

		$.append($$anchor, div_18);
	});

	$.reset(div_17);
	$.reset(div_16);
	$.reset(div_15);

	var div_19 = $.sibling(div_15, 2);
	var div_20 = $.sibling($.child(div_19), 2);
	var div_21 = $.child(div_20);
	var label_2 = $.child(div_21);
	var node_6 = $.child(label_2);

	Icon(node_6, { name: 'server', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'One name server per line, automatically adds trailing dots');

	var textarea = $.sibling(label_2, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var label_3 = $.child(div_22);
	var node_7 = $.child(label_3);

	Icon(node_7, { name: 'mail', size: 'sm' });
	$.next();
	$.reset(label_3);
	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS zone contact email address');

	var input_2 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_2);
	$.reset(div_22);

	var div_23 = $.sibling(div_22, 2);
	var label_4 = $.child(div_23);
	var node_8 = $.child(label_4);

	Icon(node_8, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_4);
	$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Default TTL for zone records in seconds');

	var input_3 = $.sibling(label_4, 2);

	$.remove_input_defaults(input_3);
	$.reset(div_23);
	$.reset(div_20);
	$.reset(div_19);
	$.reset(div_13);

	var node_9 = $.sibling(div_13, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_24 = root_5();
			var node_10 = $.child(div_24);

			{
				var consequent = ($$anchor) => {
					var fragment = root_3();
					var div_25 = $.first_child(fragment);
					var div_26 = $.sibling($.child(div_25), 2);
					var div_27 = $.child(div_26);
					var span_1 = $.child(div_27);
					var text_6 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_27);

					var div_28 = $.sibling(div_27, 2);
					var span_2 = $.child(div_28);
					var text_7 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_28);
					$.reset(div_26);
					$.reset(div_25);

					var div_29 = $.sibling(div_25, 2);

					$.each(div_29, 23, () => $.get(results).zones, (zone) => zone.zone, ($$anchor, zone, index) => {
						var div_30 = root_2();
						var div_31 = $.child(div_30);
						var div_32 = $.child(div_31);
						var h4 = $.child(div_32);
						var text_8 = $.only_child(h4, true);
						var div_33 = $.sibling(h4, 2);
						var span_3 = $.child(div_33);
						var text_9 = $.only_child(span_3, true);
						var span_4 = $.sibling(span_3, 2);
						var text_10 = $.only_child(span_4);

						$.reset(div_33);
						$.reset(div_32);

						var button_1 = $.sibling(div_32, 2);
						var node_11 = $.child(button_1);

						{
							let $0 = $.derived(() => clipboard.isCopied(`zone-${$.get(index)}`) ? 'check' : 'copy');

							Icon(node_11, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.next();
						$.reset(button_1);
						$.reset(div_31);

						var div_34 = $.sibling(div_31, 2);
						var pre = $.child(div_34);
						var code_5 = $.child(pre);
						var text_11 = $.only_child(code_5, true);

						$.reset(pre);
						$.reset(div_34);
						$.reset(div_30);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_8, $.get(zone).zone);
								$.set_class(span_3, 1, `zone-type ${$0 ?? ''}`, 'svelte-n9rls7');
								$.set_text(text_9, $.get(zone).type);
								$.set_text(text_10, `${$.get(zone).recordCount ?? ''} records`);
								$.set_class(button_1, 1, `copy-button ${$1 ?? ''}`, 'svelte-n9rls7');
								$.set_text(text_11, $.get(zone).content);
							},
							[
								() => $.get(zone).type.toLowerCase(),
								() => clipboard.isCopied(`zone-${$.get(index)}`) ? 'copied' : ''
							]
						);

						$.delegated('click', button_1, () => clipboard.copy($.get(zone).content, `zone-${$.get(index)}`));
						$.append($$anchor, div_30);
					});

					$.reset(div_29);

					$.template_effect(() => {
						$.set_text(text_6, $.get(results).summary.totalZones);
						$.set_text(text_7, $.get(results).summary.totalRecords);
					});

					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_35 = root_4();
					var node_12 = $.child(div_35);

					Icon(node_12, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_12, 4);
					var text_12 = $.only_child(p, true);

					$.next(2);
					$.reset(div_35);
					$.template_effect(() => $.set_text(text_12, $.get(results).error));
					$.append($$anchor, div_35);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).success) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_24);
			$.append($$anchor, div_24);
		};

		var d = $.derived(() => $.get(results) && $.get(cidrInput).trim());

		$.if(node_9, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => $.set_class(
		input,
		1,
		`cidr-input ${$.get(results)?.success === true
			? 'valid'
			: $.get(results)?.success === false ? 'invalid' : ''}`,
		'svelte-n9rls7'
	));

	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(cidrInput), ($$value) => $.set(cidrInput, $$value));
	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(hostnameTemplate), ($$value) => $.set(hostnameTemplate, $$value));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(nameServers), ($$value) => $.set(nameServers, $$value));
	$.delegated('input', input_2, handleInputChange);
	$.bind_value(input_2, () => $.get(contactEmail), ($$value) => $.set(contactEmail, $$value));
	$.delegated('input', input_3, handleInputChange);
	$.bind_value(input_3, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);