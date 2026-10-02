import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Testing...`, 1);
var root_1 = $.from_html(`<!> Test Compression`, 1);
var root_2 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Testing Compression</h3> <p>Checking support for gzip, brotli, and deflate compression...</p></div></div></div></div>`);
var root_3 = $.from_html(`<div class="stat-detail"> </div>`);
var root_4 = $.from_html(`<div class="compression-stats svelte-1kta04p"><div class="size-comparison svelte-1kta04p"><div class="size-bar svelte-1kta04p"><div class="original-bar svelte-1kta04p"></div> <div class="compressed-bar svelte-1kta04p"></div></div> <div class="size-labels svelte-1kta04p"><span class="original-size"> </span> <span class="compressed-size"> </span></div></div> <div class="compression-metrics svelte-1kta04p"><div class="metric svelte-1kta04p"><span class="metric-label svelte-1kta04p">Reduction:</span> <span class="metric-value svelte-1kta04p"> </span></div> <div class="metric svelte-1kta04p"><span class="metric-label svelte-1kta04p">Time:</span> <span class="metric-value svelte-1kta04p"> </span></div></div></div>`);
var root_5 = $.from_html(`<div><div class="compression-header svelte-1kta04p"><div class="compression-type svelte-1kta04p"><!> <span class="encoding-name svelte-1kta04p"> </span></div> <div><!> </div></div> <!></div>`);
var root_6 = $.from_html(`<div class="header-item svelte-1kta04p"><span class="header-key svelte-1kta04p"> </span> <span class="header-value svelte-1kta04p"> </span></div>`);
var root_7 = $.from_html(`<div class="card results-card svelte-1kta04p"><div class="card-header"><h3>Compression Results</h3></div> <div class="card-content svelte-1kta04p"><div class="card overview-section svelte-1kta04p"><div class="card-header"><h3>Overview</h3></div> <div class="card-content svelte-1kta04p"><div class="stats-grid"><div class="stat-card"><div class="stat-label">Server Compression</div> <div><!> </div> <!></div> <div class="stat-card"><div class="stat-label">Best Compression</div> <div class="stat-value"><!> </div> <div class="stat-detail"> </div></div> <div class="stat-card"><div class="stat-label">Uncompressed Size</div> <div class="stat-value"> </div></div> <div class="stat-card"><div class="stat-label">Time Taken</div> <div class="stat-value"> </div></div></div></div></div> <div class="card methods-section svelte-1kta04p"><div class="card-header"><h3>Compression Methods</h3></div> <div class="card-content svelte-1kta04p"><div class="compression-grid svelte-1kta04p"></div></div></div> <div class="card headers-section svelte-1kta04p"><div class="card-header"><h3>Response Headers</h3></div> <div class="card-content svelte-1kta04p"><div class="headers-grid svelte-1kta04p"></div></div></div></div></div>`);
var root_8 = $.from_html(`<div class="card"><header class="card-header"><h1>HTTP Compression Check</h1> <p>Test gzip, brotli, and deflate compression support and measure size differences</p></header> <!> <div class="card input-card"><div class="card-header"><h3>URL to Test</h3></div> <div class="card-content"><div class="form-group"><label for="url">URL</label> <div class="input-flex-container"><input id="url" type="url" placeholder="https://example.com"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let url = $.state('https://example.com');
	const diagnosticState = useDiagnosticState();

	const examplesList = [
		{
			url: 'https://httpbin.org/gzip',
			description: 'HTTPBin gzip test'
		},

		{
			url: 'https://www.google.com',
			description: 'Google (likely compressed)'
		},

		{
			url: 'https://github.com',
			description: 'GitHub (modern compression)'
		},

		{
			url: 'https://www.cloudflare.com',
			description: 'Cloudflare (brotli support)'
		}
	];

	const examples = useExamples(examplesList);

	const isInputValid = $.derived(() => () => {
		const trimmedUrl = $.get(url).trim();

		if (!trimmedUrl) return false;

		try {
			const parsed = new URL(trimmedUrl);

			return ['http:', 'https:'].includes(parsed.protocol);
		} catch {
			return false;
		}
	});

	async function checkCompression() {
		if (!$.get(isInputValid)) {
			diagnosticState.setError('Please enter a valid HTTP/HTTPS URL');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/http', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'compression', url: $.get(url).trim() })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to check compression');
			}

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'An error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(url, example.url, true);
		examples.select(index);
		checkCompression();
	}

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
	}

	function getCompressionIcon(encoding) {
		switch (encoding.toLowerCase()) {
			case 'gzip':
				return 'archive';

			case 'br':

			case 'brotli':
				return 'zap';

			case 'deflate':
				return 'compress';

			default:
				return 'file';
		}
	}

	var div = root_8();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Compression Examples',
		getLabel: (ex) => ex.url,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Test compression for ${ex.url}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var input = $.child(div_4);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	ErrorCard(node_4, {
		title: 'Compression Test Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_2();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			Icon(node_6, { name: 'loader', size: 'lg', animate: 'spin' });
			$.next(2);
			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_8 = root_7();
			var div_9 = $.sibling($.child(div_8), 2);
			var div_10 = $.child(div_9);
			var div_11 = $.sibling($.child(div_10), 2);
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var div_14 = $.sibling($.child(div_13), 2);
			let classes;
			var node_8 = $.child(div_14);

			{
				let $0 = $.derived(() => diagnosticState.results.serverCompression.enabled ? 'check-circle' : 'x-circle');

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text = $.sibling(node_8);

			$.reset(div_14);

			var node_9 = $.sibling(div_14, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_15 = root_3();
					var text_1 = $.only_child(div_15, true);

					$.template_effect(() => $.set_text(text_1, diagnosticState.results.serverCompression.encoding));
					$.append($$anchor, div_15);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results.serverCompression.encoding) $$render(consequent_2);
				});
			}

			$.reset(div_13);

			var div_16 = $.sibling(div_13, 2);
			var div_17 = $.sibling($.child(div_16), 2);
			var node_10 = $.child(div_17);

			{
				let $0 = $.derived(() => getCompressionIcon(diagnosticState.results.bestCompression.encoding));

				Icon(node_10, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_2 = $.sibling(node_10);

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var text_3 = $.only_child(div_18);

			$.reset(div_16);

			var div_19 = $.sibling(div_16, 2);
			var div_20 = $.sibling($.child(div_19), 2);
			var text_4 = $.only_child(div_20, true);

			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var div_22 = $.sibling($.child(div_21), 2);
			var text_5 = $.only_child(div_22);

			$.reset(div_21);
			$.reset(div_12);
			$.reset(div_11);
			$.reset(div_10);

			var div_23 = $.sibling(div_10, 2);
			var div_24 = $.sibling($.child(div_23), 2);
			var div_25 = $.child(div_24);

			$.each(div_25, 21, () => diagnosticState.results.compressionResults, (result) => result.encoding, ($$anchor, result) => {
				var div_26 = root_5();
				let classes_1;
				var div_27 = $.child(div_26);
				var div_28 = $.child(div_27);
				var node_11 = $.child(div_28);

				{
					let $0 = $.derived(() => getCompressionIcon($.get(result).encoding));

					Icon(node_11, {
						get name() {
							return $.get($0);
						},
						size: 'sm'
					});
				}

				var span = $.sibling(node_11, 2);
				var text_6 = $.only_child(span, true);

				$.reset(div_28);

				var div_29 = $.sibling(div_28, 2);
				let classes_2;
				var node_12 = $.child(div_29);

				{
					let $0 = $.derived(() => $.get(result).supported ? 'check' : 'x');

					Icon(node_12, {
						get name() {
							return $.get($0);
						},
						size: 'xs'
					});
				}

				var text_7 = $.sibling(node_12);

				$.reset(div_29);
				$.reset(div_27);

				var node_13 = $.sibling(div_27, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_30 = root_4();
						var div_31 = $.child(div_30);
						var div_32 = $.child(div_31);
						var div_33 = $.sibling($.child(div_32), 2);

						$.reset(div_32);

						var div_34 = $.sibling(div_32, 2);
						var span_1 = $.child(div_34);
						var text_8 = $.only_child(span_1, true);
						var span_2 = $.sibling(span_1, 2);
						var text_9 = $.only_child(span_2, true);

						$.reset(div_34);
						$.reset(div_31);

						var div_35 = $.sibling(div_31, 2);
						var div_36 = $.child(div_35);
						var span_3 = $.sibling($.child(div_36), 2);
						var text_10 = $.only_child(span_3);

						$.reset(div_36);

						var div_37 = $.sibling(div_36, 2);
						var span_4 = $.sibling($.child(div_37), 2);
						var text_11 = $.only_child(span_4);

						$.reset(div_37);
						$.reset(div_35);
						$.reset(div_30);

						$.template_effect(
							($0, $1, $2) => {
								$.set_style(div_33, `width: ${$.get(result).compressedSize / diagnosticState.results.uncompressed.size * 100}%`);
								$.set_text(text_8, $0);
								$.set_text(text_9, $1);
								$.set_text(text_10, `${$2 ?? ''}%`);
								$.set_text(text_11, `${$.get(result).responseTime ?? ''}ms`);
							},
							[
								() => formatBytes(diagnosticState.results.uncompressed.size),
								() => formatBytes($.get(result).compressedSize),
								() => $.get(result).ratio.toFixed(1)
							]
						);

						$.append($$anchor, div_30);
					};

					$.if(node_13, ($$render) => {
						if ($.get(result).supported) $$render(consequent_3);
					});
				}

				$.reset(div_26);

				$.template_effect(() => {
					classes_1 = $.set_class(div_26, 1, 'compression-card svelte-1kta04p', null, classes_1, {
						best: $.get(result).encoding === diagnosticState.results.bestCompression.encoding
					});

					$.set_text(text_6, $.get(result).encoding);

					classes_2 = $.set_class(div_29, 1, 'compression-status svelte-1kta04p', null, classes_2, {
						success: $.get(result).supported,
						error: !$.get(result).supported
					});

					$.set_text(text_7, ` ${$.get(result).supported ? 'Supported' : 'Not Supported'}`);
				});

				$.append($$anchor, div_26);
			});

			$.reset(div_25);
			$.reset(div_24);
			$.reset(div_23);

			var div_38 = $.sibling(div_23, 2);
			var div_39 = $.sibling($.child(div_38), 2);
			var div_40 = $.child(div_39);

			$.each(div_40, 21, () => Object.entries(diagnosticState.results.headers), ([key, value]) => key, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let value = () => $.get($$array)[1];
				var div_41 = root_6();
				var span_5 = $.child(div_41);
				var text_12 = $.only_child(span_5, true);
				var span_6 = $.sibling(span_5, 2);
				var text_13 = $.only_child(span_6, true);

				$.reset(div_41);

				$.template_effect(() => {
					$.set_text(text_12, key());
					$.set_text(text_13, value());
				});

				$.append($$anchor, div_41);
			});

			$.reset(div_40);
			$.reset(div_39);
			$.reset(div_38);
			$.reset(div_9);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					classes = $.set_class(div_14, 1, 'stat-value', null, classes, { success: diagnosticState.results.serverCompression.enabled });
					$.set_text(text, ` ${diagnosticState.results.serverCompression.enabled ? 'Enabled' : 'Disabled'}`);
					$.set_text(text_2, ` ${diagnosticState.results.bestCompression.encoding ?? ''}`);
					$.set_text(text_3, `${$0 ?? ''}% reduction`);
					$.set_text(text_4, $1);
					$.set_text(text_5, `${diagnosticState.results.timings.total ?? ''}ms`);
				},
				[
					() => diagnosticState.results.bestCompression.ratio.toFixed(1),
					() => formatBytes(diagnosticState.results.uncompressed.size)
				]
			);

			$.append($$anchor, div_8);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_4);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', input, () => examples.clear());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && checkCompression());
	$.bind_value(input, () => $.get(url), ($$value) => $.set(url, $$value));
	$.delegated('click', button, checkCompression);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'keydown', 'click']);