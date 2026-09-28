import * as $ from 'svelte/internal/server';
import { Copy, Download, Check, Globe, Type } from 'lucide-svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';

export default function IDNPunycodeConverter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '';
		let mode = 'unicode-to-punycode';
		let showExamples = false;
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
			if (!inputText.trim()) return '';

			try {
				if (mode === 'unicode-to-punycode') {
					return convertDomain(inputText.trim(), true);
				} else {
					return convertDomain(inputText.trim(), false);
				}
			} catch {
				return 'Error: Invalid input';
			}
		});

		let isValid = $.derived(() => {
			return inputText.trim() !== '' && result() !== '' && !result().startsWith('Error:');
		});

		let warnings = $.derived(() => {
			const warns = [];

			if (mode === 'unicode-to-punycode') {
				if (inputText && !(/[\u0080-\uFFFF]/).test(inputText)) {
					warns.push('Input contains only ASCII characters - no conversion needed');
				}
			} else {
				if (inputText && !inputText.includes('xn--')) {
					warns.push('Input does not contain punycode domains (xn-- prefix)');
				}
			}

			if (inputText.length > 253) {
				warns.push('Domain name exceeds maximum length of 253 characters');
			}

			return warns;
		});

		function copyToClipboard() {
			clipboard.copy(result(), 'copy');
		}

		function downloadResult() {
			const content = `Input: ${inputText}\nOutput: ${result()}\n\nConversion: ${mode === 'unicode-to-punycode' ? 'Unicode → Punycode' : 'Punycode → Unicode'}`;
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
			if (mode === 'unicode-to-punycode') {
				inputText = example.unicode;
			} else {
				inputText = example.punycode;
			}
		}

		function swapModeAndContent() {
			if (isValid()) {
				const _temp = inputText;

				inputText = result();
				mode = mode === 'unicode-to-punycode' ? 'punycode-to-unicode' : 'unicode-to-punycode';
			} else {
				mode = mode === 'unicode-to-punycode' ? 'punycode-to-unicode' : 'unicode-to-punycode';
			}
		}

		$$renderer.push(`<div class="idn-converter svelte-2q20du"><div class="card svelte-2q20du"><div class="card-header svelte-2q20du"><h1 class="svelte-2q20du">IDN Punycode Converter</h1> <p class="svelte-2q20du">Convert between Unicode domain names and Punycode (ASCII-compatible encoding)</p></div> <div class="card-content"><div class="mode-toggle svelte-2q20du"><div class="toggle-container svelte-2q20du"><button${$.attr_class('toggle-btn svelte-2q20du', void 0, { 'active': mode === 'unicode-to-punycode' })}>`);
		Globe($$renderer, { size: '16' });
		$$renderer.push(`<!----> Unicode → Punycode</button> <button${$.attr_class('toggle-btn svelte-2q20du', void 0, { 'active': mode === 'punycode-to-unicode' })}>`);
		Type($$renderer, { size: '16' });
		$$renderer.push(`<!----> Punycode → Unicode</button></div></div> <details${$.attr('open', showExamples, true)} class="examples-section svelte-2q20du"><summary class="svelte-2q20du"><div class="summary-content svelte-2q20du">`);
		Globe($$renderer, { size: '20' });
		$$renderer.push(`<!----> <span>Example Domains</span></div> <svg class="chevron svelte-2q20du" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></summary> <div class="examples-grid svelte-2q20du"><!--[-->`);

		const each_array = $.ensure_array_like(domainExamples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button class="example-btn svelte-2q20du"><div class="example-domain svelte-2q20du">${$.escape(mode === 'unicode-to-punycode' ? example.unicode : example.punycode)}</div> <div class="example-desc svelte-2q20du">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details> <div class="conversion-card svelte-2q20du"><div class="conversion-header svelte-2q20du"><h2 class="svelte-2q20du">${$.escape(mode === 'unicode-to-punycode'
			? 'Unicode → Punycode Conversion'
			: 'Punycode → Unicode Conversion')}</h2></div> <div class="conversion-grid svelte-2q20du"><div class="input-card svelte-2q20du"><div class="input-section svelte-2q20du"><label for="input" class="svelte-2q20du">${$.escape(mode === 'unicode-to-punycode' ? 'Unicode Domain Name' : 'Punycode Domain Name')}</label> <textarea id="input" rows="4"${$.attr('placeholder', mode === 'unicode-to-punycode' ? 'münchen.de' : 'xn--mnchen-3ya.de')}${$.attr_class('svelte-2q20du', void 0, { 'mono-font': mode === 'punycode-to-unicode' })}>`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <small class="svelte-2q20du">${$.escape(mode === 'unicode-to-punycode'
			? 'Enter Unicode domain names with international characters'
			: 'Enter domain names containing xn-- punycode labels')}</small></div></div> <div class="output-card svelte-2q20du"><div class="output-section svelte-2q20du"><div class="output-header svelte-2q20du"><h3>${$.escape(mode === 'unicode-to-punycode' ? 'Punycode Result' : 'Unicode Result')}</h3> `);

		if (isValid()) {
			$$renderer.push(`<!--[0--><button class="swap-btn svelte-2q20du"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="svelte-2q20du"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Reverse</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="output-display svelte-2q20du">`);

		if (isValid()) {
			$$renderer.push(`<!--[0--><pre${$.attr_class('result-text svelte-2q20du', void 0, { 'mono-font': mode === 'unicode-to-punycode' })}>${$.escape(result())}</pre>`);
		} else if (result().startsWith('Error:')) {
			$$renderer.push(`<!--[1--><p class="error-text svelte-2q20du">${$.escape(result())}</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="placeholder-text svelte-2q20du">Enter a domain name to see the conversion result</p>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (warnings().length > 0) {
			$$renderer.push(`<!--[0--><div class="alert alert-warning svelte-2q20du"><h4 class="svelte-2q20du">Notices</h4> <ul class="svelte-2q20du"><!--[-->`);

			const each_array_1 = $.ensure_array_like(warnings());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let warning = each_array_1[$$index_1];

				$$renderer.push(`<li class="svelte-2q20du">${$.escape(warning)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isValid()) {
			$$renderer.push(`<!--[0--><div class="button-group svelte-2q20du"><button${$.attr_class('btn-secondary svelte-2q20du', void 0, { 'success': clipboard.isCopied('copy') })}${$.attr_style(`transform: ${clipboard.isCopied('copy') ? 'scale(1.05)' : 'scale(1)'}`)}>`);

			if (clipboard.isCopied('copy')) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { size: '16' });
				$$renderer.push(`<!----> Copied!`);
			} else {
				$$renderer.push('<!--[-1-->');
				Copy($$renderer, { size: '16' });
				$$renderer.push(`<!----> Copy Result`);
			}

			$$renderer.push(`<!--]--></button> <button${$.attr_class('btn-primary svelte-2q20du', void 0, { 'success': clipboard.isCopied('download') })}${$.attr_style(`transform: ${clipboard.isCopied('download') ? 'scale(1.05)' : 'scale(1)'}`)}>`);

			if (clipboard.isCopied('download')) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { size: '16' });
				$$renderer.push(`<!----> Downloaded!`);
			} else {
				$$renderer.push('<!--[-1-->');
				Download($$renderer, { size: '16' });
				$$renderer.push(`<!----> Download`);
			}

			$$renderer.push(`<!--]--></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div></div> <div class="info-section svelte-2q20du"><div class="card info-card svelte-2q20du"><h3 class="svelte-2q20du">About IDN and Punycode</h3> <p class="svelte-2q20du">Internationalized Domain Names (IDN) allow domain names to contain Unicode characters from various scripts
            and languages. Punycode is the ASCII-compatible encoding that represents Unicode domain labels, allowing
            non-ASCII domain names to work with existing DNS infrastructure.</p></div> <div class="info-grid svelte-2q20du"><div class="card svelte-2q20du"><h4 class="svelte-2q20du">How Punycode Works</h4> <div class="punycode-example svelte-2q20du"><p class="svelte-2q20du">Each Unicode label is encoded separately:</p> <div class="code-example svelte-2q20du"><div class="svelte-2q20du"><strong class="svelte-2q20du">Unicode:</strong> <span class="unicode-text svelte-2q20du">münchen</span></div> <div class="svelte-2q20du"><strong class="svelte-2q20du">Encoded:</strong> <span class="encoded-text svelte-2q20du">mnchen-3ya</span></div> <div class="svelte-2q20du"><strong class="svelte-2q20du">Final:</strong> <span class="final-text svelte-2q20du">xn--mnchen-3ya</span></div></div> <small class="svelte-2q20du">The <code class="svelte-2q20du">xn--</code> prefix identifies punycode labels</small></div></div> <div class="card svelte-2q20du"><h4 class="svelte-2q20du">Common Use Cases</h4> <ul class="use-cases svelte-2q20du"><li class="svelte-2q20du">International domain registration</li> <li class="svelte-2q20du">Email address internationalization</li> <li class="svelte-2q20du">DNS configuration</li> <li class="svelte-2q20du">Web application development</li> <li class="svelte-2q20du">Security analysis</li></ul></div> <div class="card svelte-2q20du"><h4 class="svelte-2q20du">Supported Features</h4> <ul class="features svelte-2q20du"><li class="svelte-2q20du">RFC 3492 compliant Punycode encoding/decoding</li> <li class="svelte-2q20du">Bidirectional conversion (Unicode ↔ Punycode)</li> <li class="svelte-2q20du">Multiple domain labels support</li> <li class="svelte-2q20du">Mixed ASCII/Unicode domain handling</li></ul></div> <div class="card security-card svelte-2q20du"><h4 class="svelte-2q20du">Security Considerations</h4> <ul class="security-list svelte-2q20du"><li class="svelte-2q20du"><strong>Homograph attacks:</strong> visually similar characters from different scripts</li> <li class="svelte-2q20du">Always validate and normalize IDN input in applications</li> <li class="svelte-2q20du">Consider implementing mixed-script detection</li> <li class="svelte-2q20du">Be aware of browser IDN display policies</li></ul></div></div></div></div></div></div>`);
	});
}