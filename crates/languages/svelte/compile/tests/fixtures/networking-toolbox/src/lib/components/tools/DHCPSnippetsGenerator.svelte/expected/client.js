import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { generateSnippets, getDefaultSnippetConfig } from '$lib/utils/dhcp-snippets.js';

var root = $.from_html(`<label class="checkbox-label svelte-1hp7r6i"><input type="checkbox" class="svelte-1hp7r6i"/> </label>`);
var root_1 = $.from_html(`<button type="button" class="btn-icon svelte-1hp7r6i"><!></button>`);
var root_2 = $.from_html(`<div class="pool-row svelte-1hp7r6i"><input type="text" placeholder="Start IP" class="svelte-1hp7r6i"/> <span class="svelte-1hp7r6i">-</span> <input type="text" placeholder="End IP" class="svelte-1hp7r6i"/> <!></div>`);
var root_3 = $.from_html(`<div class="error-message svelte-1hp7r6i"><!> <strong> </strong> </div>`);
var root_4 = $.from_html(`<div class="card errors-card svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Validation Errors</h3> <!></div>`);
var root_5 = $.from_html(`<div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">ISC dhcpd.conf</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1hp7r6i"> </pre></div>`);
var root_6 = $.from_html(`<div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">Kea DHCPv4 JSON</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1hp7r6i"> </pre></div>`);
var root_7 = $.from_html(`<div class="output-group svelte-1hp7r6i"><div class="output-header svelte-1hp7r6i"><h4 class="svelte-1hp7r6i">Kea DHCPv6 JSON</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-1hp7r6i"> </pre></div>`);
var root_8 = $.from_html(`<div class="card summary-card svelte-1hp7r6i"><!> <p class="svelte-1hp7r6i"> </p></div> <div class="card results svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Generated Snippets</h3> <!> <!> <!></div>`, 1);
var root_9 = $.from_html(`<div class="card input-card svelte-1hp7r6i"><div class="card-header svelte-1hp7r6i"><h3 class="svelte-1hp7r6i">Configuration</h3></div> <div class="card-content svelte-1hp7r6i"><div class="input-group svelte-1hp7r6i"><label class="svelte-1hp7r6i"><!> Target Servers</label> <div class="checkbox-group svelte-1hp7r6i"></div></div> <div class="input-group svelte-1hp7r6i"><label for="mode" class="svelte-1hp7r6i"><!> IP Mode</label> <select id="mode" class="svelte-1hp7r6i"><option>DHCPv4 (IPv4)</option><option>DHCPv6 (IPv6)</option></select></div> <div class="input-group svelte-1hp7r6i"><label for="subnet" class="svelte-1hp7r6i"><!> Subnet (CIDR)</label> <input id="subnet" type="text" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label class="svelte-1hp7r6i"><!> Address Pools</label> <!> <button type="button" class="btn-add svelte-1hp7r6i"><!> Add Pool</button></div> <div class="input-group svelte-1hp7r6i"><label for="gateway" class="svelte-1hp7r6i"><!> Gateway (Router)</label> <input id="gateway" type="text" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="dns" class="svelte-1hp7r6i"><!> DNS Servers (comma-separated)</label> <input id="dns" type="text" placeholder="8.8.8.8, 8.8.4.4" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="domain" class="svelte-1hp7r6i"><!> Domain Name</label> <input id="domain" type="text" placeholder="example.com" class="svelte-1hp7r6i"/></div> <div class="input-row svelte-1hp7r6i"><div class="input-group svelte-1hp7r6i"><label for="defaultLease" class="svelte-1hp7r6i"><!> Default Lease (seconds)</label> <input id="defaultLease" type="number" placeholder="86400" class="svelte-1hp7r6i"/></div> <div class="input-group svelte-1hp7r6i"><label for="maxLease" class="svelte-1hp7r6i"><!> Max Lease (seconds)</label> <input id="maxLease" type="number" placeholder="604800" class="svelte-1hp7r6i"/></div></div> <div class="input-row svelte-1hp7r6i"><label class="checkbox-label"><input type="checkbox"/> Use option names (ISC)</label> <label class="checkbox-label"><input type="checkbox"/> Pretty JSON (Kea)</label></div></div></div> <!>`, 1);

export default function DHCPSnippetsGenerator($$anchor, $$props) {
	$.push($$props, true);

	let config = $.proxy(getDefaultSnippetConfig());
	let result = $.state(null);
	const clipboard = useClipboard();

	const targetOptions = [
		{ value: 'isc-dhcpd', label: 'ISC dhcpd' },
		{ value: 'kea-dhcp4', label: 'Kea DHCPv4' },
		{ value: 'kea-dhcp6', label: 'Kea DHCPv6' }
	];

	// Reactive generation
	$.user_effect(() => {
		generate();
	});

	function generate() {
		$.set(result, generateSnippets(config), true);
	}

	function addPool() {
		const lastPool = config.pools[config.pools.length - 1];
		const newPool = { start: lastPool.end, end: lastPool.end };

		config.pools = [...config.pools, newPool];
	}

	function removePool(index) {
		if (config.pools.length > 1) {
			config.pools = config.pools.filter((_, i) => i !== index);
		}
	}

	function toggleTarget(target) {
		if (config.targets.includes(target)) {
			config.targets = config.targets.filter((t) => t !== target);
		} else {
			config.targets = [...config.targets, target];
		}
	}

	var fragment = root_9();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var label = $.child(div_2);
	var node = $.child(label);

	Icon(node, { name: 'server', size: 'sm' });
	$.next();
	$.reset(label);

	var div_3 = $.sibling(label, 2);

	$.each(div_3, 21, () => targetOptions, (option) => option.value, ($$anchor, option) => {
		var label_1 = root();
		var input = $.child(label_1);

		$.remove_input_defaults(input);

		var text = $.sibling(input);

		$.reset(label_1);

		$.template_effect(
			($0) => {
				$.set_checked(input, $0);
				$.set_text(text, ` ${$.get(option).label ?? ''}`);
			},
			[() => config.targets.includes($.get(option).value)]
		);

		$.delegated('change', input, () => toggleTarget($.get(option).value));
		$.append($$anchor, label_1);
	});

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var label_2 = $.child(div_4);
	var node_1 = $.child(label_2);

	Icon(node_1, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label_2);

	var select = $.sibling(label_2, 2);
	var option_1 = $.child(select);

	option_1.value = option_1.__value = 'dhcp4';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'dhcp6';
	$.reset(select);
	$.init_select(select);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var label_3 = $.child(div_5);
	var node_2 = $.child(label_3);

	Icon(node_2, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label_3);

	var input_1 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var label_4 = $.child(div_6);
	var node_3 = $.child(label_4);

	Icon(node_3, { name: 'layers', size: 'sm' });
	$.next();
	$.reset(label_4);

	var node_4 = $.sibling(label_4, 2);

	$.each(node_4, 17, () => config.pools, $.index, ($$anchor, pool, i) => {
		var div_7 = root_2();
		var input_2 = $.child(div_7);

		$.remove_input_defaults(input_2);

		var input_3 = $.sibling(input_2, 4);

		$.remove_input_defaults(input_3);

		var node_5 = $.sibling(input_3, 2);

		{
			var consequent = ($$anchor) => {
				var button = root_1();
				var node_6 = $.child(button);

				Icon(node_6, { name: 'x', size: 'sm' });
				$.reset(button);
				$.delegated('click', button, () => removePool(i));
				$.append($$anchor, button);
			};

			$.if(node_5, ($$render) => {
				if (config.pools.length > 1) $$render(consequent);
			});
		}

		$.reset(div_7);
		$.bind_value(input_2, () => $.get(pool).start, ($$value) => ($.get(pool).start = $$value));
		$.bind_value(input_3, () => $.get(pool).end, ($$value) => ($.get(pool).end = $$value));
		$.append($$anchor, div_7);
	});

	var button_1 = $.sibling(node_4, 2);
	var node_7 = $.child(button_1);

	Icon(node_7, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button_1);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var label_5 = $.child(div_8);
	var node_8 = $.child(label_5);

	Icon(node_8, { name: 'arrow-right', size: 'sm' });
	$.next();
	$.reset(label_5);

	var input_4 = $.sibling(label_5, 2);

	$.remove_input_defaults(input_4);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var label_6 = $.child(div_9);
	var node_9 = $.child(label_6);

	Icon(node_9, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label_6);

	var input_5 = $.sibling(label_6, 2);

	$.remove_input_defaults(input_5);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var label_7 = $.child(div_10);
	var node_10 = $.child(label_7);

	Icon(node_10, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label_7);

	var input_6 = $.sibling(label_7, 2);

	$.remove_input_defaults(input_6);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var div_12 = $.child(div_11);
	var label_8 = $.child(div_12);
	var node_11 = $.child(label_8);

	Icon(node_11, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_8);

	var input_7 = $.sibling(label_8, 2);

	$.remove_input_defaults(input_7);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var label_9 = $.child(div_13);
	var node_12 = $.child(label_9);

	Icon(node_12, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_9);

	var input_8 = $.sibling(label_9, 2);

	$.remove_input_defaults(input_8);
	$.reset(div_13);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var label_10 = $.child(div_14);
	var input_9 = $.child(label_10);

	$.remove_input_defaults(input_9);
	$.next();
	$.reset(label_10);

	var label_11 = $.sibling(label_10, 2);
	var input_10 = $.child(label_11);

	$.remove_input_defaults(input_10);
	$.next();
	$.reset(label_11);
	$.reset(div_14);
	$.reset(div_1);
	$.reset(div);

	var node_13 = $.sibling(div, 2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_14 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var div_15 = root_4();
					var node_15 = $.sibling($.child(div_15), 2);

					$.each(node_15, 17, () => $.get(result).validations, (error) => error.field, ($$anchor, error) => {
						var div_16 = root_3();
						var node_16 = $.child(div_16);

						Icon(node_16, { name: 'alert-triangle', size: 'sm' });

						var strong = $.sibling(node_16, 2);
						var text_1 = $.only_child(strong);
						var text_2 = $.sibling(strong);

						$.reset(div_16);

						$.template_effect(() => {
							$.set_text(text_1, `${$.get(error).field ?? ''}:`);
							$.set_text(text_2, ` ${$.get(error).message ?? ''}`);
						});

						$.append($$anchor, div_16);
					});

					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = root_8();
					var div_17 = $.first_child(fragment_2);
					var node_17 = $.child(div_17);

					Icon(node_17, { name: 'info', size: 'sm' });

					var p = $.sibling(node_17, 2);
					var text_3 = $.only_child(p, true);

					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var node_18 = $.sibling($.child(div_18), 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_19 = root_5();
							var div_20 = $.child(div_19);
							var button_2 = $.sibling($.child(div_20), 2);
							let classes;
							var node_19 = $.child(button_2);

							{
								let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

								Icon(node_19, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_4 = $.sibling(node_19);

							$.reset(button_2);
							$.reset(div_20);

							var pre = $.sibling(div_20, 2);
							var text_5 = $.only_child(pre, true);

							$.reset(div_19);

							$.template_effect(
								($0, $1) => {
									classes = $.set_class(button_2, 1, 'copy-btn svelte-1hp7r6i', null, classes, { copied: $0 });
									$.set_text(text_4, ` ${$1 ?? ''}`);
									$.set_text(text_5, $.get(result).iscDhcpdSnippet);
								},
								[
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_2, () => clipboard.copy($.get(result).iscDhcpdSnippet, 'isc'));
							$.append($$anchor, div_19);
						};

						$.if(node_18, ($$render) => {
							if ($.get(result).iscDhcpdSnippet) $$render(consequent_2);
						});
					}

					var node_20 = $.sibling(node_18, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_21 = root_6();
							var div_22 = $.child(div_21);
							var button_3 = $.sibling($.child(div_22), 2);
							let classes_1;
							var node_21 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea4') ? 'check' : 'copy');

								Icon(node_21, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_6 = $.sibling(node_21);

							$.reset(button_3);
							$.reset(div_22);

							var pre_1 = $.sibling(div_22, 2);
							var text_7 = $.only_child(pre_1, true);

							$.reset(div_21);

							$.template_effect(
								($0, $1) => {
									classes_1 = $.set_class(button_3, 1, 'copy-btn svelte-1hp7r6i', null, classes_1, { copied: $0 });
									$.set_text(text_6, ` ${$1 ?? ''}`);
									$.set_text(text_7, $.get(result).keaDhcp4Snippet);
								},
								[
									() => clipboard.isCopied('kea4'),
									() => clipboard.isCopied('kea4') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_3, () => clipboard.copy($.get(result).keaDhcp4Snippet, 'kea4'));
							$.append($$anchor, div_21);
						};

						$.if(node_20, ($$render) => {
							if ($.get(result).keaDhcp4Snippet) $$render(consequent_3);
						});
					}

					var node_22 = $.sibling(node_20, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_23 = root_7();
							var div_24 = $.child(div_23);
							var button_4 = $.sibling($.child(div_24), 2);
							let classes_2;
							var node_23 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea6') ? 'check' : 'copy');

								Icon(node_23, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_8 = $.sibling(node_23);

							$.reset(button_4);
							$.reset(div_24);

							var pre_2 = $.sibling(div_24, 2);
							var text_9 = $.only_child(pre_2, true);

							$.reset(div_23);

							$.template_effect(
								($0, $1) => {
									classes_2 = $.set_class(button_4, 1, 'copy-btn svelte-1hp7r6i', null, classes_2, { copied: $0 });
									$.set_text(text_8, ` ${$1 ?? ''}`);
									$.set_text(text_9, $.get(result).keaDhcp6Snippet);
								},
								[
									() => clipboard.isCopied('kea6'),
									() => clipboard.isCopied('kea6') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_4, () => clipboard.copy($.get(result).keaDhcp6Snippet, 'kea6'));
							$.append($$anchor, div_23);
						};

						$.if(node_22, ($$render) => {
							if ($.get(result).keaDhcp6Snippet) $$render(consequent_4);
						});
					}

					$.reset(div_18);
					$.template_effect(() => $.set_text(text_3, $.get(result).summary));
					$.append($$anchor, fragment_2);
				};

				$.if(node_14, ($$render) => {
					if ($.get(result).validations.length > 0) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_13, ($$render) => {
			if ($.get(result)) $$render(consequent_5);
		});
	}

	$.template_effect(
		($0) => {
			$.set_attribute(input_1, 'placeholder', config.mode === 'dhcp6' ? '2001:db8::/64' : '192.168.1.0/24');
			$.set_attribute(input_4, 'placeholder', config.mode === 'dhcp6' ? 'fe80::1' : '192.168.1.1');
			$.set_value(input_5, $0);
		},
		[() => config.dnsServers?.join(', ') || '']
	);

	$.bind_select_value(select, () => config.mode, ($$value) => config.mode = $$value);
	$.bind_value(input_1, () => config.subnet, ($$value) => config.subnet = $$value);
	$.delegated('click', button_1, addPool);
	$.bind_value(input_4, () => config.gateway, ($$value) => config.gateway = $$value);
	$.delegated('input', input_5, (e) => config.dnsServers = e.currentTarget.value.split(',').map((s) => s.trim()));
	$.bind_value(input_6, () => config.domainName, ($$value) => config.domainName = $$value);
	$.bind_value(input_7, () => config.defaultLeaseTime, ($$value) => config.defaultLeaseTime = $$value);
	$.bind_value(input_8, () => config.maxLeaseTime, ($$value) => config.maxLeaseTime = $$value);
	$.bind_checked(input_9, () => config.emitOptionNames, ($$value) => config.emitOptionNames = $$value);
	$.bind_checked(input_10, () => config.prettyJson, ($$value) => config.prettyJson = $$value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change', 'click', 'input']);