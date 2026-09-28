import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { calculateNSEC3Hash, NSEC3_HASH_ALGORITHMS } from '$lib/utils/dnssec';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-title svelte-1jtswco"> </div> <div class="example-params svelte-1jtswco"><div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Name:</span> <span class="param-value svelte-1jtswco"> </span></div> <div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Salt:</span> <span class="param-value svelte-1jtswco"> </span></div> <div class="param-row svelte-1jtswco"><span class="param-label svelte-1jtswco">Iterations:</span> <span class="param-value svelte-1jtswco"> </span></div></div> <div class="example-description svelte-1jtswco"> </div></button>`);
var root_1 = $.from_html(`<p class="field-help svelte-1jtswco">Using example data - modify to see your results</p>`);
var root_2 = $.from_html(`<option class="svelte-1jtswco"> </option>`);
var root_3 = $.from_html(`<div class="loading svelte-1jtswco"><div class="spinner svelte-1jtswco"></div> <span class="svelte-1jtswco">Calculating Hash...</span></div>`);
var root_4 = $.from_html(`<!> <span class="svelte-1jtswco">Calculate NSEC3 Hash</span>`, 1);
var root_5 = $.from_html(`<div class="card error-card svelte-1jtswco"><div class="error-content svelte-1jtswco"><!> <div class="svelte-1jtswco"><strong class="svelte-1jtswco">Calculation Error:</strong> </div></div></div>`);
var root_6 = $.from_html(`<div class="card results-card svelte-1jtswco"><div class="results-header svelte-1jtswco"><h3 class="svelte-1jtswco">NSEC3 Hash Result</h3> <div class="header-actions svelte-1jtswco"><button><!> Copy Hash</button> <button><!> Copy Record</button></div></div> <div class="hash-display svelte-1jtswco"><div class="hash-label svelte-1jtswco">NSEC3 Hash</div> <div class="hash-value svelte-1jtswco"> </div></div> <div class="details-section svelte-1jtswco"><h4 class="svelte-1jtswco">Calculation Parameters</h4> <div class="details-grid svelte-1jtswco"><div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Original Name</span> <span class="detail-value mono svelte-1jtswco"> </span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Salt</span> <span class="detail-value mono svelte-1jtswco"> </span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Iterations</span> <span class="detail-value mono svelte-1jtswco"> </span></div> <div class="detail-item svelte-1jtswco"><span class="detail-label svelte-1jtswco">Algorithm</span> <span class="detail-value mono svelte-1jtswco"> </span></div></div></div> <div class="record-section svelte-1jtswco"><h4 class="svelte-1jtswco">Sample NSEC3 Record</h4> <div class="record-display svelte-1jtswco"><code class="svelte-1jtswco"> </code></div></div></div>`);

var root_7 = $.from_html(`<div class="card svelte-1jtswco"><header class="card-header svelte-1jtswco"><h1 class="svelte-1jtswco">NSEC3 Hash Calculator</h1> <p class="svelte-1jtswco">Calculate NSEC3 owner hashes for a name given salt, iterations, and algorithm, showing the hashed owner FQDN for
      DNSSEC authenticated denial of existence.</p></header> <div class="card examples-card svelte-1jtswco"><details class="examples-details svelte-1jtswco"><summary class="examples-summary svelte-1jtswco"><!> <h4 class="svelte-1jtswco">NSEC3 Examples</h4></summary> <div class="examples-grid svelte-1jtswco"></div></details></div> <div class="card input-card svelte-1jtswco"><div class="form-group svelte-1jtswco"><label for="domain-name" class="svelte-1jtswco"><!> Domain Name (FQDN)</label> <input id="domain-name" type="text" placeholder="www.example.com."/> <!></div> <div class="form-group svelte-1jtswco"><label for="salt-input" class="svelte-1jtswco"><!> Salt (Hexadecimal) <button class="generate-salt-btn svelte-1jtswco" type="button"><!> Generate</button></label> <input id="salt-input" type="text" placeholder="AABBCCDD (or leave empty for no salt)" class="salt-input svelte-1jtswco"/></div> <div class="input-row svelte-1jtswco"><div class="form-group svelte-1jtswco"><label for="iterations" class="svelte-1jtswco"><!> Iterations (0-2500)</label> <input id="iterations" type="number" min="0" max="2500" class="number-input svelte-1jtswco"/></div> <div class="form-group svelte-1jtswco"><label for="algorithm" class="svelte-1jtswco"><!> Hash Algorithm</label> <select id="algorithm" class="svelte-1jtswco"></select></div></div> <div class="action-section svelte-1jtswco"><button><!></button></div></div> <!> <!> <div class="education-card svelte-1jtswco"><div class="education-grid svelte-1jtswco"><div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">NSEC3 Purpose</h4> <p class="svelte-1jtswco">NSEC3 provides authenticated denial of existence for DNS records while preventing zone enumeration. The hash
          function obscures the actual domain names in the zone, making it difficult for attackers to discover all
          records through zone walking.</p></div> <div class="education-item info-panel warning svelte-1jtswco"><h4 class="svelte-1jtswco">Security Considerations</h4> <p class="svelte-1jtswco">Use sufficient iterations (10-100) and a random salt to resist offline dictionary attacks. Higher iteration
          counts increase CPU usage during validation. The salt should be randomly generated and periodically changed
          during zone re-signing.</p></div> <div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">Implementation Notes</h4> <p class="svelte-1jtswco">NSEC3 hashes are calculated by iteratively applying SHA-1 to the concatenation of the domain name (in wire
          format) and salt. The resulting hash is encoded in Base32 without padding and used as the owner name for NSEC3
          records.</p></div> <div class="education-item info-panel svelte-1jtswco"><h4 class="svelte-1jtswco">Performance Impact</h4> <p class="svelte-1jtswco">Higher iteration counts provide better security but increase validation time. Consider server capacity and
          client timeout requirements when choosing iteration values. Typical values range from 5-150 iterations
          depending on security needs.</p></div></div></div></div>`);

export default function NSEC3Hash($$anchor, $$props) {
	$.push($$props, true);

	let domainName = $.state('www.example.com.');
	let salt = $.state('');
	let iterations = $.state(10);
	let algorithm = $.state(1);
	let activeExampleIndex = $.state(null);
	let isActiveExample = $.state(true);
	const clipboard = useClipboard();

	const examples = [
		{
			title: 'Standard Configuration',
			name: 'www.example.com.',
			salt: 'AABBCCDD',
			iterations: 10,
			algorithm: 1,
			description: 'Typical NSEC3 setup with moderate iterations'
		},

		{
			title: 'High Iteration Count',
			name: 'secure.example.org.',
			salt: '1234567890ABCDEF',
			iterations: 100,
			algorithm: 1,
			description: 'High security configuration with more iterations'
		},

		{
			title: 'No Salt (Empty)',
			name: 'blog.example.net.',
			salt: '',
			iterations: 5,
			algorithm: 1,
			description: 'Minimal configuration without salt'
		},

		{
			title: 'Subdomain Example',
			name: 'mail.internal.example.com.',
			salt: 'DEADBEEF',
			iterations: 50,
			algorithm: 1,
			description: 'Complex domain name with standard settings'
		}
	];

	let calculating = $.state(false);
	let result = $.state(null);
	let error = $.state(null);

	async function calculateHash() {
		$.set(error, null);
		$.set(result, null);
		$.set(calculating, true);

		try {
			if (!$.get(domainName).trim()) {
				$.set(error, 'Domain name is required');

				return;
			}

			if ($.get(iterations) < 0 || $.get(iterations) > 2500) {
				$.set(error, 'Iterations must be between 0 and 2500');

				return;
			}

			if ($.get(salt) && !(/^[0-9A-Fa-f]*$/).test($.get(salt))) {
				$.set(error, 'Salt must be hexadecimal (0-9, A-F) or empty');

				return;
			}

			const normalizedName = $.get(domainName).trim().toLowerCase();
			const normalizedSalt = $.get(salt).toUpperCase();
			const hash = await calculateNSEC3Hash(normalizedName, normalizedSalt, $.get(iterations), $.get(algorithm));

			if (!hash) {
				$.set(error, 'Failed to calculate NSEC3 hash');

				return;
			}

			$.set(result, { hash, originalName: normalizedName }, true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Failed to calculate hash', true);
		} finally {
			$.set(calculating, false);
		}
	}

	const isValid = $.derived(() => () => {
		return $.get(domainName).trim() && $.get(iterations) >= 0 && $.get(iterations) <= 2500 && ($.get(salt) === '' || (/^[0-9A-Fa-f]*$/).test($.get(salt)));
	});

	// Auto-calculate on mount with default values
	$.user_effect(() => {
		if ($.get(domainName) === 'www.example.com.' && $.get(salt) === '' && $.get(iterations) === 10 && $.get(algorithm) === 1) {
			calculateHash();
		}
	});

	function loadExample(index) {
		const example = examples[index];

		$.set(domainName, example.name, true);
		$.set(salt, example.salt, true);
		$.set(iterations, example.iterations, true);
		$.set(algorithm, example.algorithm, true);
		$.set(activeExampleIndex, index, true);
		$.set(isActiveExample, false);

		// Auto-calculate after loading example
		if ($.get(isValid)()) {
			calculateHash();
		}
	}

	function handleInputChange() {
		if ($.get(isActiveExample) && $.get(domainName) !== 'www.example.com.') {
			$.set(isActiveExample, false);
		}

		$.set(activeExampleIndex, null);
		$.set(error, null);
		$.set(result, null);

		// Auto-calculate if inputs are valid
		if ($.get(isValid)()) {
			calculateHash();
		}
	}

	function copyHash() {
		if ($.get(result)?.hash) {
			clipboard.copy($.get(result).hash, 'hash');
		}
	}

	function copyNSEC3Record() {
		if ($.get(result)?.hash && $.get(result)?.originalName) {
			const record = `${$.get(result).hash}.example.com. IN NSEC3 1 0 ${$.get(iterations)} ${$.get(salt) || '-'} ${$.get(result).hash} A RRSIG`;

			clipboard.copy(record, 'record');
		}
	}

	function generateRandomSalt() {
		const chars = '0123456789ABCDEF';
		let randomSalt = '';

		for (let i = 0; i < 16; i++) {
			randomSalt += chars[Math.floor(Math.random() * chars.length)];
		}

		$.set(salt, randomSalt, true);
		handleInputChange();
	}

	var div = root_7();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example) => example.title, ($$anchor, example, index) => {
		var button = root();
		var div_3 = $.child(button);
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var div_5 = $.child(div_4);
		var span = $.sibling($.child(div_5), 2);
		var text_1 = $.only_child(span, true);

		$.reset(div_5);

		var div_6 = $.sibling(div_5, 2);
		var span_1 = $.sibling($.child(div_6), 2);
		var text_2 = $.only_child(span_1, true);

		$.reset(div_6);

		var div_7 = $.sibling(div_6, 2);
		var span_2 = $.sibling($.child(div_7), 2);
		var text_3 = $.only_child(span_2, true);

		$.reset(div_7);
		$.reset(div_4);

		var div_8 = $.sibling(div_4, 2);
		var text_4 = $.only_child(div_8, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1jtswco');
			$.set_text(text, $.get(example).title);
			$.set_text(text_1, $.get(example).name);
			$.set_text(text_2, $.get(example).salt || '(empty)');
			$.set_text(text_3, $.get(example).iterations);
			$.set_text(text_4, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_9 = $.sibling(div_1, 2);
	var div_10 = $.child(div_9);
	var label = $.child(div_10);
	var node_1 = $.child(label);

	Icon(node_1, { name: 'globe', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Enter the fully qualified domain name to generate NSEC3 hash for. Must end with a dot (e.g., 'www.example.com.')");

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);

	var node_2 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isActiveExample)) $$render(consequent);
		});
	}

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var label_1 = $.child(div_11);
	var node_3 = $.child(label_1);

	Icon(node_3, { name: 'key', size: 'sm' });

	var button_1 = $.sibling(node_3, 2);
	var node_4 = $.child(button_1);

	Icon(node_4, { name: 'refresh', size: 'xs' });
	$.next();
	$.reset(button_1);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Optional salt value in hexadecimal format (e.g., 'AABBCCDD'). Salt adds randomness to prevent dictionary attacks. Leave empty for no salt.");

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var div_13 = $.child(div_12);
	var label_2 = $.child(div_13);
	var node_5 = $.child(label_2);

	Icon(node_5, { name: 'repeat', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of additional hashing iterations to perform. Higher values increase security but also increase CPU cost. Typical values: 0-10 for most zones.');

	var input_2 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_2);
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var label_3 = $.child(div_14);
	var node_6 = $.child(label_3);

	Icon(node_6, { name: 'hash', size: 'sm' });
	$.next();
	$.reset(label_3);
	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Cryptographic hash algorithm used for NSEC3. Algorithm 1 (SHA-1) is the most commonly supported option.');

	var select = $.sibling(label_3, 2);

	$.each(select, 21, () => Object.entries(NSEC3_HASH_ALGORITHMS), ([value, name]) => value, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let value = () => $.get($$array)[0];
		let name = () => $.get($$array)[1];
		var option = root_2();
		var text_5 = $.only_child(option);
		var option_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text_5, `${value() ?? ''} - ${name() ?? ''}`);

				if (option_value !== (option_value = $0)) {
					option.value = (option.__value = option_value) ?? '';
				}
			},
			[() => Number(value())]
		);

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(div_14);
	$.reset(div_12);

	var div_15 = $.sibling(div_12, 2);
	var button_2 = $.child(div_15);
	let classes;
	var node_7 = $.child(button_2);

	{
		var consequent_1 = ($$anchor) => {
			var div_16 = root_3();

			$.append($$anchor, div_16);
		};

		var alternate = ($$anchor) => {
			var fragment = root_4();
			var node_8 = $.first_child(fragment);

			Icon(node_8, { name: 'hash', size: 'sm' });
			$.next(2);
			$.append($$anchor, fragment);
		};

		$.if(node_7, ($$render) => {
			if ($.get(calculating)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_2);
	$.reset(div_15);
	$.reset(div_9);

	var node_9 = $.sibling(div_9, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_17 = root_5();
			var div_18 = $.child(div_17);
			var node_10 = $.child(div_18);

			Icon(node_10, { name: 'alert-triangle', size: 'sm' });

			var div_19 = $.sibling(node_10, 2);
			var text_6 = $.sibling($.child(div_19));

			$.reset(div_19);
			$.reset(div_18);
			$.reset(div_17);
			$.template_effect(() => $.set_text(text_6, ` ${$.get(error) ?? ''}`));
			$.append($$anchor, div_17);
		};

		$.if(node_9, ($$render) => {
			if ($.get(error)) $$render(consequent_2);
		});
	}

	var node_11 = $.sibling(node_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_20 = root_6();
			var div_21 = $.child(div_20);
			var div_22 = $.sibling($.child(div_21), 2);
			var button_3 = $.child(div_22);
			var node_12 = $.child(button_3);

			{
				let $0 = $.derived(() => clipboard.isCopied('hash') ? 'check' : 'copy');

				Icon(node_12, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next();
			$.reset(button_3);

			var button_4 = $.sibling(button_3, 2);
			var node_13 = $.child(button_4);

			{
				let $0 = $.derived(() => clipboard.isCopied('record') ? 'check' : 'copy');

				Icon(node_13, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next();
			$.reset(button_4);
			$.reset(div_22);
			$.reset(div_21);

			var div_23 = $.sibling(div_21, 2);
			var div_24 = $.child(div_23);

			$.action(div_24, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The calculated NSEC3 hash value that becomes the owner name for the NSEC3 record in the zone');

			var div_25 = $.sibling(div_24, 2);
			var text_7 = $.only_child(div_25, true);

			$.reset(div_23);

			var div_26 = $.sibling(div_23, 2);
			var div_27 = $.sibling($.child(div_26), 2);
			var div_28 = $.child(div_27);
			var span_3 = $.child(div_28);

			$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The original domain name that was hashed to produce the NSEC3 hash');

			var span_4 = $.sibling(span_3, 2);
			var text_8 = $.only_child(span_4, true);

			$.reset(div_28);

			var div_29 = $.sibling(div_28, 2);
			var span_5 = $.child(div_29);

			$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The hexadecimal salt value used in the hash calculation. Helps prevent dictionary attacks against zone contents.');

			var span_6 = $.sibling(span_5, 2);
			var text_9 = $.only_child(span_6, true);

			$.reset(div_29);

			var div_30 = $.sibling(div_29, 2);
			var span_7 = $.child(div_30);

			$.action(span_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of additional hash iterations performed. Higher values make brute-force attacks more difficult but increase computational cost.');

			var span_8 = $.sibling(span_7, 2);
			var text_10 = $.only_child(span_8, true);

			$.reset(div_30);

			var div_31 = $.sibling(div_30, 2);
			var span_9 = $.child(div_31);

			$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The cryptographic hash algorithm used. Algorithm 1 (SHA-1) is the standard and most widely supported.');

			var span_10 = $.sibling(span_9, 2);
			var text_11 = $.only_child(span_10);

			$.reset(div_31);
			$.reset(div_27);
			$.reset(div_26);

			var div_32 = $.sibling(div_26, 2);
			var h4 = $.child(div_32);

			$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Example of how this hash would appear as an NSEC3 record in a DNS zone file');

			var div_33 = $.sibling(h4, 2);
			var code = $.child(div_33);
			var text_12 = $.only_child(code);

			$.reset(div_33);
			$.reset(div_32);
			$.reset(div_20);

			$.template_effect(
				($0, $1) => {
					$.set_class(button_3, 1, `copy-button ${$0 ?? ''}`, 'svelte-1jtswco');
					$.set_class(button_4, 1, `copy-button ${$1 ?? ''}`, 'svelte-1jtswco');
					$.set_text(text_7, $.get(result).hash);
					$.set_text(text_8, $.get(result).originalName);
					$.set_text(text_9, $.get(salt) || '(none)');
					$.set_text(text_10, $.get(iterations));
					$.set_text(text_11, `${$.get(algorithm) ?? ''} (${NSEC3_HASH_ALGORITHMS[$.get(algorithm)] ?? ''})`);
					$.set_text(text_12, `${$.get(result).hash ?? ''}.example.com. IN NSEC3 1 0 ${$.get(iterations) ?? ''} ${($.get(salt) || '-') ?? ''} ${$.get(result).hash ?? ''} A RRSIG`);
				},
				[
					() => clipboard.isCopied('hash') ? 'copied' : '',
					() => clipboard.isCopied('record') ? 'copied' : ''
				]
			);

			$.delegated('click', button_3, copyHash);
			$.delegated('click', button_4, copyNSEC3Record);
			$.append($$anchor, div_20);
		};

		$.if(node_11, ($$render) => {
			if ($.get(result)) $$render(consequent_3);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(input, 1, `domain-input ${$.get(isActiveExample) ? 'example-active' : ''}`, 'svelte-1jtswco');
		classes = $.set_class(button_2, 1, 'calculate-btn svelte-1jtswco', null, classes, { loading: $.get(calculating) });
		button_2.disabled = !$.get(isValid) || $.get(calculating);
	});

	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(domainName), ($$value) => $.set(domainName, $$value));
	$.delegated('click', button_1, generateRandomSalt);
	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(salt), ($$value) => $.set(salt, $$value));
	$.delegated('input', input_2, handleInputChange);
	$.bind_value(input_2, () => $.get(iterations), ($$value) => $.set(iterations, $$value));
	$.delegated('change', select, handleInputChange);
	$.bind_select_value(select, () => $.get(algorithm), ($$value) => $.set(algorithm, $$value));
	$.delegated('click', button_2, calculateHash);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);