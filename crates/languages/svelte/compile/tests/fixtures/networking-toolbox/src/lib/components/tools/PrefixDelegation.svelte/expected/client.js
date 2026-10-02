import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	buildPrefixDelegation,
	validatePrefixDelegationConfig,
	PREFIX_DELEGATION_EXAMPLES,
	formatTime
} from '$lib/utils/dhcpv6-prefix-delegation';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

var root = $.from_html(`<span class="hint svelte-xkyzkm"> </span>`);
var root_1 = $.from_html(`<button class="btn btn-danger btn-sm svelte-xkyzkm">Remove</button>`);
var root_2 = $.from_html(`<div class="prefix-row svelte-xkyzkm"><div class="prefix-inputs svelte-xkyzkm"><input type="text" placeholder="e.g., 2001:db8::/56" class="input svelte-xkyzkm"/> <input type="number" min="0" max="4294967295" placeholder="Preferred (s)" class="input input-sm svelte-xkyzkm" aria-label="Preferred lifetime"/> <input type="number" min="0" max="4294967295" placeholder="Valid (s)" class="input input-sm svelte-xkyzkm" aria-label="Valid lifetime"/></div> <!></div>`);
var root_3 = $.from_html(`<li> </li>`);
var root_4 = $.from_html(`<div class="error-card svelte-xkyzkm"><strong class="svelte-xkyzkm">Validation Errors:</strong> <ul class="svelte-xkyzkm"></ul></div>`);
var root_5 = $.from_html(`<div class="prefix-card svelte-xkyzkm"><div class="prefix-header svelte-xkyzkm"><span class="prefix-number svelte-xkyzkm"></span> <code class="prefix-value svelte-xkyzkm"> </code></div> <div class="prefix-details svelte-xkyzkm"><div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Preferred Lifetime:</span> <span> </span></div> <div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Valid Lifetime:</span> <span> </span></div> <div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Wire Format:</span> <code class="code-small svelte-xkyzkm"> </code> <button aria-label="Copy prefix wire format"> </button></div></div></div>`);
var root_6 = $.from_html(`<div class="card result-card svelte-xkyzkm"><h3 class="svelte-xkyzkm">Option 25 - IA_PD</h3> <div class="result-grid svelte-xkyzkm"><div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">IAID:</span> <code class="code-value svelte-xkyzkm"> </code></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">T1 Renewal:</span> <span class="value svelte-xkyzkm"> </span></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">T2 Rebinding:</span> <span class="value svelte-xkyzkm"> </span></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Full Hex:</span> <code class="code-value svelte-xkyzkm"> </code> <button aria-label="Copy hex"> </button></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Wire Format:</span> <code class="code-value svelte-xkyzkm"> </code> <button aria-label="Copy wire format"> </button></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Total Length:</span> <span class="value svelte-xkyzkm"> </span></div></div> <div class="prefixes-section svelte-xkyzkm"><h4 class="svelte-xkyzkm">Delegated Prefixes (Option 26)</h4> <!></div> <div class="config-section svelte-xkyzkm"><h4 class="svelte-xkyzkm">Configuration Example</h4> <div class="output-group svelte-xkyzkm"><div class="output-header svelte-xkyzkm"><h5 class="svelte-xkyzkm">Kea DHCPv6</h5> <button> </button></div> <pre class="code-block svelte-xkyzkm"><code class="svelte-xkyzkm"> </code></pre></div></div></div>`);
var root_7 = $.from_html(`<!> <div class="card input-card svelte-xkyzkm"><h3 class="svelte-xkyzkm">Prefix Delegation Configuration</h3> <div class="form-row svelte-xkyzkm"><div class="form-group svelte-xkyzkm"><label for="iaid" class="svelte-xkyzkm">IAID (Identity Association ID)</label> <input id="iaid" type="number" min="0" max="4294967295" class="input svelte-xkyzkm"/> <span class="hint svelte-xkyzkm">Unique identifier for this IA_PD (0-4294967295)</span></div> <div class="form-group svelte-xkyzkm"><label for="t1" class="svelte-xkyzkm">T1 Renewal Time (seconds)</label> <input id="t1" type="number" min="0" max="4294967295" placeholder="Optional" class="input svelte-xkyzkm"/> <!></div> <div class="form-group svelte-xkyzkm"><label for="t2" class="svelte-xkyzkm">T2 Rebinding Time (seconds)</label> <input id="t2" type="number" min="0" max="4294967295" placeholder="Optional" class="input svelte-xkyzkm"/> <!></div></div> <div class="form-group svelte-xkyzkm"><label for="prefix-0" class="svelte-xkyzkm">Delegated Prefixes</label> <!> <button class="btn btn-secondary btn-sm svelte-xkyzkm">Add Prefix</button></div> <!></div> <!>`, 1);

export default function PrefixDelegation($$anchor, $$props) {
	$.push($$props, true);

	const clipboard = useClipboard();

	// State
	let iaid = $.state(1);

	let t1 = $.state(302400);
	let t2 = $.state(483840);

	let prefixes = $.state($.proxy([
		{
			prefix: '2001:db8::/56',
			preferredLifetime: 604800,
			validLifetime: 2592000
		}
	]));

	let result = $.state(null);
	let errors = $.state($.proxy([]));

	function loadExample(example) {
		$.set(iaid, example.config.iaid, true);
		$.set(t1, example.config.t1, true);
		$.set(t2, example.config.t2, true);
		$.set(prefixes, example.config.prefixes.map((p) => ({ ...p })), true);
	}

	function addPrefix() {
		$.set(
			prefixes,
			[
				...$.get(prefixes),
				{
					prefix: '2001:db8::/56',
					preferredLifetime: 604800,
					validLifetime: 2592000
				}
			],
			true
		);
	}

	function removePrefix(index) {
		$.set(prefixes, $.get(prefixes).filter((_, i) => i !== index), true);

		if ($.get(prefixes).length === 0) {
			addPrefix();
		}
	}

	// Build effect
	$.user_effect(() => {
		const currentIaid = $.get(iaid);
		const currentT1 = $.get(t1);
		const currentT2 = $.get(t2);
		const currentPrefixes = $.get(prefixes);

		untrack(() => {
			const config = {
				iaid: currentIaid,
				t1: currentT1,
				t2: currentT2,
				prefixes: currentPrefixes
			};

			$.set(errors, validatePrefixDelegationConfig(config), true);

			if ($.get(errors).length === 0) {
				try {
					$.set(result, buildPrefixDelegation(config), true);
				} catch(err) {
					$.set(errors, [err instanceof Error ? err.message : 'Unknown error'], true);
					$.set(result, null);
				}
			} else {
				$.set(result, null);
			}
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCPv6 Prefix Delegation (IA_PD)',
		description: 'Build DHCPv6 IA_PD options for delegating IPv6 prefixes to requesting routers. Configure Identity Association for Prefix Delegation (Option 25) with IA Prefix options (Option 26) per RFC 8415.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			ExamplesCard(node, {
				get examples() {
					return PREFIX_DELEGATION_EXAMPLES;
				},
				onSelect: (ex) => loadExample(ex),
				getLabel: (ex) => ex.label,
				getDescription: (ex) => ex.description
			});

			var div = $.sibling(node, 2);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var input = $.sibling($.child(div_2), 2);

			$.remove_input_defaults(input);
			$.next(2);
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var input_1 = $.sibling($.child(div_3), 2);

			$.remove_input_defaults(input_1);

			var node_1 = $.sibling(input_1, 2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span);

					$.template_effect(($0) => $.set_text(text, `= ${$0 ?? ''}`), [() => formatTime($.get(t1))]);
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($.get(t1)) $$render(consequent);
				});
			}

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var input_2 = $.sibling($.child(div_4), 2);

			$.remove_input_defaults(input_2);

			var node_2 = $.sibling(input_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root();
					var text_1 = $.only_child(span_1);

					$.template_effect(($0) => $.set_text(text_1, `= ${$0 ?? ''}`), [() => formatTime($.get(t2))]);
					$.append($$anchor, span_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(t2)) $$render(consequent_1);
				});
			}

			$.reset(div_4);
			$.reset(div_1);

			var div_5 = $.sibling(div_1, 2);
			var node_3 = $.sibling($.child(div_5), 2);

			$.each(node_3, 17, () => $.get(prefixes), $.index, ($$anchor, prefix, i) => {
				var div_6 = root_2();
				var div_7 = $.child(div_6);
				var input_3 = $.child(div_7);

				$.remove_input_defaults(input_3);
				$.set_attribute(input_3, 'id', i === 0 ? 'prefix-0' : undefined);
				$.set_attribute(input_3, 'aria-label', i > 0 ? `Prefix ${i + 1}` : undefined);

				var input_4 = $.sibling(input_3, 2);

				$.remove_input_defaults(input_4);

				var input_5 = $.sibling(input_4, 2);

				$.remove_input_defaults(input_5);
				$.reset(div_7);

				var node_4 = $.sibling(div_7, 2);

				{
					var consequent_2 = ($$anchor) => {
						var button = root_1();

						$.delegated('click', button, () => removePrefix(i));
						$.append($$anchor, button);
					};

					$.if(node_4, ($$render) => {
						if ($.get(prefixes).length > 1) $$render(consequent_2);
					});
				}

				$.reset(div_6);
				$.bind_value(input_3, () => $.get(prefix).prefix, ($$value) => ($.get(prefix).prefix = $$value));
				$.bind_value(input_4, () => $.get(prefix).preferredLifetime, ($$value) => ($.get(prefix).preferredLifetime = $$value));
				$.bind_value(input_5, () => $.get(prefix).validLifetime, ($$value) => ($.get(prefix).validLifetime = $$value));
				$.append($$anchor, div_6);
			});

			var button_1 = $.sibling(node_3, 2);

			$.reset(div_5);

			var node_5 = $.sibling(div_5, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_4();
					var ul = $.sibling($.child(div_8), 2);

					$.each(ul, 21, () => $.get(errors), $.index, ($$anchor, error) => {
						var li = root_3();
						var text_2 = $.only_child(li, true);

						$.template_effect(() => $.set_text(text_2, $.get(error)));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_5, ($$render) => {
					if ($.get(errors).length > 0) $$render(consequent_3);
				});
			}

			$.reset(div);

			var node_6 = $.sibling(div, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_9 = root_6();
					var div_10 = $.sibling($.child(div_9), 2);
					var div_11 = $.child(div_10);
					var code = $.sibling($.child(div_11), 2);
					var text_3 = $.only_child(code);

					$.reset(div_11);

					var div_12 = $.sibling(div_11, 2);
					var span_2 = $.sibling($.child(div_12), 2);
					var text_4 = $.only_child(span_2);

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var span_3 = $.sibling($.child(div_13), 2);
					var text_5 = $.only_child(span_3);

					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var code_1 = $.sibling($.child(div_14), 2);
					var text_6 = $.only_child(code_1, true);
					var button_2 = $.sibling(code_1, 2);
					let classes;
					var text_7 = $.only_child(button_2, true);

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var code_2 = $.sibling($.child(div_15), 2);
					var text_8 = $.only_child(code_2, true);
					var button_3 = $.sibling(code_2, 2);
					let classes_1;
					var text_9 = $.only_child(button_3, true);

					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var span_4 = $.sibling($.child(div_16), 2);
					var text_10 = $.only_child(span_4);

					$.reset(div_16);
					$.reset(div_10);

					var div_17 = $.sibling(div_10, 2);
					var node_7 = $.sibling($.child(div_17), 2);

					$.each(node_7, 17, () => $.get(result).prefixes, $.index, ($$anchor, prefix, i) => {
						var div_18 = root_5();
						var div_19 = $.child(div_18);
						var span_5 = $.child(div_19);

						span_5.textContent = i + 1;

						var code_3 = $.sibling(span_5, 2);
						var text_11 = $.only_child(code_3, true);

						$.reset(div_19);

						var div_20 = $.sibling(div_19, 2);
						var div_21 = $.child(div_20);
						var span_6 = $.sibling($.child(div_21), 2);
						var text_12 = $.only_child(span_6);

						$.reset(div_21);

						var div_22 = $.sibling(div_21, 2);
						var span_7 = $.sibling($.child(div_22), 2);
						var text_13 = $.only_child(span_7);

						$.reset(div_22);

						var div_23 = $.sibling(div_22, 2);
						var code_4 = $.sibling($.child(div_23), 2);
						var text_14 = $.only_child(code_4, true);
						var button_4 = $.sibling(code_4, 2);
						let classes_2;
						var text_15 = $.only_child(button_4, true);

						$.reset(div_23);
						$.reset(div_20);
						$.reset(div_18);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_11, $.get(prefix).prefix);
								$.set_text(text_12, `${$.get(prefix).preferredLifetimeFormatted ?? ''} (${$.get(prefix).preferredLifetime ?? ''}s)`);
								$.set_text(text_13, `${$.get(prefix).validLifetimeFormatted ?? ''} (${$.get(prefix).validLifetime ?? ''}s)`);
								$.set_text(text_14, $.get(prefix).wireFormat);
								classes_2 = $.set_class(button_4, 1, 'btn-copy btn-copy-sm svelte-xkyzkm', null, classes_2, { copied: $0 });
								$.set_text(text_15, $1);
							},
							[
								() => clipboard.isCopied(`prefix-wire-${i}`),
								() => clipboard.isCopied(`prefix-wire-${i}`) ? 'Copied' : 'Copy'
							]
						);

						$.delegated('click', button_4, () => clipboard.copy($.get(prefix).wireFormat.replace(/\s/g, ''), `prefix-wire-${i}`));
						$.append($$anchor, div_18);
					});

					$.reset(div_17);

					var div_24 = $.sibling(div_17, 2);
					var div_25 = $.sibling($.child(div_24), 2);
					var div_26 = $.child(div_25);
					var button_5 = $.sibling($.child(div_26), 2);
					let classes_3;
					var text_16 = $.only_child(button_5, true);

					$.reset(div_26);

					var pre = $.sibling(div_26, 2);
					var code_5 = $.child(pre);
					var text_17 = $.only_child(code_5, true);

					$.reset(pre);
					$.reset(div_25);
					$.reset(div_24);
					$.reset(div_9);

					$.template_effect(
						($0, $1, $2, $3, $4, $5) => {
							$.set_text(text_3, `${$.get(result).iaid ?? ''} (0x${$.get(result).iaidHex ?? ''})`);
							$.set_text(text_4, `${$.get(result).t1Formatted ?? ''} (${$.get(result).t1 ?? ''}s)`);
							$.set_text(text_5, `${$.get(result).t2Formatted ?? ''} (${$.get(result).t2 ?? ''}s)`);
							$.set_text(text_6, $.get(result).fullHex);
							classes = $.set_class(button_2, 1, 'btn-copy svelte-xkyzkm', null, classes, { copied: $0 });
							$.set_text(text_7, $1);
							$.set_text(text_8, $.get(result).fullWireFormat);
							classes_1 = $.set_class(button_3, 1, 'btn-copy svelte-xkyzkm', null, classes_1, { copied: $2 });
							$.set_text(text_9, $3);
							$.set_text(text_10, `${$.get(result).totalLength ?? ''} bytes`);
							classes_3 = $.set_class(button_5, 1, 'btn-copy svelte-xkyzkm', null, classes_3, { copied: $4 });
							$.set_text(text_16, $5);
							$.set_text(text_17, $.get(result).examples.keaDhcp6);
						},
						[
							() => clipboard.isCopied('full-hex'),
							() => clipboard.isCopied('full-hex') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('full-wire'),
							() => clipboard.isCopied('full-wire') ? 'Copied' : 'Copy',
							() => clipboard.isCopied('kea-config'),
							() => clipboard.isCopied('kea-config') ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button_2, () => clipboard.copy($.get(result).fullHex, 'full-hex'));
					$.delegated('click', button_3, () => clipboard.copy($.get(result).fullWireFormat, 'full-wire'));
					$.delegated('click', button_5, () => clipboard.copy($.get(result).examples.keaDhcp6, 'kea-config'));
					$.append($$anchor, div_9);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result)) $$render(consequent_4);
				});
			}

			$.bind_value(input, () => $.get(iaid), ($$value) => $.set(iaid, $$value));
			$.bind_value(input_1, () => $.get(t1), ($$value) => $.set(t1, $$value));
			$.bind_value(input_2, () => $.get(t2), ($$value) => $.set(t2, $$value));
			$.delegated('click', button_1, addPrefix);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);