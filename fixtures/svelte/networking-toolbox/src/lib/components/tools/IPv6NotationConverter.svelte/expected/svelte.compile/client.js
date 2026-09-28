import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { expandIPv6, compressIPv6, validateIPv6Address } from '$lib/utils/ipv6-subnet-calculations.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<p class="error-message svelte-o87kl5"> </p>`);
var root_1 = $.from_html(`<button type="button"><div class="example-label svelte-o87kl5"> </div> <code class="example-address svelte-o87kl5"> </code></button>`);
var root_2 = $.from_html(`<div class="output-section svelte-o87kl5"><h3 class="svelte-o87kl5">Converted Address</h3> <div class="conversion-result svelte-o87kl5"><div class="result-card success svelte-o87kl5"><div class="result-header svelte-o87kl5"><h4 class="svelte-o87kl5"><!> </h4></div> <div class="result-content svelte-o87kl5"><div class="address-display svelte-o87kl5"><div class="address-wrapper svelte-o87kl5"><code class="converted-address svelte-o87kl5"> </code> <button type="button"><!></button></div></div> <div class="comparison-view svelte-o87kl5"><div class="comparison-item svelte-o87kl5"><span class="comparison-label svelte-o87kl5"> </span> <code class="comparison-address input svelte-o87kl5"> </code></div> <div class="comparison-item svelte-o87kl5"><span class="comparison-label svelte-o87kl5"> </span> <code class="comparison-address output svelte-o87kl5"> </code></div></div> <div class="stats-grid svelte-o87kl5"><div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Input Length</span> <span class="stat-value svelte-o87kl5"> </span></div> <div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Output Length</span> <span class="stat-value svelte-o87kl5"> </span></div> <div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Difference</span> <span> </span></div></div></div></div></div></div>`);
var root_3 = $.from_html(`<div class="converter-section svelte-o87kl5"><h3 class="svelte-o87kl5">Input IPv6 Address</h3> <div class="input-group svelte-o87kl5"><div class="form-group svelte-o87kl5"><label for="ipv6-input" class="svelte-o87kl5">IPv6 Address <!></label> <div class="input-wrapper svelte-o87kl5"><input id="ipv6-input" type="text" class="ipv6-input svelte-o87kl5"/> <button type="button" class="btn btn-secondary btn-md svelte-o87kl5"><!></button></div> <!></div></div></div> <div class="examples-section svelte-o87kl5"><details class="examples-details svelte-o87kl5"><summary class="examples-summary svelte-o87kl5"><!> <h3 class="svelte-o87kl5">Common Examples</h3></summary> <div class="examples-grid svelte-o87kl5"></div></details></div> <!>`, 1);

export default function IPv6NotationConverter($$anchor, $$props) {
	$.push($$props, true);

	let inputAddress = $.state('2001:db8::1');
	let outputAddress = $.state('');
	let conversionError = $.state('');
	const clipboard = useClipboard();
	let selectedExampleIndex = $.state(null);

	/* Common IPv6 example addresses for testing */
	const exampleAddresses = [
		{
			label: 'Documentation Prefix',
			compressed: '2001:db8::',
			expanded: '2001:0db8:0000:0000:0000:0000:0000:0000'
		},

		{
			label: 'Loopback Address',
			compressed: '::1',
			expanded: '0000:0000:0000:0000:0000:0000:0000:0001'
		},

		{
			label: 'Link-Local Address',
			compressed: 'fe80::1',
			expanded: 'fe80:0000:0000:0000:0000:0000:0000:0001'
		},

		{
			label: 'Global Unicast',
			compressed: '2001:db8:85a3::8a2e:370:7334',
			expanded: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
		},

		{
			label: 'IPv4-mapped IPv6',
			compressed: '::ffff:192.0.2.1',
			expanded: '0000:0000:0000:0000:0000:ffff:c000:0201'
		},

		{
			label: 'Multicast Address',
			compressed: 'ff02::1',
			expanded: 'ff02:0000:0000:0000:0000:0000:0000:0001'
		}
	];

	/* Set example address */
	function setExample(address, index) {
		$.set(inputAddress, address, true);
		$.set(selectedExampleIndex, index, true);
		performConversion();
	}

	/* Clear example selection when input changes */
	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	/* Handle input change */
	function handleInput() {
		clearExampleSelection();
		performConversion();
	}

	/* Perform the conversion based on mode */
	function performConversion() {
		$.set(conversionError, '');
		$.set(outputAddress, '');

		if (!$.get(inputAddress).trim()) {
			$.set(conversionError, 'Please enter an IPv6 address');

			return;
		}

		const validation = validateIPv6Address($.get(inputAddress));

		if (!validation.valid) {
			$.set(conversionError, validation.error || 'Invalid IPv6 address format', true);

			return;
		}

		try {
			if ($$props.mode === 'expand') {
				$.set(outputAddress, expandIPv6($.get(inputAddress)), true);
			} else {
				$.set(outputAddress, compressIPv6($.get(inputAddress)), true);
			}
		} catch(error) {
			$.set(conversionError, error instanceof Error ? error.message : 'Conversion failed', true);
		}
	}

	/* Clear input and output */
	function clearAll() {
		$.set(inputAddress, '');
		$.set(outputAddress, '');
		$.set(conversionError, '');
	}

	// Reactive conversion
	$.user_effect(() => {
		if ($.get(inputAddress)) {
			performConversion();
		}
	});

	var fragment = root_3();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var label = $.child(div_2);
	var node = $.sibling($.child(label));

	{
		let $0 = $.derived(() => $$props.mode === 'expand'
			? 'Enter compressed IPv6 address to expand'
			: 'Enter expanded IPv6 address to compress');

		Tooltip(node, {
			get text() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, { name: 'help', size: 'sm' });
			},
			$$slots: { default: true }
		});
	}

	$.reset(label);

	var div_3 = $.sibling(label, 2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var node_1 = $.child(button);

	Icon(node_1, { name: 'trash', size: 'md' });
	$.reset(button);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(conversionError)));
			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(conversionError)) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var details = $.child(div_4);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_5 = $.sibling(summary, 2);

	$.each(div_5, 23, () => exampleAddresses, (example, index) => `example-${index}`, ($$anchor, example, index) => {
		var button_1 = root_1();
		let classes;
		var div_6 = $.child(button_1);
		var text_1 = $.only_child(div_6, true);
		var code = $.sibling(div_6, 2);
		var text_2 = $.only_child(code, true);

		$.reset(button_1);

		$.template_effect(() => {
			classes = $.set_class(button_1, 1, 'example-btn svelte-o87kl5', null, classes, { selected: $.get(selectedExampleIndex) === $.get(index) });
			$.set_text(text_1, $.get(example).label);
			$.set_text(text_2, $$props.mode === 'expand' ? $.get(example).compressed : $.get(example).expanded);
		});

		$.delegated('click', button_1, () => setExample($$props.mode === 'expand' ? $.get(example).compressed : $.get(example).expanded, $.get(index)));
		$.append($$anchor, button_1);
	});

	$.reset(div_5);
	$.reset(details);
	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_7 = root_2();
			var div_8 = $.sibling($.child(div_7), 2);
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var h4 = $.child(div_10);
			var node_5 = $.child(h4);

			{
				let $0 = $.derived(() => $$props.mode === 'expand' ? 'maximize' : 'minimize');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_3 = $.sibling(node_5);

			$.reset(h4);
			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var code_1 = $.child(div_13);
			var text_4 = $.only_child(code_1, true);
			var button_2 = $.sibling(code_1, 2);
			let classes_1;
			var node_6 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied('output') ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.reset(button_2);
			$.reset(div_13);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);
			var div_15 = $.child(div_14);
			var span = $.child(div_15);
			var text_5 = $.only_child(span);
			var code_2 = $.sibling(span, 2);
			var text_6 = $.only_child(code_2, true);

			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var span_1 = $.child(div_16);
			var text_7 = $.only_child(span_1);
			var code_3 = $.sibling(span_1, 2);
			var text_8 = $.only_child(code_3, true);

			$.reset(div_16);
			$.reset(div_14);

			var div_17 = $.sibling(div_14, 2);
			var div_18 = $.child(div_17);
			var span_2 = $.sibling($.child(div_18), 2);
			var text_9 = $.only_child(span_2);

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var span_3 = $.sibling($.child(div_19), 2);
			var text_10 = $.only_child(span_3);

			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var span_4 = $.sibling($.child(div_20), 2);
			var text_11 = $.only_child(span_4);

			$.reset(div_20);
			$.reset(div_17);
			$.reset(div_11);
			$.reset(div_9);
			$.reset(div_8);
			$.reset(div_7);

			$.template_effect(
				($0) => {
					$.set_text(text_3, ` ${$$props.mode === 'expand' ? 'Expanded Format' : 'Compressed Format'}`);
					$.set_text(text_4, $.get(outputAddress));
					classes_1 = $.set_class(button_2, 1, 'btn btn-icon copy-btn svelte-o87kl5', null, classes_1, { copied: $0 });
					$.set_text(text_5, `Input (${$$props.mode === 'expand' ? 'Compressed' : 'Expanded'}):`);
					$.set_text(text_6, $.get(inputAddress));
					$.set_text(text_7, `Output (${$$props.mode === 'expand' ? 'Expanded' : 'Compressed'}):`);
					$.set_text(text_8, $.get(outputAddress));
					$.set_text(text_9, `${$.get(inputAddress).length ?? ''} characters`);
					$.set_text(text_10, `${$.get(outputAddress).length ?? ''} characters`);
					$.set_class(span_4, 1, `stat-value ${$.get(outputAddress).length > $.get(inputAddress).length ? 'expanded' : 'compressed'}`, 'svelte-o87kl5');
					$.set_text(text_11, `${$.get(outputAddress).length > $.get(inputAddress).length ? '+' : ''}${$.get(outputAddress).length - $.get(inputAddress).length} characters`);
				},
				[() => clipboard.isCopied('output')]
			);

			$.delegated('click', button_2, () => clipboard.copy($.get(outputAddress), 'output'));
			$.append($$anchor, div_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(outputAddress) && !$.get(conversionError)) $$render(consequent_1);
		});
	}

	$.template_effect(() => $.set_attribute(input, 'placeholder', $$props.mode === 'expand'
		? '2001:db8::1'
		: '2001:0db8:0000:0000:0000:0000:0000:0001'));

	$.delegated('input', input, handleInput);
	$.bind_value(input, () => $.get(inputAddress), ($$value) => $.set(inputAddress, $$value));
	$.delegated('click', button, clearAll);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input', 'click']);