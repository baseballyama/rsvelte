import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { convertMACAddresses } from '$lib/utils/mac-address.js';
import { macAddressContent } from '$lib/content/mac-address.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(
	`<label for="inputs" class="svelte-1g3qxzr">Enter MAC Addresses</label> <textarea id="inputs" placeholder="00:1A:2B:3C:4D:5E
00-50-56-C0-00-08
001A.2B3C.4D5E
001b632b4567" rows="6" class="svelte-1g3qxzr"></textarea> <div class="input-help svelte-1g3qxzr">Enter MAC addresses one per line. Supported formats: <code class="svelte-1g3qxzr">00:1A:2B:3C:4D:5E</code>, <code class="svelte-1g3qxzr">00-1A-2B-3C-4D-5E</code>, <code class="svelte-1g3qxzr">001A.2B3C.4D5E</code> (Cisco), <code class="svelte-1g3qxzr">001A2B3C4D5E</code></div> <button class="lookup-btn bulk svelte-1g3qxzr"><!> </button>`,
	1
);

var root_1 = $.from_html(`<label for="inputs" class="svelte-1g3qxzr">Enter MAC Address</label> <div class="input-row svelte-1g3qxzr"><input type="text" id="inputs" placeholder="00:1A:2B:3C:4D:5E" class="mac-input svelte-1g3qxzr"/> <button class="lookup-btn inline svelte-1g3qxzr"><!> </button></div> <div class="input-help svelte-1g3qxzr">Supported formats: <code class="svelte-1g3qxzr">00:1A:2B:3C:4D:5E</code>, <code class="svelte-1g3qxzr">00-1A-2B-3C-4D-5E</code>, <code class="svelte-1g3qxzr">001A.2B3C.4D5E</code> (Cisco), <code class="svelte-1g3qxzr">001A2B3C4D5E</code></div>`, 1);
var root_2 = $.from_html(`<button><h5 class="svelte-1g3qxzr"> </h5> <p class="svelte-1g3qxzr"> </p></button>`);
var root_3 = $.from_html(`<div class="export-buttons svelte-1g3qxzr"><button class="svelte-1g3qxzr"><!> Export CSV</button> <button class="svelte-1g3qxzr"><!> Export JSON</button></div>`);
var root_4 = $.from_html(`<div class="error-message svelte-1g3qxzr"> </div>`);
var root_5 = $.from_html(`<div class="conversion-header svelte-1g3qxzr"><div class="input-display svelte-1g3qxzr"><!> <code class="svelte-1g3qxzr"> </code></div> <!></div>`);
var root_6 = $.from_html(`<div class="conversion-header svelte-1g3qxzr"><div class="input-display error svelte-1g3qxzr"><!> <span>Invalid MAC Address</span></div> <!></div>`);
var root_7 = $.from_html(`<code> </code>`);
var root_8 = $.from_html(`<span> </span>`);
var root_9 = $.from_html(`<div><!> <div class="oui-content svelte-1g3qxzr"><span class="oui-label svelte-1g3qxzr"> </span> <!></div></div>`);
var root_10 = $.from_html(`<div><!> <span> </span></div>`);
var root_11 = $.from_html(`<div><span class="format-label svelte-1g3qxzr"> </span> <div><code> </code> <button class="copy-btn svelte-1g3qxzr"><!></button></div></div>`);
var root_12 = $.from_html(`<div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">OUI Information</h4> <div class="oui-info svelte-1g3qxzr"></div></div> <div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">Address Details</h4> <div class="details-grid svelte-1g3qxzr"></div></div> <div class="conversion-section svelte-1g3qxzr"><h4 class="svelte-1g3qxzr">Formats</h4> <div class="format-grid svelte-1g3qxzr"></div></div>`, 1);
var root_13 = $.from_html(`<div><!> <!></div>`);
var root_14 = $.from_html(`<div class="summary svelte-1g3qxzr"><h3 class="svelte-1g3qxzr">Conversion Summary</h3> <div class="summary-stats svelte-1g3qxzr"><div class="stat svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr"> </span> <span class="stat-label svelte-1g3qxzr">Total</span></div> <div class="stat valid svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr"> </span> <span class="stat-label svelte-1g3qxzr">Valid</span></div> <div class="stat invalid svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr"> </span> <span class="stat-label svelte-1g3qxzr">Invalid</span></div> <div class="stat with-oui svelte-1g3qxzr"><span class="stat-value svelte-1g3qxzr"> </span> <span class="stat-label svelte-1g3qxzr">With OUI</span></div></div></div>`);
var root_15 = $.from_html(`<div class="conversions svelte-1g3qxzr"><div class="conversions-header svelte-1g3qxzr"><h3 class="svelte-1g3qxzr"> </h3> <!></div> <!></div> <!>`, 1);
var root_16 = $.from_html(`<div class="results svelte-1g3qxzr"><!></div>`);
var root_17 = $.from_html(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr"> </strong> </li>`);
var root_18 = $.from_html(` <br/>`, 1);
var root_19 = $.from_html(`<li class="svelte-1g3qxzr"><strong class="svelte-1g3qxzr"> </strong> <code class="svelte-1g3qxzr"> </code> </li>`);
var root_20 = $.from_html(`<li class="svelte-1g3qxzr"> </li>`);

var root_21 = $.from_html(
	`<div class="card"><header class="card-header svelte-1g3qxzr"><h2 class="svelte-1g3qxzr">MAC Address Converter & OUI Lookup</h2> <p class="svelte-1g3qxzr">Convert MAC addresses between different formats and identify the manufacturer using the Organizationally Unique
      Identifier (OUI)</p></header> <div class="input-section svelte-1g3qxzr"><div class="inputs-section svelte-1g3qxzr"><div class="mode-toggle-row svelte-1g3qxzr"><h3 class="svelte-1g3qxzr"> </h3> <button class="mode-toggle svelte-1g3qxzr"><!> </button></div> <div class="input-group svelte-1g3qxzr"><!></div></div></div> <div class="card examples-card svelte-1g3qxzr"><details class="examples-details svelte-1g3qxzr"><summary class="examples-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr">Quick Examples</h4></summary> <div class="examples-grid svelte-1g3qxzr"></div></details></div> <!></div> <div class="card info-card svelte-1g3qxzr"><div class="card-header svelte-1g3qxzr"><h3>Understanding MAC Addresses</h3></div> <div class="card-content"><details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><p class="svelte-1g3qxzr"> </p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul> <p class="structure-example svelte-1g3qxzr"><strong>Example:</strong> <code class="svelte-1g3qxzr"> </code><br/> <span class="structure-breakdown svelte-1g3qxzr"></span></p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><p class="svelte-1g3qxzr"> </p> <ul class="svelte-1g3qxzr"></ul> <p class="svelte-1g3qxzr"> </p></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr"> </h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul></div></details> <details class="info-accordion svelte-1g3qxzr"><summary class="accordion-summary svelte-1g3qxzr"><!> <h4 class="svelte-1g3qxzr">Quick Tips</h4></summary> <div class="accordion-content svelte-1g3qxzr"><ul class="svelte-1g3qxzr"></ul></div></details></div></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('00:1A:2B:3C:4D:5E');
	let result = $.state(null);
	let copiedStates = $.proxy({});
	let isLoading = $.state(false);
	let isBulkMode = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			mac: '00:1A:79:00:00:01',
			vendor: 'Telecomunication Technologies',
			description: 'Ukrainian telecom equipment (Odessa)'
		},

		{
			mac: '3C:22:FB:A1:B2:C3',
			vendor: 'Apple',
			description: 'Apple device (Cupertino, CA)'
		},

		{
			mac: 'DC:A6:32:A1:B2:C3',
			vendor: 'Raspberry Pi Trading',
			description: 'Raspberry Pi (Cambridge, UK)'
		},

		{
			mac: '00:16:3E:1F:4A:B1',
			vendor: 'Xensource',
			description: 'Xen virtual machine (Palo Alto, CA)'
		},

		{
			mac: '00:00:5E:00:01:01',
			vendor: 'ICANN IANA',
			description: 'IANA reserved addresses (special use)'
		},

		{
			mac: '00:0D:B9:A1:B2:C3',
			vendor: 'PC Engines',
			description: 'PC Engines embedded systems (Switzerland)'
		},

		{
			mac: 'FF:FF:FF:FF:FF:FF',
			vendor: '',
			description: 'Multicast/Broadcast'
		}
	];

	const ouiFields = [
		{
			key: 'oui',
			label: 'OUI',
			icon: 'hash',
			render: (c) => c.oui.oui,
			code: true
		},

		{
			key: 'manufacturer',
			label: 'Manufacturer',
			icon: (c) => c.oui.found ? 'building' : 'help-circle',
			render: (c) => c.oui.found ? c.oui.manufacturer : 'Unknown',
			class: 'manufacturer-item',
			valueClass: (c) => !c.oui.found ? 'unknown' : ''
		},

		{
			key: 'country',
			label: 'Country',
			icon: 'globe',
			render: (c) => c.oui.country || 'N/A',
			condition: (c) => !!c.oui.country
		},

		{
			key: 'blockType',
			label: 'Block Type',
			icon: 'layers',
			render: (c) => c.oui.blockType || 'N/A',
			tooltip: (c) => c.oui.blockType ? getBlockTypeTooltip(c.oui.blockType) : '',
			condition: (c) => !!c.oui.blockType
		},

		{
			key: 'blockSize',
			label: 'Block Size',
			icon: 'database',
			render: (c) => c.oui.blockSize
				? `${c.oui.blockSize.toLocaleString()} addresses`
				: 'N/A',
			condition: (c) => c.oui.blockSize != null
		},

		{
			key: 'blockRange',
			label: 'Address Range',
			icon: 'server',
			render: (c) => `${c.oui.blockStart}-${c.oui.blockEnd}`,
			valueClass: () => 'range',
			condition: (c) => !!(c.oui.blockStart && c.oui.blockEnd)
		},

		{
			key: 'isPrivate',
			label: 'Registry Status',
			icon: 'shield',
			render: (c) => c.oui.isPrivate ? 'Private' : 'Public',
			condition: (c) => c.oui.isPrivate != null
		},

		{
			key: 'updated',
			label: 'Last Updated',
			icon: 'clock',
			render: (c) => c.oui.updated ? new Date(c.oui.updated).toLocaleDateString() : 'N/A',
			condition: (c) => !!c.oui.updated
		},

		{
			key: 'address',
			label: 'Address',
			icon: 'map-pin',
			render: (c) => c.oui.address || 'N/A',
			class: 'address-item',
			condition: (c) => !!c.oui.address
		}
	];

	const detailFields = [
		{ label: 'Universal Address', key: 'isUniversal' },
		{
			label: 'Locally Administered',
			key: 'isUniversal',
			invert: true
		},
		{ label: 'Unicast', key: 'isUnicast' },
		{ label: 'Multicast/Broadcast', key: 'isUnicast', invert: true }
	];

	const formatFields = [
		{
			key: 'colon',
			label: 'Colon Notation',
			tooltip: 'Standard IEEE notation; most Linux, BSD, macOS use this'
		},

		{
			key: 'hyphen',
			label: 'Hyphen Notation',
			tooltip: 'Common on Windows systems'
		},

		{
			key: 'cisco',
			label: 'Cisco (Dot) Notation',
			tooltip: 'Cisco IOS / NX-OS style'
		},

		{
			key: 'bareUppercase',
			label: 'Bare (Uppercase)',
			tooltip: 'Common in databases, APIs'
		},

		{
			key: 'bareLowercase',
			label: 'Bare (Lowercase)',
			tooltip: 'Common in scripts, JSON, etc.'
		},

		{
			key: 'eui64',
			label: 'EUI-64 (expanded form)',
			tooltip: 'Used when converting MAC → IPv6 Interface ID (adds FFFE in the middle, flips the U/L bit)'
		},

		{
			key: 'ipv6Style',
			label: 'Dot-separated 2-byte groups',
			tooltip: 'Occasionally seen in debugging or tools that mimic IPv6 notation'
		},

		{
			key: 'spaceSeparated',
			label: 'Space-separated pairs',
			tooltip: 'Sometimes seen in hex dumps or firmware logs'
		},

		{
			key: 'decimalOctets',
			label: 'Decimal octets',
			tooltip: 'Rare, but some diagnostic tools display MACs in decimal'
		},

		{
			key: 'prefixedMac',
			label: 'Prefixed (MAC=)',
			tooltip: 'Seen in configuration files or CLI outputs'
		},

		{
			key: 'slashSeparated',
			label: 'Slash-separated',
			tooltip: 'Seen in some telecom equipment or SNMP exports'
		},

		{
			key: 'prefixedBare',
			label: 'Prefixed bare (MAC)',
			tooltip: 'Appears in certain JSON/CSV exports or proprietary APIs'
		},

		{
			key: 'prefixedAddr',
			label: 'Prefixed bare (addr)',
			tooltip: 'Appears in certain JSON/CSV exports or proprietary APIs'
		},

		{
			key: 'binary',
			label: 'Binary (8-bit groups)',
			tooltip: 'Rare, but useful for bit-level inspection',
			binary: true,
			class: 'binary-item'
		}
	];

	const blockTypeTooltips = {
		'MA-L': 'Large block: 16.7 million addresses (24-bit prefix)',
		'MA-M': 'Medium block: 1 million addresses (28-bit prefix)',
		'MA-S': 'Small block: 4,096 addresses (36-bit prefix)',
		CID: 'Company ID'
	};

	async function convertAddresses() {
		if (!$.get(inputText).trim()) return $.set(result, null);

		$.set(isLoading, true);

		try {
			$.set(result, await convertMACAddresses($.get(inputText).split('\n').filter((line) => line.trim())), true);
		} finally {
			$.set(isLoading, false);
		}
	}

	function toggleMode() {
		$.set(isBulkMode, !$.get(isBulkMode));
		$.set(result, null);
		$.set(selectedExampleIndex, null);

		$.set(
			inputText,
			$.get(isBulkMode)
				? '00:1A:2B:3C:4D:5E\n00-50-56-C0-00-08\n001A.2B3C.4D5E\n001b632b4567'
				: '00:1A:2B:3C:4D:5E',
			true
		);
	}

	async function copyToClipboard(text, id = text) {
		try {
			await navigator.clipboard.writeText(text);
			copiedStates[id] = true;
			setTimeout(() => copiedStates[id] = false, 2000);
		} catch(err) {
			console.error('Failed to copy:', err);
		}
	}

	function exportResults(format) {
		if (!$.get(result)) return;

		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');

		if (format === 'csv') {
			const headers = 'Input,Valid,Colon Format,Hyphen Format,Cisco Format,Bare,OUI,Manufacturer,Universal,Unicast';
			const rows = $.get(result).conversions.map((c) => `"${c.input}","${c.isValid}","${c.formats.colon}","${c.formats.hyphen}","${c.formats.cisco}","${c.formats.bare}","${c.oui.oui}","${c.oui.manufacturer || 'Unknown'}","${c.details.isUniversal}","${c.details.isUnicast}"`);

			downloadFile([headers, ...rows].join('\n'), `mac-addresses-${timestamp}.csv`, 'text/csv');
		} else {
			downloadFile(JSON.stringify($.get(result), null, 2), `mac-addresses-${timestamp}.json`, 'application/json');
		}
	}

	function downloadFile(content, filename, type) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	const getBlockTypeTooltip = (blockType) => blockTypeTooltips[blockType] || blockType;
	const handleSubmit = (e) => (e?.preventDefault(), convertAddresses());

	const loadExample = (example, index) => (
		$.set(inputText, example.mac, true),
		$.set(selectedExampleIndex, index, true),
		$.set(isBulkMode, false),
		handleSubmit()
	);

	const clearExampleSelection = () => $.set(selectedExampleIndex, null);
	var fragment = root_21();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var h3 = $.child(div_3);
	var text_1 = $.only_child(h3);
	var button = $.sibling(h3, 2);
	var node = $.child(button);

	{
		let $0 = $.derived(() => $.get(isBulkMode) ? 'layers' : 'file');

		Icon(node, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_2 = $.sibling(node);

	$.reset(button);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var label = $.first_child(fragment_1);

			$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
				text: 'Enter multiple MAC addresses, one per line',
				position: 'top'
			}));

			var textarea = $.sibling(label, 2);

			$.remove_textarea_child(textarea);

			var button_1 = $.sibling(textarea, 4);
			var node_2 = $.child(button_1);

			{
				let $0 = $.derived(() => $.get(isLoading) ? 'loader' : 'search');

				Icon(node_2, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_3 = $.sibling(node_2);

			$.reset(button_1);

			$.template_effect(
				($0) => {
					button_1.disabled = $0;
					$.set_text(text_3, ` ${$.get(isLoading) ? 'Looking up...' : 'Lookup'}`);
				},
				[() => $.get(isLoading) || !$.get(inputText).trim()]
			);

			$.delegated('keydown', textarea, (e) => {
				if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
					handleSubmit();
				}
			});

			$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
			$.delegated('click', button_1, handleSubmit);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_1();
			var label_1 = $.first_child(fragment_2);

			$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
				text: 'Enter MAC address in any format: colon, hyphen, dot notation, or bare',
				position: 'top'
			}));

			var div_5 = $.sibling(label_1, 2);
			var input = $.child(div_5);

			$.remove_input_defaults(input);

			var button_2 = $.sibling(input, 2);
			var node_3 = $.child(button_2);

			{
				let $0 = $.derived(() => $.get(isLoading) ? 'loader' : 'search');

				Icon(node_3, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_4 = $.sibling(node_3);

			$.reset(button_2);
			$.reset(div_5);
			$.next(2);

			$.template_effect(
				($0) => {
					button_2.disabled = $0;
					$.set_text(text_4, ` ${$.get(isLoading) ? 'Looking up...' : 'Lookup'}`);
				},
				[() => $.get(isLoading) || !$.get(inputText).trim()]
			);

			$.delegated('input', input, clearExampleSelection);

			$.delegated('keydown', input, (e) => {
				if (e.key === 'Enter') {
					handleSubmit();
				}
			});

			$.bind_value(input, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
			$.delegated('click', button_2, handleSubmit);
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isBulkMode)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_4 = $.child(summary);

	Icon(node_4, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button_3 = root_2();
		let classes;
		var h5 = $.child(button_3);
		var text_5 = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_6 = $.only_child(p, true);

		$.reset(button_3);
		$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(example).description);

		$.template_effect(() => {
			classes = $.set_class(button_3, 1, 'example-card svelte-1g3qxzr', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text_5, $.get(example).mac);
			$.set_text(text_6, $.get(example).vendor);
		});

		$.delegated('click', button_3, () => loadExample($.get(example), i));
		$.append($$anchor, button_3);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var node_5 = $.sibling(div_6, 2);

	{
		var consequent_14 = ($$anchor) => {
			var div_8 = root_16();
			var node_6 = $.child(div_8);

			{
				var consequent_13 = ($$anchor) => {
					var fragment_3 = root_15();
					var div_9 = $.first_child(fragment_3);
					var div_10 = $.child(div_9);
					var h3_1 = $.child(div_10);
					var text_7 = $.only_child(h3_1, true);
					var node_7 = $.sibling(h3_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_11 = root_3();
							var button_4 = $.child(div_11);
							var node_8 = $.child(button_4);

							Icon(node_8, { name: 'download' });
							$.next();
							$.reset(button_4);

							var button_5 = $.sibling(button_4, 2);
							var node_9 = $.child(button_5);

							Icon(node_9, { name: 'download' });
							$.next();
							$.reset(button_5);
							$.reset(div_11);
							$.delegated('click', button_4, () => exportResults('csv'));
							$.delegated('click', button_5, () => exportResults('json'));
							$.append($$anchor, div_11);
						};

						$.if(node_7, ($$render) => {
							if ($.get(result).conversions.length > 1) $$render(consequent_1);
						});
					}

					$.reset(div_10);

					var node_10 = $.sibling(div_10, 2);

					$.each(node_10, 17, () => $.get(result).conversions, (conversion) => conversion.input, ($$anchor, conversion) => {
						var div_12 = root_13();
						let classes_1;
						var node_11 = $.child(div_12);

						{
							var consequent_3 = ($$anchor) => {
								var div_13 = root_5();
								var div_14 = $.child(div_13);
								var node_12 = $.child(div_14);

								{
									let $0 = $.derived(() => $.get(conversion).isValid ? 'check-circle' : 'x-circle');

									Icon(node_12, {
										get name() {
											return $.get($0);
										}
									});
								}

								var code = $.sibling(node_12, 2);
								var text_8 = $.only_child(code, true);

								$.reset(div_14);

								var node_13 = $.sibling(div_14, 2);

								{
									var consequent_2 = ($$anchor) => {
										var div_15 = root_4();
										var text_9 = $.only_child(div_15, true);

										$.template_effect(() => $.set_text(text_9, $.get(conversion).error));
										$.append($$anchor, div_15);
									};

									$.if(node_13, ($$render) => {
										if ($.get(conversion).error) $$render(consequent_2);
									});
								}

								$.reset(div_13);
								$.template_effect(() => $.set_text(text_8, $.get(conversion).input));
								$.append($$anchor, div_13);
							};

							var consequent_5 = ($$anchor) => {
								var div_16 = root_6();
								var div_17 = $.child(div_16);
								var node_14 = $.child(div_17);

								Icon(node_14, { name: 'x-circle' });
								$.next(2);
								$.reset(div_17);

								var node_15 = $.sibling(div_17, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_18 = root_4();
										var text_10 = $.only_child(div_18, true);

										$.template_effect(() => $.set_text(text_10, $.get(conversion).error));
										$.append($$anchor, div_18);
									};

									$.if(node_15, ($$render) => {
										if ($.get(conversion).error) $$render(consequent_4);
									});
								}

								$.reset(div_16);
								$.append($$anchor, div_16);
							};

							$.if(node_11, ($$render) => {
								if ($.get(result).conversions.length > 1) $$render(consequent_3); else if (!$.get(conversion).isValid) $$render(consequent_5, 1);
							});
						}

						var node_16 = $.sibling(node_11, 2);

						{
							var consequent_11 = ($$anchor) => {
								var fragment_4 = root_12();
								var div_19 = $.first_child(fragment_4);
								var div_20 = $.sibling($.child(div_19), 2);

								$.each(div_20, 21, () => ouiFields, (field) => field.key, ($$anchor, field) => {
									const value = $.derived(() => $.get(field).render($.get(conversion)));
									var fragment_5 = $.comment();
									var node_17 = $.first_child(fragment_5);

									{
										var consequent_10 = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_18 = $.first_child(fragment_6);

											{
												var consequent_9 = ($$anchor) => {
													var div_21 = root_9();
													var node_19 = $.child(div_21);

													{
														let $0 = $.derived(() => typeof $.get(field).icon === 'function'
															? $.get(field).icon($.get(conversion))
															: $.get(field).icon);

														Icon(node_19, {
															get name() {
																return $.get($0);
															},
															size: 'md'
														});
													}

													var div_22 = $.sibling(node_19, 2);
													var span = $.child(div_22);
													var text_11 = $.only_child(span, true);
													var node_20 = $.sibling(span, 2);

													{
														var consequent_7 = ($$anchor) => {
															var fragment_7 = $.comment();
															var node_21 = $.first_child(fragment_7);

															{
																var consequent_6 = ($$anchor) => {
																	var code_1 = root_7();
																	var text_12 = $.only_child(code_1, true);

																	$.action(code_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
																		text: $.get(field).tooltip($.get(conversion)),
																		position: 'top'
																	}));

																	$.template_effect(
																		($0) => {
																			$.set_class(code_1, 1, `oui-value ${$0 ?? ''}`, 'svelte-1g3qxzr');
																			$.set_text(text_12, $.get(value));
																		},
																		[() => $.get(field).valueClass?.($.get(conversion)) || '']
																	);

																	$.append($$anchor, code_1);
																};

																var alternate_1 = ($$anchor) => {
																	var code_2 = root_7();
																	var text_13 = $.only_child(code_2, true);

																	$.template_effect(
																		($0) => {
																			$.set_class(code_2, 1, `oui-value ${$0 ?? ''}`, 'svelte-1g3qxzr');
																			$.set_text(text_13, $.get(value));
																		},
																		[() => $.get(field).valueClass?.($.get(conversion)) || '']
																	);

																	$.append($$anchor, code_2);
																};

																$.if(node_21, ($$render) => {
																	if ($.get(field).tooltip) $$render(consequent_6); else $$render(alternate_1, -1);
																});
															}

															$.append($$anchor, fragment_7);
														};

														var consequent_8 = ($$anchor) => {
															var span_1 = root_8();
															var text_14 = $.only_child(span_1, true);

															$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
																text: $.get(field).tooltip($.get(conversion)),
																position: 'top'
															}));

															$.template_effect(
																($0) => {
																	$.set_class(span_1, 1, `oui-value ${$0 ?? ''}`, 'svelte-1g3qxzr');
																	$.set_text(text_14, $.get(value));
																},
																[() => $.get(field).valueClass?.($.get(conversion)) || '']
															);

															$.append($$anchor, span_1);
														};

														var alternate_2 = ($$anchor) => {
															var span_2 = root_8();
															var text_15 = $.only_child(span_2, true);

															$.template_effect(
																($0) => {
																	$.set_class(span_2, 1, `oui-value ${$0 ?? ''}`, 'svelte-1g3qxzr');
																	$.set_text(text_15, $.get(value));
																},
																[() => $.get(field).valueClass?.($.get(conversion)) || '']
															);

															$.append($$anchor, span_2);
														};

														$.if(node_20, ($$render) => {
															if ($.get(field).code) $$render(consequent_7); else if ($.get(field).tooltip) $$render(consequent_8, 1); else $$render(alternate_2, -1);
														});
													}

													$.reset(div_22);
													$.reset(div_21);

													$.template_effect(() => {
														$.set_class(div_21, 1, `oui-item ${($.get(field).class || '') ?? ''}`, 'svelte-1g3qxzr');
														$.set_text(text_11, $.get(field).label);
													});

													$.append($$anchor, div_21);
												};

												$.if(node_18, ($$render) => {
													if ($.get(value) !== undefined && $.get(value) !== null && $.get(value) !== '') $$render(consequent_9);
												});
											}

											$.append($$anchor, fragment_6);
										};

										var d = $.derived(() => !$.get(field).condition || $.get(field).condition($.get(conversion)));

										$.if(node_17, ($$render) => {
											if ($.get(d)) $$render(consequent_10);
										});
									}

									$.append($$anchor, fragment_5);
								});

								$.reset(div_20);
								$.reset(div_19);

								var div_23 = $.sibling(div_19, 2);
								var div_24 = $.sibling($.child(div_23), 2);

								$.each(div_24, 21, () => detailFields, (field) => field.label, ($$anchor, field) => {
									const active = $.derived(() => $.get(field).invert
										? !$.get(conversion).details[$.get(field).key]
										: $.get(conversion).details[$.get(field).key]);

									var div_25 = root_10();
									let classes_2;
									var node_22 = $.child(div_25);

									{
										let $0 = $.derived(() => $.get(active) ? 'check-circle' : 'circle');

										Icon(node_22, {
											get name() {
												return $.get($0);
											}
										});
									}

									var span_3 = $.sibling(node_22, 2);
									var text_16 = $.only_child(span_3, true);

									$.reset(div_25);

									$.template_effect(() => {
										classes_2 = $.set_class(div_25, 1, 'detail-item svelte-1g3qxzr', null, classes_2, { active: $.get(active) });
										$.set_text(text_16, $.get(field).label);
									});

									$.append($$anchor, div_25);
								});

								$.reset(div_24);
								$.reset(div_23);

								var div_26 = $.sibling(div_23, 2);
								var div_27 = $.sibling($.child(div_26), 2);

								$.each(div_27, 21, () => formatFields, (field) => field.key, ($$anchor, field) => {
									const value = $.derived(() => $.get(field).binary
										? $.get(conversion).details.binary
										: $.get(conversion).formats[$.get(field).key]);

									const copyId = $.derived(() => `${$.get(field).key}-${$.get(conversion).input}`);
									var div_28 = root_11();
									var span_4 = $.child(div_28);
									var text_17 = $.only_child(span_4, true);

									$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: $.get(field).tooltip, position: 'top' }));

									var div_29 = $.sibling(span_4, 2);
									let classes_3;
									var code_3 = $.child(div_29);
									let classes_4;
									var text_18 = $.only_child(code_3, true);
									var button_6 = $.sibling(code_3, 2);
									var node_23 = $.child(button_6);

									{
										let $0 = $.derived(() => copiedStates[$.get(copyId)] ? 'check' : 'copy');

										Icon(node_23, {
											get name() {
												return $.get($0);
											}
										});
									}

									$.reset(button_6);
									$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
									$.reset(div_29);
									$.reset(div_28);

									$.template_effect(
										($0) => {
											$.set_class(div_28, 1, `format-item ${($.get(field).class || '') ?? ''}`, 'svelte-1g3qxzr');
											$.set_text(text_17, $.get(field).label);
											classes_3 = $.set_class(div_29, 1, 'format-value svelte-1g3qxzr', null, classes_3, { binary: $.get(field).binary });
											classes_4 = $.set_class(code_3, 1, 'svelte-1g3qxzr', null, classes_4, { 'binary-display': $.get(field).binary });
											$.set_text(text_18, $0);
										},
										[
											() => $.get(field).binary
												? $.get(value).match(/.{1,8}/g)?.join(' ')
												: $.get(value)
										]
									);

									$.delegated('click', button_6, () => copyToClipboard($.get(value), $.get(copyId)));
									$.append($$anchor, div_28);
								});

								$.reset(div_27);
								$.reset(div_26);
								$.append($$anchor, fragment_4);
							};

							$.if(node_16, ($$render) => {
								if ($.get(conversion).isValid) $$render(consequent_11);
							});
						}

						$.reset(div_12);
						$.template_effect(() => classes_1 = $.set_class(div_12, 1, 'conversion-item svelte-1g3qxzr', null, classes_1, { invalid: !$.get(conversion).isValid }));
						$.append($$anchor, div_12);
					});

					$.reset(div_9);

					var node_24 = $.sibling(div_9, 2);

					{
						var consequent_12 = ($$anchor) => {
							var div_30 = root_14();
							var div_31 = $.sibling($.child(div_30), 2);
							var div_32 = $.child(div_31);
							var span_5 = $.child(div_32);
							var text_19 = $.only_child(span_5, true);

							$.next(2);
							$.reset(div_32);

							var div_33 = $.sibling(div_32, 2);
							var span_6 = $.child(div_33);
							var text_20 = $.only_child(span_6, true);

							$.next(2);
							$.reset(div_33);

							var div_34 = $.sibling(div_33, 2);
							var span_7 = $.child(div_34);
							var text_21 = $.only_child(span_7, true);

							$.next(2);
							$.reset(div_34);

							var div_35 = $.sibling(div_34, 2);
							var span_8 = $.child(div_35);
							var text_22 = $.only_child(span_8, true);

							$.next(2);
							$.reset(div_35);
							$.reset(div_31);
							$.reset(div_30);

							$.template_effect(() => {
								$.set_text(text_19, $.get(result).summary.total);
								$.set_text(text_20, $.get(result).summary.valid);
								$.set_text(text_21, $.get(result).summary.invalid);
								$.set_text(text_22, $.get(result).summary.withOUI);
							});

							$.append($$anchor, div_30);
						};

						$.if(node_24, ($$render) => {
							if ($.get(result).conversions.length > 1) $$render(consequent_12);
						});
					}

					$.template_effect(() => $.set_text(text_7, $.get(result).conversions.length === 1 ? 'Address Conversion' : 'Address Conversions'));
					$.append($$anchor, fragment_3);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).conversions.length > 0) $$render(consequent_13);
				});
			}

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_5, ($$render) => {
			if ($.get(result)) $$render(consequent_14);
		});
	}

	$.reset(div);

	var div_36 = $.sibling(div, 2);
	var div_37 = $.sibling($.child(div_36), 2);
	var details_1 = $.child(div_37);
	var summary_1 = $.child(details_1);
	var node_25 = $.child(summary_1);

	Icon(node_25, { name: 'chevron-right', size: 'sm' });

	var h4 = $.sibling(node_25, 2);
	var text_23 = $.only_child(h4, true);

	$.reset(summary_1);

	var div_38 = $.sibling(summary_1, 2);
	var p_1 = $.child(div_38);
	var text_24 = $.only_child(p_1, true);

	$.reset(div_38);
	$.reset(details_1);

	var details_2 = $.sibling(details_1, 2);
	var summary_2 = $.child(details_2);
	var node_26 = $.child(summary_2);

	Icon(node_26, { name: 'chevron-right', size: 'sm' });

	var h4_1 = $.sibling(node_26, 2);
	var text_25 = $.only_child(h4_1, true);

	$.reset(summary_2);

	var div_39 = $.sibling(summary_2, 2);
	var ul = $.child(div_39);

	$.each(ul, 21, () => macAddressContent.sections.structure.components, (comp) => comp.component, ($$anchor, comp) => {
		var li = root_17();
		var strong = $.child(li);
		var text_26 = $.only_child(strong);
		var text_27 = $.sibling(strong);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text_26, `${$.get(comp).component ?? ''}:`);
			$.set_text(text_27, ` ${$.get(comp).description ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);

	var p_2 = $.sibling(ul, 2);
	var code_4 = $.sibling($.child(p_2), 2);
	var text_28 = $.only_child(code_4, true);
	var span_9 = $.sibling(code_4, 3);

	$.each(span_9, 20, () => macAddressContent.sections.structure.example.breakdown, (line) => line, ($$anchor, line) => {
		$.next();

		var fragment_8 = root_18();
		var text_29 = $.first_child(fragment_8);

		$.next();
		$.template_effect(() => $.set_text(text_29, `• ${line ?? ''}`));
		$.append($$anchor, fragment_8);
	});

	$.reset(span_9);
	$.reset(p_2);
	$.reset(div_39);
	$.reset(details_2);

	var details_3 = $.sibling(details_2, 2);
	var summary_3 = $.child(details_3);
	var node_27 = $.child(summary_3);

	Icon(node_27, { name: 'chevron-right', size: 'sm' });

	var h4_2 = $.sibling(node_27, 2);
	var text_30 = $.only_child(h4_2, true);

	$.reset(summary_3);

	var div_40 = $.sibling(summary_3, 2);
	var ul_1 = $.child(div_40);

	$.each(ul_1, 21, () => macAddressContent.sections.addressTypes.types, (type) => type.type, ($$anchor, type) => {
		var li_1 = root_17();
		var strong_1 = $.child(li_1);
		var text_31 = $.only_child(strong_1);
		var text_32 = $.sibling(strong_1);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_31, `${$.get(type).type ?? ''}:`);
			$.set_text(text_32, ` ${$.get(type).description ?? ''}`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_40);
	$.reset(details_3);

	var details_4 = $.sibling(details_3, 2);
	var summary_4 = $.child(details_4);
	var node_28 = $.child(summary_4);

	Icon(node_28, { name: 'chevron-right', size: 'sm' });

	var h4_3 = $.sibling(node_28, 2);
	var text_33 = $.only_child(h4_3, true);

	$.reset(summary_4);

	var div_41 = $.sibling(summary_4, 2);
	var ul_2 = $.child(div_41);

	$.each(ul_2, 21, () => macAddressContent.sections.formats.formats, (fmt) => fmt.format, ($$anchor, fmt) => {
		var li_2 = root_19();
		var strong_2 = $.child(li_2);
		var text_34 = $.only_child(strong_2);
		var code_5 = $.sibling(strong_2, 2);
		var text_35 = $.only_child(code_5, true);
		var text_36 = $.sibling(code_5);

		$.reset(li_2);

		$.template_effect(() => {
			$.set_text(text_34, `${$.get(fmt).format ?? ''}:`);
			$.set_text(text_35, $.get(fmt).example);
			$.set_text(text_36, ` - ${$.get(fmt).usage ?? ''}`);
		});

		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_41);
	$.reset(details_4);

	var details_5 = $.sibling(details_4, 2);
	var summary_5 = $.child(details_5);
	var node_29 = $.child(summary_5);

	Icon(node_29, { name: 'chevron-right', size: 'sm' });

	var h4_4 = $.sibling(node_29, 2);
	var text_37 = $.only_child(h4_4, true);

	$.reset(summary_5);

	var div_42 = $.sibling(summary_5, 2);
	var p_3 = $.child(div_42);
	var text_38 = $.only_child(p_3, true);
	var ul_3 = $.sibling(p_3, 2);

	$.each(ul_3, 21, () => macAddressContent.sections.ouiLookup.blockTypes, (block) => block.type, ($$anchor, block) => {
		var li_3 = root_17();
		var strong_3 = $.child(li_3);
		var text_39 = $.only_child(strong_3);
		var text_40 = $.sibling(strong_3);

		$.reset(li_3);

		$.template_effect(() => {
			$.set_text(text_39, `${$.get(block).type ?? ''}:`);
			$.set_text(text_40, ` ${$.get(block).description ?? ''}`);
		});

		$.append($$anchor, li_3);
	});

	$.reset(ul_3);

	var p_4 = $.sibling(ul_3, 2);
	var text_41 = $.only_child(p_4, true);

	$.reset(div_42);
	$.reset(details_5);

	var details_6 = $.sibling(details_5, 2);
	var summary_6 = $.child(details_6);
	var node_30 = $.child(summary_6);

	Icon(node_30, { name: 'chevron-right', size: 'sm' });

	var h4_5 = $.sibling(node_30, 2);
	var text_42 = $.only_child(h4_5, true);

	$.reset(summary_6);

	var div_43 = $.sibling(summary_6, 2);
	var ul_4 = $.child(div_43);

	$.each(ul_4, 21, () => macAddressContent.sections.specialAddresses.addresses, (addr) => addr.type, ($$anchor, addr) => {
		var li_4 = root_19();
		var strong_4 = $.child(li_4);
		var text_43 = $.only_child(strong_4);
		var code_6 = $.sibling(strong_4, 2);
		var text_44 = $.only_child(code_6, true);
		var text_45 = $.sibling(code_6);

		$.reset(li_4);

		$.template_effect(() => {
			$.set_text(text_43, `${$.get(addr).type ?? ''}:`);
			$.set_text(text_44, $.get(addr).address);
			$.set_text(text_45, ` - ${$.get(addr).description ?? ''}`);
		});

		$.append($$anchor, li_4);
	});

	$.reset(ul_4);
	$.reset(div_43);
	$.reset(details_6);

	var details_7 = $.sibling(details_6, 2);
	var summary_7 = $.child(details_7);
	var node_31 = $.child(summary_7);

	Icon(node_31, { name: 'chevron-right', size: 'sm' });

	var h4_6 = $.sibling(node_31, 2);
	var text_46 = $.only_child(h4_6, true);

	$.reset(summary_7);

	var div_44 = $.sibling(summary_7, 2);
	var ul_5 = $.child(div_44);

	$.each(ul_5, 21, () => macAddressContent.sections.useCases.cases, (useCase) => useCase.useCase, ($$anchor, useCase) => {
		var li_5 = root_17();
		var strong_5 = $.child(li_5);
		var text_47 = $.only_child(strong_5);
		var text_48 = $.sibling(strong_5);

		$.reset(li_5);

		$.template_effect(() => {
			$.set_text(text_47, `${$.get(useCase).useCase ?? ''}:`);
			$.set_text(text_48, ` ${$.get(useCase).description ?? ''}`);
		});

		$.append($$anchor, li_5);
	});

	$.reset(ul_5);
	$.reset(div_44);
	$.reset(details_7);

	var details_8 = $.sibling(details_7, 2);
	var summary_8 = $.child(details_8);
	var node_32 = $.child(summary_8);

	Icon(node_32, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary_8);

	var div_45 = $.sibling(summary_8, 2);
	var ul_6 = $.child(div_45);

	$.each(ul_6, 20, () => macAddressContent.quickTips, (tip) => tip, ($$anchor, tip) => {
		var li_6 = root_20();
		var text_49 = $.only_child(li_6, true);

		$.template_effect(() => $.set_text(text_49, tip));
		$.append($$anchor, li_6);
	});

	$.reset(ul_6);
	$.reset(div_45);
	$.reset(details_8);
	$.reset(div_37);
	$.reset(div_36);

	$.template_effect(() => {
		$.set_text(text_1, `MAC Address${$.get(isBulkMode) ? 'es' : ''}`);
		$.set_text(text_2, ` ${$.get(isBulkMode) ? 'Switch to Single' : 'Switch to Bulk'}`);
		$.set_text(text_23, macAddressContent.sections.whatIsMAC.title);
		$.set_text(text_24, macAddressContent.sections.whatIsMAC.content);
		$.set_text(text_25, macAddressContent.sections.structure.title);
		$.set_text(text_28, macAddressContent.sections.structure.example.address);
		$.set_text(text_30, macAddressContent.sections.addressTypes.title);
		$.set_text(text_33, macAddressContent.sections.formats.title);
		$.set_text(text_37, macAddressContent.sections.ouiLookup.title);
		$.set_text(text_38, macAddressContent.sections.ouiLookup.content);
		$.set_text(text_41, macAddressContent.sections.ouiLookup.lookupInfo);
		$.set_text(text_42, macAddressContent.sections.specialAddresses.title);
		$.set_text(text_46, macAddressContent.sections.useCases.title);
	});

	$.delegated('click', button, toggleMode);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'input']);