import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Copy, Download, Check, Globe, Type } from 'lucide-svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button class="example-btn svelte-2q20du"><div class="example-domain svelte-2q20du"> </div> <div class="example-desc svelte-2q20du"> </div></button>`);
var root_1 = $.from_html(`<button class="swap-btn svelte-2q20du"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="svelte-2q20du"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Reverse</button>`);
var root_2 = $.from_html(`<pre> </pre>`);
var root_3 = $.from_html(`<p class="error-text svelte-2q20du"> </p>`);
var root_4 = $.from_html(`<p class="placeholder-text svelte-2q20du">Enter a domain name to see the conversion result</p>`);
var root_5 = $.from_html(`<li class="svelte-2q20du"> </li>`);
var root_6 = $.from_html(`<div class="alert alert-warning svelte-2q20du"><h4 class="svelte-2q20du">Notices</h4> <ul class="svelte-2q20du"></ul></div>`);
var root_7 = $.from_html(`<!> Copied!`, 1);
var root_8 = $.from_html(`<!> Copy Result`, 1);
var root_9 = $.from_html(`<!> Downloaded!`, 1);
var root_10 = $.from_html(`<!> Download`, 1);
var root_11 = $.from_html(`<div class="button-group svelte-2q20du"><button><!></button> <button><!></button></div>`);

var root_12 = $.from_html(`<div class="idn-converter svelte-2q20du"><div class="card svelte-2q20du"><div class="card-header svelte-2q20du"><h1 class="svelte-2q20du">IDN Punycode Converter</h1> <p class="svelte-2q20du">Convert between Unicode domain names and Punycode (ASCII-compatible encoding)</p></div> <div class="card-content"><div class="mode-toggle svelte-2q20du"><div class="toggle-container svelte-2q20du"><button><!> Unicode → Punycode</button> <button><!> Punycode → Unicode</button></div></div> <details class="examples-section svelte-2q20du"><summary class="svelte-2q20du"><div class="summary-content svelte-2q20du"><!> <span>Example Domains</span></div> <svg class="chevron svelte-2q20du" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></summary> <div class="examples-grid svelte-2q20du"></div></details> <div class="conversion-card svelte-2q20du"><div class="conversion-header svelte-2q20du"><h2 class="svelte-2q20du"> </h2></div> <div class="conversion-grid svelte-2q20du"><div class="input-card svelte-2q20du"><div class="input-section svelte-2q20du"><label for="input" class="svelte-2q20du"> </label> <textarea id="input" rows="4"></textarea> <small class="svelte-2q20du"> </small></div></div> <div class="output-card svelte-2q20du"><div class="output-section svelte-2q20du"><div class="output-header svelte-2q20du"><h3> </h3> <!></div> <div class="output-display svelte-2q20du"><!></div> <!> <!></div></div></div></div> <div class="info-section svelte-2q20du"><div class="card info-card svelte-2q20du"><h3 class="svelte-2q20du">About IDN and Punycode</h3> <p class="svelte-2q20du">Internationalized Domain Names (IDN) allow domain names to contain Unicode characters from various scripts
            and languages. Punycode is the ASCII-compatible encoding that represents Unicode domain labels, allowing
            non-ASCII domain names to work with existing DNS infrastructure.</p></div> <div class="info-grid svelte-2q20du"><div class="card svelte-2q20du"><h4 class="svelte-2q20du">How Punycode Works</h4> <div class="punycode-example svelte-2q20du"><p class="svelte-2q20du">Each Unicode label is encoded separately:</p> <div class="code-example svelte-2q20du"><div class="svelte-2q20du"><strong class="svelte-2q20du">Unicode:</strong> <span class="unicode-text svelte-2q20du">münchen</span></div> <div class="svelte-2q20du"><strong class="svelte-2q20du">Encoded:</strong> <span class="encoded-text svelte-2q20du">mnchen-3ya</span></div> <div class="svelte-2q20du"><strong class="svelte-2q20du">Final:</strong> <span class="final-text svelte-2q20du">xn--mnchen-3ya</span></div></div> <small class="svelte-2q20du">The <code class="svelte-2q20du">xn--</code> prefix identifies punycode labels</small></div></div> <div class="card svelte-2q20du"><h4 class="svelte-2q20du">Common Use Cases</h4> <ul class="use-cases svelte-2q20du"><li class="svelte-2q20du">International domain registration</li> <li class="svelte-2q20du">Email address internationalization</li> <li class="svelte-2q20du">DNS configuration</li> <li class="svelte-2q20du">Web application development</li> <li class="svelte-2q20du">Security analysis</li></ul></div> <div class="card svelte-2q20du"><h4 class="svelte-2q20du">Supported Features</h4> <ul class="features svelte-2q20du"><li class="svelte-2q20du">RFC 3492 compliant Punycode encoding/decoding</li> <li class="svelte-2q20du">Bidirectional conversion (Unicode ↔ Punycode)</li> <li class="svelte-2q20du">Multiple domain labels support</li> <li class="svelte-2q20du">Mixed ASCII/Unicode domain handling</li></ul></div> <div class="card security-card svelte-2q20du"><h4 class="svelte-2q20du">Security Considerations</h4> <ul class="security-list svelte-2q20du"><li class="svelte-2q20du"><strong>Homograph attacks:</strong> visually similar characters from different scripts</li> <li class="svelte-2q20du">Always validate and normalize IDN input in applications</li> <li class="svelte-2q20du">Consider implementing mixed-script detection</li> <li class="svelte-2q20du">Be aware of browser IDN display policies</li></ul></div></div></div></div></div></div>`);

export default function IDNPunycodeConverter($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('');
	let mode = $.state('unicode-to-punycode');
	let showExamples = $.state(false);
	const clipboard = useClipboard();

	const domainExamples = [
		{
			unicode: 'münchen.de',
			punycode: 'xn--mnchen-3ya.de',
			description: 'German city domain'
		},

		{
			unicode: '日本.jp',
			punycode: 'xn--wgbl6a.jp',
			description: 'Japanese domain'
		},

		{
			unicode: 'россия.рф',
			punycode: 'xn--h1alffa9f.xn--p1ai',
			description: 'Russian domain'
		},

		{
			unicode: 'العربية.net',
			punycode: 'xn--mgbah1a3hjkrd.net',
			description: 'Arabic domain'
		},

		{
			unicode: '한국.kr',
			punycode: 'xn--3e0b707e.kr',
			description: 'Korean domain'
		},

		{
			unicode: 'ελληνικά.gr',
			punycode: 'xn--hxajbheg2az3al.gr',
			description: 'Greek domain'
		}
	];

	// Punycode implementation based on RFC 3492
	function punycodeDecode(input) {
		const BASE = 36;
		const TMIN = 1;
		const TMAX = 26;
		const SKEW = 38;
		const DAMP = 700;
		const INITIAL_BIAS = 72;
		const INITIAL_N = 128;

		function adapt(delta, numPoints, firstTime) {
			delta = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
			delta += Math.floor(delta / numPoints);

			let k = 0;

			while (delta > (BASE - TMIN) * TMAX >> 1) {
				delta = Math.floor(delta / (BASE - TMIN));
				k += BASE;
			}

			return k + Math.floor((BASE - TMIN + 1) * delta / (delta + SKEW));
		}

		function decode(input) {
			let n = INITIAL_N;
			let i = 0;
			let bias = INITIAL_BIAS;
			const output = [];
			let basic = input.lastIndexOf('-');

			if (basic < 0) basic = 0;

			for (let j = 0; j < basic; ++j) {
				const cp = input.charCodeAt(j);

				if (cp >= 128) throw new Error('Not-basic');

				output.push(cp);
			}

			for (let index = basic > 0 ? basic + 1 : 0; index < input.length; ) {
				const oldi = i;
				let w = 1;

				for (let k = BASE; ; k += BASE) {
					if (index >= input.length) throw new Error('Invalid');

					const digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= BASE) throw new Error('Invalid');
					if (digit > Math.floor((0x7fffffff - i) / w)) throw new Error('Overflow');

					i += digit * w;

					const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;

					if (digit < t) break;
					if (w > Math.floor(0x7fffffff / (BASE - t))) throw new Error('Overflow');

					w *= BASE - t;
				}

				const out = output.length + 1;

				bias = adapt(i - oldi, out, oldi === 0);

				if (Math.floor(i / out) > 0x7fffffff - n) throw new Error('Overflow');

				n += Math.floor(i / out);
				i %= out;
				output.splice(i++, 0, n);
			}

			return String.fromCodePoint(...output);
		}

		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) return codePoint - 22;
			if (codePoint - 65 < 26) return codePoint - 65;
			if (codePoint - 97 < 26) return codePoint - 97;

			return BASE;
		}

		return decode(input);
	}

	function punycodeEncode(input) {
		const BASE = 36;
		const TMIN = 1;
		const TMAX = 26;
		const SKEW = 38;
		const DAMP = 700;
		const INITIAL_BIAS = 72;
		const INITIAL_N = 128;

		function adapt(delta, numPoints, firstTime) {
			delta = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
			delta += Math.floor(delta / numPoints);

			let k = 0;

			while (delta > (BASE - TMIN) * TMAX >> 1) {
				delta = Math.floor(delta / (BASE - TMIN));
				k += BASE;
			}

			return k + Math.floor((BASE - TMIN + 1) * delta / (delta + SKEW));
		}

		function digitToBasic(digit) {
			return digit + 22 + (digit < 26 ? 75 : 0);
		}

		function encode(input) {
			const codePoints = Array.from(input).map((char) => char.codePointAt(0) || 0);
			let n = INITIAL_N;
			let delta = 0;
			let bias = INITIAL_BIAS;
			const basic = codePoints.filter((cp) => cp < 128);
			const output = basic.map((cp) => String.fromCodePoint(cp));
			let h = basic.length;
			const b = h;

			if (b > 0) output.push('-');

			while (h < codePoints.length) {
				let m = 0x7fffffff;

				for (const cp of codePoints) {
					if (cp >= n && cp < m) m = cp;
				}

				if (m - n > Math.floor((0x7fffffff - delta) / (h + 1))) throw new Error('Overflow');

				delta += (m - n) * (h + 1);
				n = m;

				for (const cp of codePoints) {
					if (cp < n && ++delta === 0) throw new Error('Overflow');

					if (cp === n) {
						let q = delta;

						for (let k = BASE; ; k += BASE) {
							const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;

							if (q < t) break;

							output.push(String.fromCodePoint(digitToBasic(t + (q - t) % (BASE - t))));
							q = Math.floor((q - t) / (BASE - t));
						}

						output.push(String.fromCodePoint(digitToBasic(q)));
						bias = adapt(delta, h + 1, h === b);
						delta = 0;
						++h;
					}
				}

				++delta;
				++n;
			}

			return output.join('');
		}

		return encode(input);
	}

	function convertDomain(domain, toPunycode) {
		const parts = domain.split('.');

		return parts.map((part) => {
			if (!part) return part;

			try {
				if (toPunycode) {
					// Check if part contains non-ASCII characters
					if (!(/^[\x20-\x7F]*$/).test(part)) {
						const encoded = punycodeEncode(part);

						return `xn--${encoded}`;
					}

					return part;
				} else {
					// Decode punycode
					if (part.startsWith('xn--')) {
						return punycodeDecode(part.substring(4));
					}

					return part;
				}
			} catch {
				return part; // Return original if conversion fails
			}
		}).join('.');
	}

	let result = $.derived(() => {
		if (!$.get(inputText).trim()) return '';

		try {
			if ($.get(mode) === 'unicode-to-punycode') {
				return convertDomain($.get(inputText).trim(), true);
			} else {
				return convertDomain($.get(inputText).trim(), false);
			}
		} catch {
			return 'Error: Invalid input';
		}
	});

	let isValid = $.derived(() => {
		return $.get(inputText).trim() !== '' && $.get(result) !== '' && !$.get(result).startsWith('Error:');
	});

	let warnings = $.derived(() => {
		const warns = [];

		if ($.get(mode) === 'unicode-to-punycode') {
			if ($.get(inputText) && !(/[\u0080-\uFFFF]/).test($.get(inputText))) {
				warns.push('Input contains only ASCII characters - no conversion needed');
			}
		} else {
			if ($.get(inputText) && !$.get(inputText).includes('xn--')) {
				warns.push('Input does not contain punycode domains (xn-- prefix)');
			}
		}

		if ($.get(inputText).length > 253) {
			warns.push('Domain name exceeds maximum length of 253 characters');
		}

		return warns;
	});

	function copyToClipboard() {
		clipboard.copy($.get(result), 'copy');
	}

	function downloadResult() {
		const content = `Input: ${$.get(inputText)}\nOutput: ${$.get(result)}\n\nConversion: ${$.get(mode) === 'unicode-to-punycode' ? 'Unicode → Punycode' : 'Punycode → Unicode'}`;
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `idn-conversion.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('downloaded', 'download');
	}

	function loadExample(example) {
		if ($.get(mode) === 'unicode-to-punycode') {
			$.set(inputText, example.unicode, true);
		} else {
			$.set(inputText, example.punycode, true);
		}
	}

	function swapModeAndContent() {
		if ($.get(isValid)) {
			const _temp = $.get(inputText);

			$.set(inputText, $.get(result), true);
			$.set(mode, $.get(mode) === 'unicode-to-punycode' ? 'punycode-to-unicode' : 'unicode-to-punycode', true);
		} else {
			$.set(mode, $.get(mode) === 'unicode-to-punycode' ? 'punycode-to-unicode' : 'unicode-to-punycode', true);
		}
	}

	var div = root_12();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var button = $.child(div_4);
	let classes;
	var node = $.child(button);

	Globe(node, { size: '16' });
	$.next();
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	let classes_1;
	var node_1 = $.child(button_1);

	Type(node_1, { size: '16' });
	$.next();
	$.reset(button_1);
	$.reset(div_4);
	$.reset(div_3);

	var details = $.sibling(div_3, 2);
	var summary = $.child(details);
	var div_5 = $.child(summary);
	var node_2 = $.child(div_5);

	Globe(node_2, { size: '20' });
	$.next(2);
	$.reset(div_5);
	$.next(2);
	$.reset(summary);

	var div_6 = $.sibling(summary, 2);

	$.each(div_6, 21, () => domainExamples, (example) => example.unicode, ($$anchor, example) => {
		var button_2 = root();
		var div_7 = $.child(button_2);
		var text = $.only_child(div_7, true);
		var div_8 = $.sibling(div_7, 2);
		var text_1 = $.only_child(div_8, true);

		$.reset(button_2);

		$.template_effect(() => {
			$.set_text(text, $.get(mode) === 'unicode-to-punycode' ? $.get(example).unicode : $.get(example).punycode);
			$.set_text(text_1, $.get(example).description);
		});

		$.delegated('click', button_2, () => loadExample($.get(example)));
		$.append($$anchor, button_2);
	});

	$.reset(div_6);
	$.reset(details);

	var div_9 = $.sibling(details, 2);
	var div_10 = $.child(div_9);
	var h2 = $.child(div_10);
	var text_2 = $.only_child(h2, true);

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var label = $.child(div_13);
	var text_3 = $.only_child(label, true);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter the domain name you want to convert');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);

	let classes_2;
	var small = $.sibling(textarea, 2);
	var text_4 = $.only_child(small, true);

	$.reset(div_13);
	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.child(div_15);
	var h3 = $.child(div_16);
	var text_5 = $.only_child(h3, true);
	var node_3 = $.sibling(h3, 2);

	{
		var consequent = ($$anchor) => {
			var button_3 = root_1();

			$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Swap input and output');
			$.delegated('click', button_3, swapModeAndContent);
			$.append($$anchor, button_3);
		};

		$.if(node_3, ($$render) => {
			if ($.get(isValid)) $$render(consequent);
		});
	}

	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var node_4 = $.child(div_17);

	{
		var consequent_1 = ($$anchor) => {
			var pre = root_2();
			let classes_3;
			var text_6 = $.only_child(pre, true);

			$.template_effect(() => {
				classes_3 = $.set_class(pre, 1, 'result-text svelte-2q20du', null, classes_3, { 'mono-font': $.get(mode) === 'unicode-to-punycode' });
				$.set_text(text_6, $.get(result));
			});

			$.append($$anchor, pre);
		};

		var consequent_2 = ($$anchor) => {
			var p = root_3();
			var text_7 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_7, $.get(result)));
			$.append($$anchor, p);
		};

		var d = $.derived(() => $.get(result).startsWith('Error:'));

		var alternate = ($$anchor) => {
			var p_1 = root_4();

			$.append($$anchor, p_1);
		};

		$.if(node_4, ($$render) => {
			if ($.get(isValid)) $$render(consequent_1); else if ($.get(d)) $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div_17);

	var node_5 = $.sibling(div_17, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_18 = root_6();
			var ul = $.sibling($.child(div_18), 2);

			$.each(ul, 20, () => $.get(warnings), (warning) => warning, ($$anchor, warning) => {
				var li = root_5();
				var text_8 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_8, warning));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_18);
			$.append($$anchor, div_18);
		};

		$.if(node_5, ($$render) => {
			if ($.get(warnings).length > 0) $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_19 = root_11();
			var button_4 = $.child(div_19);
			let classes_4;
			var node_7 = $.child(button_4);

			{
				var consequent_4 = ($$anchor) => {
					var fragment = root_7();
					var node_8 = $.first_child(fragment);

					Check(node_8, { size: '16' });
					$.next();
					$.append($$anchor, fragment);
				};

				var d_1 = $.derived(() => clipboard.isCopied('copy'));

				var alternate_1 = ($$anchor) => {
					var fragment_1 = root_8();
					var node_9 = $.first_child(fragment_1);

					Copy(node_9, { size: '16' });
					$.next();
					$.append($$anchor, fragment_1);
				};

				$.if(node_7, ($$render) => {
					if ($.get(d_1)) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(button_4);

			var button_5 = $.sibling(button_4, 2);
			let classes_5;
			var node_10 = $.child(button_5);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_9();
					var node_11 = $.first_child(fragment_2);

					Check(node_11, { size: '16' });
					$.next();
					$.append($$anchor, fragment_2);
				};

				var d_2 = $.derived(() => clipboard.isCopied('download'));

				var alternate_2 = ($$anchor) => {
					var fragment_3 = root_10();
					var node_12 = $.first_child(fragment_3);

					Download(node_12, { size: '16' });
					$.next();
					$.append($$anchor, fragment_3);
				};

				$.if(node_10, ($$render) => {
					if ($.get(d_2)) $$render(consequent_5); else $$render(alternate_2, -1);
				});
			}

			$.reset(button_5);
			$.reset(div_19);

			$.template_effect(
				($0, $1, $2, $3) => {
					classes_4 = $.set_class(button_4, 1, 'btn-secondary svelte-2q20du', null, classes_4, { success: $0 });
					$.set_style(button_4, `transform: ${$1 ?? ''}`);
					classes_5 = $.set_class(button_5, 1, 'btn-primary svelte-2q20du', null, classes_5, { success: $2 });
					$.set_style(button_5, `transform: ${$3 ?? ''}`);
				},
				[
					() => clipboard.isCopied('copy'),
					() => clipboard.isCopied('copy') ? 'scale(1.05)' : 'scale(1)',
					() => clipboard.isCopied('download'),
					() => clipboard.isCopied('download') ? 'scale(1.05)' : 'scale(1)'
				]
			);

			$.delegated('click', button_4, copyToClipboard);
			$.delegated('click', button_5, downloadResult);
			$.append($$anchor, div_19);
		};

		$.if(node_6, ($$render) => {
			if ($.get(isValid)) $$render(consequent_6);
		});
	}

	$.reset(div_15);
	$.reset(div_14);
	$.reset(div_11);
	$.reset(div_9);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'toggle-btn svelte-2q20du', null, classes, { active: $.get(mode) === 'unicode-to-punycode' });
		classes_1 = $.set_class(button_1, 1, 'toggle-btn svelte-2q20du', null, classes_1, { active: $.get(mode) === 'punycode-to-unicode' });

		$.set_text(text_2, $.get(mode) === 'unicode-to-punycode'
			? 'Unicode → Punycode Conversion'
			: 'Punycode → Unicode Conversion');

		$.set_text(text_3, $.get(mode) === 'unicode-to-punycode' ? 'Unicode Domain Name' : 'Punycode Domain Name');
		$.set_attribute(textarea, 'placeholder', $.get(mode) === 'unicode-to-punycode' ? 'münchen.de' : 'xn--mnchen-3ya.de');
		classes_2 = $.set_class(textarea, 1, 'svelte-2q20du', null, classes_2, { 'mono-font': $.get(mode) === 'punycode-to-unicode' });

		$.set_text(text_4, $.get(mode) === 'unicode-to-punycode'
			? 'Enter Unicode domain names with international characters'
			: 'Enter domain names containing xn-- punycode labels');

		$.set_text(text_5, $.get(mode) === 'unicode-to-punycode' ? 'Punycode Result' : 'Unicode Result');
	});

	$.delegated('click', button, () => $.set(mode, 'unicode-to-punycode'));
	$.delegated('click', button_1, () => $.set(mode, 'punycode-to-unicode'));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);