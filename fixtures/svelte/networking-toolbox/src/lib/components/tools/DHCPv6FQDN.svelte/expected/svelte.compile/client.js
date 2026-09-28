import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables';

import {
	buildFQDNOption,
	getDefaultFQDNConfig,
	validateFQDNConfig,
	FQDN_EXAMPLES
} from '$lib/utils/dhcpv6-fqdn-rfc4704';

var root = $.from_html(`<div class="error-message svelte-s55tf4"><!> </div>`);
var root_1 = $.from_html(`<div class="card errors-card svelte-s55tf4"><h3 class="svelte-s55tf4">Validation Errors</h3> <!></div>`);
var root_2 = $.from_html(`<div class="flag-desc-item svelte-s55tf4"><!> </div>`);
var root_3 = $.from_html(`<div class="card results svelte-s55tf4"><h3 class="svelte-s55tf4">Configuration Example</h3> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Kea DHCPv6 Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-s55tf4"> </pre></div></div>`);

var root_4 = $.from_html(
	`<div class="card results svelte-s55tf4"><h3 class="svelte-s55tf4">Option 39: Client FQDN</h3> <div class="summary-card svelte-s55tf4"><div class="svelte-s55tf4"><strong class="svelte-s55tf4">FQDN:</strong> </div> <div class="svelte-s55tf4"><strong class="svelte-s55tf4">Total Length:</strong> </div></div> <div class="flags-section svelte-s55tf4"><h4 class="svelte-s55tf4">Flags Breakdown</h4> <div class="flags-grid svelte-s55tf4"><div><!> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">S Flag</strong> <span class="svelte-s55tf4"> </span></div></div> <div><!> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">O Flag</strong> <span class="svelte-s55tf4"> </span></div></div> <div><!> <div class="flag-content svelte-s55tf4"><strong class="svelte-s55tf4">N Flag</strong> <span class="svelte-s55tf4"> </span></div></div></div> <div class="flag-descriptions svelte-s55tf4"></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Flags Byte</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-s55tf4"> </pre></div></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Hex-Encoded (Compact)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-s55tf4"> </pre></div> <div class="output-group svelte-s55tf4"><div class="output-header svelte-s55tf4"><h4 class="svelte-s55tf4">Wire Format (Spaced)</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-s55tf4"> </pre></div> <div class="breakdown-section svelte-s55tf4"><h4 class="svelte-s55tf4">Encoding Breakdown</h4> <div class="breakdown-grid svelte-s55tf4"><div class="breakdown-item svelte-s55tf4"><span class="breakdown-label svelte-s55tf4">Flags:</span> <span class="breakdown-value svelte-s55tf4"> </span></div> <div class="breakdown-item svelte-s55tf4"><span class="breakdown-label svelte-s55tf4">FQDN:</span> <span class="breakdown-value svelte-s55tf4"> </span></div></div></div></div> <!> <div class="card results info-card svelte-s55tf4"><h3 class="svelte-s55tf4">About RFC 4704</h3> <p class="svelte-s55tf4">RFC 4704 defines the Client FQDN Option for DHCPv6, enabling clients and servers to negotiate dynamic DNS
        updates for IPv6 addresses.</p> <ul class="svelte-s55tf4"><li class="svelte-s55tf4"><strong class="svelte-s55tf4">S Flag (Bit 0):</strong> Server should perform DNS updates</li> <li class="svelte-s55tf4"><strong class="svelte-s55tf4">O Flag (Bit 1):</strong> Server can override client preferences</li> <li class="svelte-s55tf4"><strong class="svelte-s55tf4">N Flag (Bit 2):</strong> Client requests server to perform updates (client will NOT update)</li></ul> <p class="svelte-s55tf4">The FQDN is encoded using DNS wire format with length-prefixed labels, enabling automated hostname registration
        in DNS for IPv6 networks.</p></div>`,
	1
);

var root_5 = $.from_html(`<!> <div class="card input-card svelte-s55tf4"><div class="card-header svelte-s55tf4"><h3 class="svelte-s55tf4">FQDN Configuration</h3> <p class="help-text svelte-s55tf4">Fully Qualified Domain Name for the DHCPv6 client</p></div> <div class="card-content svelte-s55tf4"><div class="input-group svelte-s55tf4"><label for="fqdn" class="svelte-s55tf4"><!> Fully Qualified Domain Name (FQDN)</label> <input id="fqdn" type="text" placeholder="client.example.com" class="svelte-s55tf4"/></div></div></div> <div class="card input-card svelte-s55tf4"><div class="card-header svelte-s55tf4"><h3 class="svelte-s55tf4">DNS Update Flags</h3> <p class="help-text svelte-s55tf4">Control how DNS updates are performed</p></div> <div class="card-content flags-content svelte-s55tf4"><div class="checkbox-group svelte-s55tf4"><input id="server-update" type="checkbox" class="svelte-s55tf4"/> <label for="server-update" class="svelte-s55tf4"><!> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Server Should Update DNS (S Flag)</strong> <span class="help-text svelte-s55tf4">Server will perform AAAA and PTR record updates</span></div></label></div> <div class="checkbox-group svelte-s55tf4"><input id="server-override" type="checkbox" class="svelte-s55tf4"/> <label for="server-override" class="svelte-s55tf4"><!> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Server Override (O Flag)</strong> <span class="help-text svelte-s55tf4">Server can override client's preferences</span></div></label></div> <div class="checkbox-group svelte-s55tf4"><input id="client-update" type="checkbox" class="svelte-s55tf4"/> <label for="client-update" class="svelte-s55tf4"><!> <div class="checkbox-text svelte-s55tf4"><strong class="svelte-s55tf4">Client Should Update DNS (N Flag = 0)</strong> <span class="help-text svelte-s55tf4">Client will perform its own DNS updates</span></div></label></div></div></div> <!> <!>`, 1);

export default function DHCPv6FQDN($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy(getDefaultFQDNConfig()));
	let result = $.state(null);
	let validationErrors = $.state($.proxy([]));
	let selectedExampleIndex = $.state(null);
	const clipboard = useClipboard();

	function loadExample(example, index) {
		$.set(
			config,
			{
				fqdn: example.fqdn,
				serverShouldUpdate: example.serverShouldUpdate,
				serverOverride: example.serverOverride,
				clientShouldUpdate: example.clientShouldUpdate
			},
			true
		);

		$.set(selectedExampleIndex, index, true);
	}

	function checkIfExampleStillMatches() {
		if ($.get(selectedExampleIndex) === null) return;

		const example = FQDN_EXAMPLES[$.get(selectedExampleIndex)];

		if (!example) {
			$.set(selectedExampleIndex, null);

			return;
		}

		const matches = $.get(config).fqdn === example.fqdn && $.get(config).serverShouldUpdate === example.serverShouldUpdate && $.get(config).serverOverride === example.serverOverride && $.get(config).clientShouldUpdate === example.clientShouldUpdate;

		if (!matches) {
			$.set(selectedExampleIndex, null);
		}
	}

	$.user_effect(() => {
		// Read config properties to trigger effect when they change
		const currentFqdn = $.get(config).fqdn;

		const currentServerUpdate = $.get(config).serverShouldUpdate;
		const currentServerOverride = $.get(config).serverOverride;
		const currentClientUpdate = $.get(config).clientShouldUpdate;

		// Update validationErrors and result without tracking them (prevents infinite loop)
		untrack(() => {
			const currentConfig = {
				fqdn: currentFqdn,
				serverShouldUpdate: currentServerUpdate,
				serverOverride: currentServerOverride,
				clientShouldUpdate: currentClientUpdate
			};

			// Check if form is in initial empty state
			const isInitialState = !currentConfig.fqdn.trim();

			if (isInitialState) {
				$.set(validationErrors, [], true);
				$.set(result, null);
			} else {
				$.set(validationErrors, validateFQDNConfig(currentConfig), true);

				if ($.get(validationErrors).length === 0) {
					try {
						$.set(result, buildFQDNOption(currentConfig), true);
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
		title: 'DHCPv6 Client FQDN Option (RFC 4704)',
		description: 'Configure the Client FQDN Option (Option 39) for DHCPv6, enabling dynamic DNS updates and hostname management for IPv6 clients.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return FQDN_EXAMPLES;
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
			var div_2 = $.child(div_1);
			var label = $.child(div_2);
			var node_1 = $.child(label);

			Icon(node_1, { name: 'globe', size: 'sm' });
			$.next();
			$.reset(label);

			var input = $.sibling(label, 2);

			$.remove_input_defaults(input);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var div_3 = $.sibling(div, 2);
			var div_4 = $.sibling($.child(div_3), 2);
			var div_5 = $.child(div_4);
			var input_1 = $.child(div_5);

			$.remove_input_defaults(input_1);

			var label_1 = $.sibling(input_1, 2);
			var node_2 = $.child(label_1);

			Icon(node_2, { name: 'server', size: 'sm' });
			$.next(2);
			$.reset(label_1);
			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var input_2 = $.child(div_6);

			$.remove_input_defaults(input_2);

			var label_2 = $.sibling(input_2, 2);
			var node_3 = $.child(label_2);

			Icon(node_3, { name: 'shield', size: 'sm' });
			$.next(2);
			$.reset(label_2);
			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var input_3 = $.child(div_7);

			$.remove_input_defaults(input_3);

			var label_3 = $.sibling(input_3, 2);
			var node_4 = $.child(label_3);

			Icon(node_4, { name: 'user', size: 'sm' });
			$.next(2);
			$.reset(label_3);
			$.reset(div_7);
			$.reset(div_4);
			$.reset(div_3);

			var node_5 = $.sibling(div_3, 2);

			{
				var consequent = ($$anchor) => {
					var div_8 = root_1();
					var node_6 = $.sibling($.child(div_8), 2);

					$.each(node_6, 17, () => $.get(validationErrors), $.index, ($$anchor, error) => {
						var div_9 = root();
						var node_7 = $.child(div_9);

						Icon(node_7, { name: 'alert-triangle', size: 'sm' });

						var text = $.sibling(node_7);

						$.reset(div_9);
						$.template_effect(() => $.set_text(text, ` ${$.get(error) ?? ''}`));
						$.append($$anchor, div_9);
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_5, ($$render) => {
					if ($.get(validationErrors).length > 0) $$render(consequent);
				});
			}

			var node_8 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_4();
					var div_10 = $.first_child(fragment_2);
					var div_11 = $.sibling($.child(div_10), 2);
					var div_12 = $.child(div_11);
					var text_1 = $.sibling($.child(div_12));

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var text_2 = $.sibling($.child(div_13));

					$.reset(div_13);
					$.reset(div_11);

					var div_14 = $.sibling(div_11, 2);
					var div_15 = $.sibling($.child(div_14), 2);
					var div_16 = $.child(div_15);
					let classes;
					var node_9 = $.child(div_16);

					Icon(node_9, { name: 'server', size: 'sm' });

					var div_17 = $.sibling(node_9, 2);
					var span = $.sibling($.child(div_17), 2);
					var text_3 = $.only_child(span, true);

					$.reset(div_17);
					$.reset(div_16);

					var div_18 = $.sibling(div_16, 2);
					let classes_1;
					var node_10 = $.child(div_18);

					Icon(node_10, { name: 'shield', size: 'sm' });

					var div_19 = $.sibling(node_10, 2);
					var span_1 = $.sibling($.child(div_19), 2);
					var text_4 = $.only_child(span_1, true);

					$.reset(div_19);
					$.reset(div_18);

					var div_20 = $.sibling(div_18, 2);
					let classes_2;
					var node_11 = $.child(div_20);

					Icon(node_11, { name: 'user', size: 'sm' });

					var div_21 = $.sibling(node_11, 2);
					var span_2 = $.sibling($.child(div_21), 2);
					var text_5 = $.only_child(span_2, true);

					$.reset(div_21);
					$.reset(div_20);
					$.reset(div_15);

					var div_22 = $.sibling(div_15, 2);

					$.each(div_22, 21, () => $.get(result).flags.description, $.index, ($$anchor, desc) => {
						var div_23 = root_2();
						var node_12 = $.child(div_23);

						Icon(node_12, { name: 'info', size: 'xs' });

						var text_6 = $.sibling(node_12);

						$.reset(div_23);
						$.template_effect(() => $.set_text(text_6, ` ${$.get(desc) ?? ''}`));
						$.append($$anchor, div_23);
					});

					$.reset(div_22);

					var div_24 = $.sibling(div_22, 2);
					var div_25 = $.child(div_24);
					var button = $.sibling($.child(div_25), 2);
					let classes_3;
					var node_13 = $.child(button);

					{
						let $0 = $.derived(() => clipboard.isCopied('flags') ? 'check' : 'copy');

						Icon(node_13, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_7 = $.sibling(node_13);

					$.reset(button);
					$.reset(div_25);

					var pre = $.sibling(div_25, 2);
					var text_8 = $.only_child(pre, true);

					$.reset(div_24);
					$.reset(div_14);

					var div_26 = $.sibling(div_14, 2);
					var div_27 = $.child(div_26);
					var button_1 = $.sibling($.child(div_27), 2);
					let classes_4;
					var node_14 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

						Icon(node_14, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_9 = $.sibling(node_14);

					$.reset(button_1);
					$.reset(div_27);

					var pre_1 = $.sibling(div_27, 2);
					var text_10 = $.only_child(pre_1, true);

					$.reset(div_26);

					var div_28 = $.sibling(div_26, 2);
					var div_29 = $.child(div_28);
					var button_2 = $.sibling($.child(div_29), 2);
					let classes_5;
					var node_15 = $.child(button_2);

					{
						let $0 = $.derived(() => clipboard.isCopied('wire') ? 'check' : 'copy');

						Icon(node_15, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_11 = $.sibling(node_15);

					$.reset(button_2);
					$.reset(div_29);

					var pre_2 = $.sibling(div_29, 2);
					var text_12 = $.only_child(pre_2, true);

					$.reset(div_28);

					var div_30 = $.sibling(div_28, 2);
					var div_31 = $.sibling($.child(div_30), 2);
					var div_32 = $.child(div_31);
					var span_3 = $.sibling($.child(div_32), 2);
					var text_13 = $.only_child(span_3, true);

					$.reset(div_32);

					var div_33 = $.sibling(div_32, 2);
					var span_4 = $.sibling($.child(div_33), 2);
					var text_14 = $.only_child(span_4, true);

					$.reset(div_33);
					$.reset(div_31);
					$.reset(div_30);
					$.reset(div_10);

					var node_16 = $.sibling(div_10, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_34 = root_3();
							var div_35 = $.sibling($.child(div_34), 2);
							var div_36 = $.child(div_35);
							var button_3 = $.sibling($.child(div_36), 2);
							let classes_6;
							var node_17 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('kea') ? 'check' : 'copy');

								Icon(node_17, {
									get name() {
										return $.get($0);
									},
									size: 'xs'
								});
							}

							var text_15 = $.sibling(node_17);

							$.reset(button_3);
							$.reset(div_36);

							var pre_3 = $.sibling(div_36, 2);
							var text_16 = $.only_child(pre_3, true);

							$.reset(div_35);
							$.reset(div_34);

							$.template_effect(
								($0, $1) => {
									classes_6 = $.set_class(button_3, 1, 'copy-btn svelte-s55tf4', null, classes_6, { copied: $0 });
									$.set_text(text_15, ` ${$1 ?? ''}`);
									$.set_text(text_16, $.get(result).examples.keaDhcp6);
								},
								[
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_3, () => clipboard.copy($.get(result).examples.keaDhcp6, 'kea'));
							$.append($$anchor, div_34);
						};

						$.if(node_16, ($$render) => {
							if ($.get(result).examples.keaDhcp6) $$render(consequent_1);
						});
					}

					$.next(2);

					$.template_effect(
						($0, $1, $2, $3, $4, $5) => {
							$.set_text(text_1, ` ${$.get(result).fqdn ?? ''}`);
							$.set_text(text_2, ` ${$.get(result).totalLength ?? ''} bytes`);
							classes = $.set_class(div_16, 1, 'flag-item svelte-s55tf4', null, classes, { active: $.get(result).flags.S });
							$.set_text(text_3, $.get(result).flags.S ? 'Set' : 'Not Set');
							classes_1 = $.set_class(div_18, 1, 'flag-item svelte-s55tf4', null, classes_1, { active: $.get(result).flags.O });
							$.set_text(text_4, $.get(result).flags.O ? 'Set' : 'Not Set');
							classes_2 = $.set_class(div_20, 1, 'flag-item svelte-s55tf4', null, classes_2, { active: $.get(result).flags.N });
							$.set_text(text_5, $.get(result).flags.N ? 'Set' : 'Not Set');
							classes_3 = $.set_class(button, 1, 'copy-btn svelte-s55tf4', null, classes_3, { copied: $0 });
							$.set_text(text_7, ` ${$1 ?? ''}`);
							$.set_text(text_8, $.get(result).flags.flagsByte);
							classes_4 = $.set_class(button_1, 1, 'copy-btn svelte-s55tf4', null, classes_4, { copied: $2 });
							$.set_text(text_9, ` ${$3 ?? ''}`);
							$.set_text(text_10, $.get(result).hexEncoded);
							classes_5 = $.set_class(button_2, 1, 'copy-btn svelte-s55tf4', null, classes_5, { copied: $4 });
							$.set_text(text_11, ` ${$5 ?? ''}`);
							$.set_text(text_12, $.get(result).wireFormat);
							$.set_text(text_13, $.get(result).breakdown.flags);
							$.set_text(text_14, $.get(result).breakdown.fqdn);
						},
						[
							() => clipboard.isCopied('flags'),
							() => clipboard.isCopied('flags') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('hex'),
							() => clipboard.isCopied('hex') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('wire'),
							() => clipboard.isCopied('wire') ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button, () => clipboard.copy($.get(result).flags.flagsByte, 'flags'));
					$.delegated('click', button_1, () => clipboard.copy($.get(result).hexEncoded, 'hex'));
					$.delegated('click', button_2, () => clipboard.copy($.get(result).wireFormat, 'wire'));
					$.append($$anchor, fragment_2);
				};

				$.if(node_8, ($$render) => {
					if ($.get(result) && $.get(validationErrors).length === 0) $$render(consequent_2);
				});
			}

			$.bind_value(input, () => $.get(config).fqdn, ($$value) => $.get(config).fqdn = $$value);
			$.bind_checked(input_1, () => $.get(config).serverShouldUpdate, ($$value) => $.get(config).serverShouldUpdate = $$value);
			$.bind_checked(input_2, () => $.get(config).serverOverride, ($$value) => $.get(config).serverOverride = $$value);
			$.bind_checked(input_3, () => $.get(config).clientShouldUpdate, ($$value) => $.get(config).clientShouldUpdate = $$value);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);