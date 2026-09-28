import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { calculateReverseZones } from '$lib/utils/reverse-dns.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-header"><div class="example-label svelte-14lwgkn"> </div></div> <code class="example-input svelte-14lwgkn"> </code> <div class="example-description svelte-14lwgkn"> </div></button>`);
var root_1 = $.from_html(`<span class="nibble-info svelte-14lwgkn"> </span>`);
var root_2 = $.from_html(`<div class="zone-card svelte-14lwgkn"><div class="zone-header svelte-14lwgkn"><div class="zone-info svelte-14lwgkn"><h5 class="svelte-14lwgkn"> </h5> <div class="zone-meta svelte-14lwgkn"><span> </span> <span class="delegation-info svelte-14lwgkn"> </span> <!></div></div> <button><!></button></div> <div class="zone-description svelte-14lwgkn"><!></div></div>`);
var root_3 = $.from_html(`<div class="results-header svelte-14lwgkn"><h3 class="svelte-14lwgkn">Reverse Zone Analysis</h3> <div class="summary-stats svelte-14lwgkn"><div class="stat-item svelte-14lwgkn"><span class="stat-value svelte-14lwgkn"> </span> <span class="stat-label svelte-14lwgkn">Total Zones</span></div> <div class="stat-item svelte-14lwgkn"><span class="stat-value svelte-14lwgkn"> </span> <span class="stat-label svelte-14lwgkn">Delegation Type</span></div></div></div> <div class="zones-section svelte-14lwgkn"><h4 class="svelte-14lwgkn"><!> Required Reverse Zones</h4> <div class="zones-grid svelte-14lwgkn"></div></div> <div class="config-section svelte-14lwgkn"><h4 class="svelte-14lwgkn"><!> Configuration Examples</h4> <div class="config-examples svelte-14lwgkn"><div class="config-example svelte-14lwgkn"><div class="config-header svelte-14lwgkn"><h5 class="svelte-14lwgkn">BIND9 Configuration</h5> <button><!> Copy Config</button></div> <pre class="config-content svelte-14lwgkn"><code class="svelte-14lwgkn"> </code></pre></div> <div class="config-example svelte-14lwgkn"><div class="config-header svelte-14lwgkn"><h5 class="svelte-14lwgkn">Zone File Setup Commands</h5> <button><!> Copy Commands</button></div> <pre class="config-content svelte-14lwgkn"><code class="svelte-14lwgkn"> </code></pre></div></div></div>`, 1);
var root_4 = $.from_html(`<div class="error-result svelte-14lwgkn"><!> <h4 class="svelte-14lwgkn">Calculation Error</h4> <p class="svelte-14lwgkn"> </p> <div class="error-help svelte-14lwgkn"><strong>Valid formats:</strong> <ul class="svelte-14lwgkn"><li class="svelte-14lwgkn">IPv4 CIDR: 192.168.1.0/24, 10.0.0.0/16, 172.16.0.0/20</li> <li class="svelte-14lwgkn">IPv6 CIDR: 2001:db8::/64, fe80::/10, ::1/128</li></ul></div></div>`);
var root_5 = $.from_html(`<div class="card results-card svelte-14lwgkn"><!></div>`);

var root_6 = $.from_html(`<div class="card"><header class="card-header"><h1>Reverse Zones Calculator</h1> <p>Calculate the minimal set of reverse DNS zones needed to delegate a CIDR block</p></header> <div class="card info-card svelte-14lwgkn"><div class="overview-content svelte-14lwgkn"><div class="overview-item svelte-14lwgkn"><!> <div><strong class="svelte-14lwgkn">Zone Boundaries:</strong> IPv4 uses octet boundaries (/8, /16, /24) and IPv6 uses nibble boundaries (4-bit
          increments).</div></div> <div class="overview-item svelte-14lwgkn"><!> <div><strong class="svelte-14lwgkn">Delegation:</strong> DNS zones must be properly delegated by upstream providers at natural boundaries.</div></div> <div class="overview-item svelte-14lwgkn"><!> <div><strong class="svelte-14lwgkn">Optimization:</strong> Calculate the minimal number of zones needed to avoid unnecessary complexity.</div></div></div></div> <div class="card examples-card svelte-14lwgkn"><details class="examples-details svelte-14lwgkn"><summary class="examples-summary svelte-14lwgkn"><!> <h3 class="svelte-14lwgkn">Quick Examples</h3></summary> <div class="examples-grid svelte-14lwgkn"></div></details></div> <div class="card input-card svelte-14lwgkn"><div class="input-group svelte-14lwgkn"><label for="cidr-input" class="svelte-14lwgkn"><!> CIDR Block</label> <input id="cidr-input" type="text" placeholder="192.168.1.0/24 or 2001:db8::/64" spellcheck="false"/></div></div> <!> <div class="education-card svelte-14lwgkn"><div class="education-grid svelte-14lwgkn"><div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">Zone Delegation Basics</h4> <p class="svelte-14lwgkn">Reverse DNS zones must be delegated at natural boundaries. IPv4 uses octet boundaries (/8, /16, /24) while
          IPv6 uses nibble boundaries (every 4 bits). Delegation happens from your ISP or hosting provider.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">IPv4 Boundaries</h4> <p class="svelte-14lwgkn">IPv4 reverse zones align with classful network boundaries: /8 creates single zones like <code class="svelte-14lwgkn">10.in-addr.arpa</code>, /16 creates zones like <code class="svelte-14lwgkn">0.10.in-addr.arpa</code>, and /24 creates zones like <code class="svelte-14lwgkn">1.0.10.in-addr.arpa</code>.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">IPv6 Nibbles</h4> <p class="svelte-14lwgkn">IPv6 reverse zones use nibble boundaries (4-bit increments). Each hex digit becomes a separate label in the <code class="svelte-14lwgkn">ip6.arpa</code> domain. A /48 prefix typically requires 12 nibbles of delegation.</p></div> <div class="education-item info-panel svelte-14lwgkn"><h4 class="svelte-14lwgkn">Practical Considerations</h4> <p class="svelte-14lwgkn">Most organizations receive /24 (IPv4) or /48 to /64 (IPv6) delegations from their ISP. Smaller subnets like
          /28 still require the full /24 zone to be delegated to you for proper reverse DNS operation.</p></div></div></div></div>`);

export default function ReverseZonesCalculator($$anchor, $$props) {
	$.push($$props, true);

	let cidrInput = $.state('192.168.1.0/24');
	let results = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'IPv4 /24 Network',
			cidr: '192.168.1.0/24',
			description: 'Single /24 zone delegation'
		},

		{
			label: 'IPv4 /16 Network',
			cidr: '10.0.0.0/16',
			description: '/16 network with multiple /24 zones'
		},

		{
			label: 'IPv4 /20 Block',
			cidr: '172.16.32.0/20',
			description: '16 /24 zones needed'
		},

		{
			label: 'IPv4 /28 Subnet',
			cidr: '192.168.1.16/28',
			description: 'Small subnet within /24 zone'
		},

		{
			label: 'IPv6 /64 Network',
			cidr: '2001:db8:1000::/64',
			description: 'IPv6 nibble boundary delegation'
		},

		{
			label: 'IPv6 /48 Prefix',
			cidr: '2001:db8::/48',
			description: 'IPv6 /48 delegation zone'
		}
	];

	function loadExample(example) {
		$.set(cidrInput, example.cidr, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		calculateZones();
	}

	function calculateZones() {
		if (!$.get(cidrInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const trimmed = $.get(cidrInput).trim();
			const zones = calculateReverseZones(trimmed);

			if (zones.length === 0) {
				throw new Error('No reverse zones could be calculated for this CIDR');
			}

			// Analyze the results
			const ipv4Zones = zones.filter((z) => z.type === 'IPv4').length;

			const ipv6Zones = zones.filter((z) => z.type === 'IPv6').length;
			let delegationType = '';

			if (ipv4Zones > 0) {
				if (ipv4Zones === 1) {
					delegationType = zones[0].delegation.includes('/24') ? '/24 network' : `Custom (${zones[0].delegation})`;
				} else {
					delegationType = `Multiple zones (${ipv4Zones} x /24)`;
				}
			} else if (ipv6Zones > 0) {
				const nibbleDepth = zones[0].nibbleDepth || 0;

				delegationType = `IPv6 nibble boundary (${nibbleDepth} nibbles)`;
			}

			$.set(
				results,
				{
					success: true,
					zones,
					analysis: {
						totalZones: zones.length,
						ipv4Zones,
						ipv6Zones,
						delegationType
					}
				},
				true
			);
		} catch(error) {
			$.set(
				results,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					zones: [],
					analysis: {
						totalZones: 0,
						ipv4Zones: 0,
						ipv6Zones: 0,
						delegationType: ''
					}
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		calculateZones();
	}

	function generateBindConfig(zones) {
		return zones.map((zone) => `zone "${zone.zone}" {
    type master;
    file "/etc/bind/zones/${zone.zone}";
};`).join('\n\n');
	}

	function generateDelegationCommands(zones) {
		return zones.map((zone) => {
			const _zoneFile = zone.zone.replace(/\./g, '_');

			return `# Create zone file for ${zone.zone}
touch /etc/bind/zones/${zone.zone}
chown bind:bind /etc/bind/zones/${zone.zone}
chmod 644 /etc/bind/zones/${zone.zone}`;
		}).join('\n\n');
	}

	// Calculate on component load
	calculateZones();

	var div = root_6();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'layers', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'share', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'calculator', size: 'sm' });
	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root();
		var div_8 = $.child(button);
		var div_9 = $.child(div_8);
		var text = $.only_child(div_9, true);

		$.reset(div_8);

		var code = $.sibling(div_8, 2);
		var text_1 = $.only_child(code, true);
		var div_10 = $.sibling(code, 2);
		var text_2 = $.only_child(div_10, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-14lwgkn');
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, $.get(example).cidr);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_11 = $.sibling(div_6, 2);
	var div_12 = $.child(div_11);
	var label = $.child(div_12);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a CIDR block to calculate reverse zones for');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_12);
	$.reset(div_11);

	var node_5 = $.sibling(div_11, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_13 = root_5();
			var node_6 = $.child(div_13);

			{
				var consequent_5 = ($$anchor) => {
					var fragment = root_3();
					var div_14 = $.first_child(fragment);
					var div_15 = $.sibling($.child(div_14), 2);
					var div_16 = $.child(div_15);
					var span = $.child(div_16);
					var text_3 = $.only_child(span, true);

					$.next(2);
					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var span_1 = $.child(div_17);
					var text_4 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_17);
					$.reset(div_15);
					$.reset(div_14);

					var div_18 = $.sibling(div_14, 2);
					var h4 = $.child(div_18);
					var node_7 = $.child(h4);

					Icon(node_7, { name: 'list', size: 'sm' });
					$.next();
					$.reset(h4);

					var div_19 = $.sibling(h4, 2);

					$.each(div_19, 23, () => $.get(results).zones, (zone) => zone.zone, ($$anchor, zone, index) => {
						var div_20 = root_2();
						var div_21 = $.child(div_20);
						var div_22 = $.child(div_21);
						var h5 = $.child(div_22);
						var text_5 = $.only_child(h5, true);
						var div_23 = $.sibling(h5, 2);
						var span_2 = $.child(div_23);
						var text_6 = $.only_child(span_2, true);
						var span_3 = $.sibling(span_2, 2);
						var text_7 = $.only_child(span_3, true);
						var node_8 = $.sibling(span_3, 2);

						{
							var consequent = ($$anchor) => {
								var span_4 = root_1();
								var text_8 = $.only_child(span_4);

								$.template_effect(() => $.set_text(text_8, `${$.get(zone).nibbleDepth ?? ''} nibbles`));
								$.append($$anchor, span_4);
							};

							$.if(node_8, ($$render) => {
								if ($.get(zone).nibbleDepth) $$render(consequent);
							});
						}

						$.reset(div_23);
						$.reset(div_22);

						var button_1 = $.sibling(div_22, 2);
						var node_9 = $.child(button_1);

						{
							let $0 = $.derived(() => clipboard.isCopied(`zone-${$.get(index)}`) ? 'check' : 'copy');

							Icon(node_9, {
								get name() {
									return $.get($0);
								},
								size: 'sm'
							});
						}

						$.reset(button_1);
						$.reset(div_21);

						var div_24 = $.sibling(div_21, 2);
						var node_10 = $.child(div_24);

						{
							var consequent_4 = ($$anchor) => {
								var fragment_1 = $.comment();
								var node_11 = $.first_child(fragment_1);

								{
									var consequent_1 = ($$anchor) => {
										var text_9 = $.text('Standard /24 reverse zone for 256 addresses');

										$.append($$anchor, text_9);
									};

									var consequent_2 = ($$anchor) => {
										var text_10 = $.text('/16 reverse zone covering 65,536 addresses');

										$.append($$anchor, text_10);
									};

									var consequent_3 = ($$anchor) => {
										var text_11 = $.text('/8 reverse zone covering 16,777,216 addresses');

										$.append($$anchor, text_11);
									};

									var alternate = ($$anchor) => {
										var text_12 = $.text();

										$.template_effect(() => $.set_text(text_12, `Custom IPv4 reverse zone for ${$.get(zone).delegation ?? ''} prefix`));
										$.append($$anchor, text_12);
									};

									$.if(node_11, ($$render) => {
										if ($.get(zone).delegation === '/24') $$render(consequent_1); else if ($.get(zone).delegation === '/16') $$render(consequent_2, 1); else if ($.get(zone).delegation === '/8') $$render(consequent_3, 2); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_1);
							};

							var alternate_1 = ($$anchor) => {
								var text_13 = $.text();

								$.template_effect(() => $.set_text(text_13, `IPv6 reverse zone using ${$.get(zone).nibbleDepth ?? ''} nibble${$.get(zone).nibbleDepth !== 1 ? 's' : ''}
                    (${$.get(zone).delegation ?? ''} prefix)`));

								$.append($$anchor, text_13);
							};

							$.if(node_10, ($$render) => {
								if ($.get(zone).type === 'IPv4') $$render(consequent_4); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_24);
						$.reset(div_20);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_5, $.get(zone).zone);
								$.set_class(span_2, 1, `zone-type ${$0 ?? ''}`, 'svelte-14lwgkn');
								$.set_text(text_6, $.get(zone).type);
								$.set_text(text_7, $.get(zone).delegation);
								$.set_class(button_1, 1, `copy-button ${$1 ?? ''}`, 'svelte-14lwgkn');
							},
							[
								() => $.get(zone).type.toLowerCase(),
								() => clipboard.isCopied(`zone-${$.get(index)}`) ? 'copied' : ''
							]
						);

						$.delegated('click', button_1, () => clipboard.copy($.get(zone).zone, `zone-${$.get(index)}`));
						$.append($$anchor, div_20);
					});

					$.reset(div_19);
					$.reset(div_18);

					var div_25 = $.sibling(div_18, 2);
					var h4_1 = $.child(div_25);
					var node_12 = $.child(h4_1);

					Icon(node_12, { name: 'settings', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_26 = $.sibling(h4_1, 2);
					var div_27 = $.child(div_26);
					var div_28 = $.child(div_27);
					var button_2 = $.sibling($.child(div_28), 2);
					var node_13 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('bind-config') ? 'check' : 'copy');

						Icon(node_13, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button_2);
					$.reset(div_28);

					var pre = $.sibling(div_28, 2);
					var code_1 = $.child(pre);
					var text_14 = $.only_child(code_1, true);

					$.reset(pre);
					$.reset(div_27);

					var div_29 = $.sibling(div_27, 2);
					var div_30 = $.child(div_29);
					var button_3 = $.sibling($.child(div_30), 2);
					var node_14 = $.child(button_3);

					{
						let $0 = $.derived(() => clipboard.isCopied('setup-commands') ? 'check' : 'copy');

						Icon(node_14, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					$.next();
					$.reset(button_3);
					$.reset(div_30);

					var pre_1 = $.sibling(div_30, 2);
					var code_2 = $.child(pre_1);
					var text_15 = $.only_child(code_2, true);

					$.reset(pre_1);
					$.reset(div_29);
					$.reset(div_26);
					$.reset(div_25);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text_3, $.get(results).analysis.totalZones);
							$.set_text(text_4, $.get(results).analysis.delegationType);
							$.set_class(button_2, 1, `copy-button ${$0 ?? ''}`, 'svelte-14lwgkn');
							$.set_text(text_14, $1);
							$.set_class(button_3, 1, `copy-button ${$2 ?? ''}`, 'svelte-14lwgkn');
							$.set_text(text_15, $3);
						},
						[
							() => clipboard.isCopied('bind-config') ? 'copied' : '',
							() => generateBindConfig($.get(results).zones),
							() => clipboard.isCopied('setup-commands') ? 'copied' : '',
							() => generateDelegationCommands($.get(results).zones)
						]
					);

					$.delegated('click', button_2, () => $.get(results) && clipboard.copy(generateBindConfig($.get(results).zones), 'bind-config'));
					$.delegated('click', button_3, () => $.get(results) && clipboard.copy(generateDelegationCommands($.get(results).zones), 'setup-commands'));
					$.append($$anchor, fragment);
				};

				var alternate_2 = ($$anchor) => {
					var div_31 = root_4();
					var node_15 = $.child(div_31);

					Icon(node_15, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_15, 4);
					var text_16 = $.only_child(p, true);

					$.next(2);
					$.reset(div_31);
					$.template_effect(() => $.set_text(text_16, $.get(results).error));
					$.append($$anchor, div_31);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).success) $$render(consequent_5); else $$render(alternate_2, -1);
				});
			}

			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		var d = $.derived(() => $.get(results) && $.get(cidrInput).trim());

		$.if(node_5, ($$render) => {
			if ($.get(d)) $$render(consequent_6);
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
		'svelte-14lwgkn'
	));

	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(cidrInput), ($$value) => $.set(cidrInput, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);