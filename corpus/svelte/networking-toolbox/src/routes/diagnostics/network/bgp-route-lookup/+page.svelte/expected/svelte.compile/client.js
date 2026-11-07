import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { bgpContent } from '$lib/content/bgp';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Looking up...`, 1);
var root_2 = $.from_html(`<!> Lookup`, 1);
var root_3 = $.from_html(`<div class="asn-name svelte-1gwrbdt"> </div>`);
var root_4 = $.from_html(`<div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Origin Autonomous System</h4> <div class="origin-as-content svelte-1gwrbdt"><!> <div><div class="asn-badge svelte-1gwrbdt"> </div> <!></div></div></div>`);
var root_5 = $.from_html(`<span class="as-path-segment svelte-1gwrbdt"><span class="asn-label svelte-1gwrbdt"> </span> <!></span>`);
var root_6 = $.from_html(`<div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">AS Path</h4> <div class="as-path-display svelte-1gwrbdt"></div> <div class="path-info svelte-1gwrbdt"><small> </small></div></div>`);
var root_7 = $.from_html(`<div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">Country:</span> <span class="detail-value svelte-1gwrbdt"> </span></div>`);
var root_8 = $.from_html(`<div class="prefix-content svelte-1gwrbdt"><div class="prefix-header svelte-1gwrbdt"><!> <span class="prefix-value svelte-1gwrbdt"> </span></div> <div class="prefix-details svelte-1gwrbdt"><div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">ASN:</span> <span class="detail-value svelte-1gwrbdt"> </span></div> <div class="detail-row svelte-1gwrbdt"><span class="detail-label svelte-1gwrbdt">Holder:</span> <span class="detail-value svelte-1gwrbdt"> </span></div> <!></div></div>`);
var root_9 = $.from_html(`<div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt"> </h4> <!></div>`);
var root_10 = $.from_html(`<span class="peer-country svelte-1gwrbdt"> </span>`);
var root_11 = $.from_html(`<div class="peer-badge svelte-1gwrbdt"><span class="peer-asn svelte-1gwrbdt"> </span> <!></div>`);
var root_12 = $.from_html(`<div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt"> </h4> <div class="peers-list svelte-1gwrbdt"></div></div>`);
var root_13 = $.from_html(`<span class="prefix-tag more-specific svelte-1gwrbdt"> </span>`);
var root_14 = $.from_html(`<div class="prefix-list svelte-1gwrbdt"><h5 class="svelte-1gwrbdt"> </h5> <div class="prefix-tags svelte-1gwrbdt"></div></div>`);
var root_15 = $.from_html(`<span class="prefix-tag less-specific svelte-1gwrbdt"> </span>`);
var root_16 = $.from_html(`<div class="result-card svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Related Prefixes</h4> <div class="related-prefixes svelte-1gwrbdt"><!> <!></div></div>`);
var root_17 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="status-overview"><div><!> <div><h4 class="svelte-1gwrbdt"> </h4> <p class="svelte-1gwrbdt"> </p></div></div></div> <div class="results-grid svelte-1gwrbdt"><!> <!> <!> <!> <!></div></div></div>`);
var root_18 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>BGP Lookup Failed</strong> <p> </p></div></div></div></div>`);
var root_19 = $.from_html(`<li><strong> </strong> </li>`);
var root_20 = $.from_html(`<li><strong> </strong> <small> </small></li>`);
var root_21 = $.from_html(`<li class="svelte-1gwrbdt"> </li>`);
var root_22 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Example Lookups</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>BGP Lookup</h3></div> <div class="card-content"><div class="lookup-form svelte-1gwrbdt"><label for="resource" class="svelte-1gwrbdt">IP Address or Prefix</label> <div class="input-row svelte-1gwrbdt"><input id="resource" type="text" placeholder="8.8.8.8 or 8.8.8.0/24" class="svelte-1gwrbdt"/> <button class="lookup-btn svelte-1gwrbdt"><!></button></div></div></div></div> <!> <!> <div class="card info-card svelte-1gwrbdt"><div class="card-header"><h3>About BGP Routing</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4> </h4> <p> </p></div> <div class="info-section"><h4> </h4> <p> </p> <ul></ul></div> <div class="info-section"><h4> </h4> <ul></ul></div> <div class="info-section"><h4> </h4> <p> </p></div></div> <div class="quick-tips svelte-1gwrbdt"><h4 class="svelte-1gwrbdt">Quick Tips</h4> <ul class="svelte-1gwrbdt"></ul></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let resource = $.state('8.8.8.8');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			resource: '8.8.8.8',
			description: 'Google Public DNS (AS15169)'
		},
		{ resource: '1.1.1.1', description: 'Cloudflare DNS (AS13335)' },
		{ resource: '104.244.42.1', description: 'Twitter/X' },
		{ resource: '140.82.121.4', description: 'GitHub (AS36459)' },
		{
			resource: '91.189.88.152',
			description: 'Canonical/Ubuntu servers'
		}
	];

	async function lookupBGP() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/bgp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ resource: $.get(resource).trim() })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `BGP lookup failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(resource, example.resource, true);
		$.set(selectedExampleIndex, index, true);
		lookupBGP();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyResults() {
		if (!$.get(results)) return;

		let text = `BGP Route Lookup for ${$.get(results).resource}\n`;

		text += `Generated at: ${$.get(results).timestamp}\n\n`;

		if ($.get(results).announced) {
			text += `Status: Announced in BGP\n`;
		} else {
			text += `Status: Not announced in BGP\n`;
		}

		if ($.get(results).originAS) {
			text += `\nOrigin AS: AS${$.get(results).originAS}\n`;

			if ($.get(results).originName) {
				text += `Origin Name: ${$.get(results).originName}\n`;
			}
		}

		if ($.get(results).asPath) {
			text += `\nAS Path: ${$.get(results).asPath.path.join(' ')}\n`;
		}

		if ($.get(results).prefixes.length > 0) {
			text += `\nPrefixes (${$.get(results).prefixes.length}):\n`;

			$.get(results).prefixes.forEach((prefix) => {
				text += `  ${prefix.prefix} - AS${prefix.asn} (${prefix.holder})`;

				if (prefix.country) text += ` [${prefix.country}]`;

				text += '\n';
			});
		}

		if ($.get(results).peers.length > 0) {
			text += `\nPeers (${$.get(results).peers.length}):\n`;

			$.get(results).peers.forEach((peer) => {
				text += `  AS${peer.asn}`;

				if (peer.country) text += ` [${peer.country}]`;

				text += '\n';
			});
		}

		await navigator.clipboard.writeText(text);
		$.set(copiedState, true);
		setTimeout(() => $.set(copiedState, false), 1500);
	}

	var div = root_22();
	var header = $.child(div);
	var h1 = $.child(header);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text_3 = $.only_child(h5, true);
		var p_1 = $.sibling(h5, 2);
		var text_4 = $.only_child(p_1, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Look up BGP info for ${$.get(example).resource}`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text_3, $.get(example).resource);
			$.set_text(text_4, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var label = $.child(div_5);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter an IP address or prefix (e.g., 8.8.8.8 or 8.8.8.0/24)');

	var div_6 = $.sibling(label, 2);
	var input = $.child(div_6);

	$.remove_input_defaults(input);

	var button_1 = $.sibling(input, 2);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_7 = root_17();
			var div_8 = $.child(div_7);
			var h3 = $.child(div_8);
			var text_5 = $.only_child(h3);
			var button_2 = $.sibling(h3, 2);
			var node_5 = $.child(button_2);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_6 = $.sibling(node_5);

			$.reset(button_2);
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var node_6 = $.child(div_11);

			{
				let $0 = $.derived(() => $.get(results).announced ? 'check-circle' : 'alert-circle');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var div_12 = $.sibling(node_6, 2);
			var h4 = $.child(div_12);
			var text_7 = $.only_child(h4, true);
			var p_2 = $.sibling(h4, 2);
			var text_8 = $.only_child(p_2, true);

			$.reset(div_12);
			$.reset(div_11);
			$.reset(div_10);

			var div_13 = $.sibling(div_10, 2);
			var node_7 = $.child(div_13);

			{
				var consequent_2 = ($$anchor) => {
					var div_14 = root_4();
					var div_15 = $.sibling($.child(div_14), 2);
					var node_8 = $.child(div_15);

					Icon(node_8, { name: 'building', size: 'md' });

					var div_16 = $.sibling(node_8, 2);
					var div_17 = $.child(div_16);
					var text_9 = $.only_child(div_17);
					var node_9 = $.sibling(div_17, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_18 = root_3();
							var text_10 = $.only_child(div_18, true);

							$.template_effect(() => $.set_text(text_10, $.get(results).originName));
							$.append($$anchor, div_18);
						};

						$.if(node_9, ($$render) => {
							if ($.get(results).originName) $$render(consequent_1);
						});
					}

					$.reset(div_16);
					$.reset(div_15);
					$.reset(div_14);
					$.template_effect(() => $.set_text(text_9, `AS${$.get(results).originAS ?? ''}`));
					$.append($$anchor, div_14);
				};

				$.if(node_7, ($$render) => {
					if ($.get(results).originAS) $$render(consequent_2);
				});
			}

			var node_10 = $.sibling(node_7, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_19 = root_6();
					var div_20 = $.sibling($.child(div_19), 2);

					$.each(div_20, 21, () => $.get(results).asPath.path, $.index, ($$anchor, asn, index) => {
						var span = root_5();
						var span_1 = $.child(span);
						var text_11 = $.only_child(span_1);
						var node_11 = $.sibling(span_1, 2);

						{
							var consequent_3 = ($$anchor) => {
								Icon($$anchor, { name: 'chevron-right', size: 'xs' });
							};

							$.if(node_11, ($$render) => {
								if (index < $.get(results).asPath.path.length - 1) $$render(consequent_3);
							});
						}

						$.reset(span);
						$.template_effect(() => $.set_text(text_11, `AS${$.get(asn) ?? ''}`));
						$.append($$anchor, span);
					});

					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var small = $.child(div_21);
					var text_12 = $.only_child(small);

					$.reset(div_21);
					$.reset(div_19);
					$.template_effect(() => $.set_text(text_12, `Path length: ${$.get(results).asPath.path.length ?? ''} hops`));
					$.append($$anchor, div_19);
				};

				$.if(node_10, ($$render) => {
					if ($.get(results).asPath && $.get(results).asPath.path.length > 0) $$render(consequent_4);
				});
			}

			var node_12 = $.sibling(node_10, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_22 = root_9();
					var h4_1 = $.child(div_22);
					var text_13 = $.only_child(h4_1);
					var node_13 = $.sibling(h4_1, 2);

					$.each(node_13, 17, () => $.get(results).prefixes, $.index, ($$anchor, prefix) => {
						var div_23 = root_8();
						var div_24 = $.child(div_23);
						var node_14 = $.child(div_24);

						Icon(node_14, { name: 'map', size: 'sm' });

						var span_2 = $.sibling(node_14, 2);
						var text_14 = $.only_child(span_2, true);

						$.reset(div_24);

						var div_25 = $.sibling(div_24, 2);
						var div_26 = $.child(div_25);
						var span_3 = $.sibling($.child(div_26), 2);
						var text_15 = $.only_child(span_3);

						$.reset(div_26);

						var div_27 = $.sibling(div_26, 2);
						var span_4 = $.sibling($.child(div_27), 2);
						var text_16 = $.only_child(span_4, true);

						$.reset(div_27);

						var node_15 = $.sibling(div_27, 2);

						{
							var consequent_5 = ($$anchor) => {
								var div_28 = root_7();
								var span_5 = $.sibling($.child(div_28), 2);
								var text_17 = $.only_child(span_5, true);

								$.reset(div_28);
								$.template_effect(() => $.set_text(text_17, $.get(prefix).country));
								$.append($$anchor, div_28);
							};

							$.if(node_15, ($$render) => {
								if ($.get(prefix).country) $$render(consequent_5);
							});
						}

						$.reset(div_25);
						$.reset(div_23);

						$.template_effect(() => {
							$.set_text(text_14, $.get(prefix).prefix);
							$.set_text(text_15, `AS${$.get(prefix).asn ?? ''}`);
							$.set_text(text_16, $.get(prefix).holder);
						});

						$.append($$anchor, div_23);
					});

					$.reset(div_22);
					$.template_effect(() => $.set_text(text_13, `BGP Prefixes (${$.get(results).prefixes.length ?? ''})`));
					$.append($$anchor, div_22);
				};

				$.if(node_12, ($$render) => {
					if ($.get(results).prefixes.length > 0) $$render(consequent_6);
				});
			}

			var node_16 = $.sibling(node_12, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_29 = root_12();
					var h4_2 = $.child(div_29);
					var text_18 = $.only_child(h4_2);
					var div_30 = $.sibling(h4_2, 2);

					$.each(div_30, 21, () => $.get(results).peers.slice(0, 8), $.index, ($$anchor, peer) => {
						var div_31 = root_11();
						var span_6 = $.child(div_31);
						var text_19 = $.only_child(span_6);
						var node_17 = $.sibling(span_6, 2);

						{
							var consequent_7 = ($$anchor) => {
								var span_7 = root_10();
								var text_20 = $.only_child(span_7, true);

								$.template_effect(() => $.set_text(text_20, $.get(peer).country));
								$.append($$anchor, span_7);
							};

							$.if(node_17, ($$render) => {
								if ($.get(peer).country) $$render(consequent_7);
							});
						}

						$.reset(div_31);
						$.template_effect(() => $.set_text(text_19, `AS${$.get(peer).asn ?? ''}`));
						$.append($$anchor, div_31);
					});

					$.reset(div_30);
					$.reset(div_29);
					$.template_effect(() => $.set_text(text_18, `BGP Peers (${$.get(results).peers.length ?? ''})`));
					$.append($$anchor, div_29);
				};

				$.if(node_16, ($$render) => {
					if ($.get(results).peers && $.get(results).peers.length > 0) $$render(consequent_8);
				});
			}

			var node_18 = $.sibling(node_16, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_32 = root_16();
					var div_33 = $.sibling($.child(div_32), 2);
					var node_19 = $.child(div_33);

					{
						var consequent_9 = ($$anchor) => {
							var div_34 = root_14();
							var h5_1 = $.child(div_34);
							var text_21 = $.only_child(h5_1);
							var div_35 = $.sibling(h5_1, 2);

							$.each(div_35, 21, () => $.get(results).moreSpecifics, $.index, ($$anchor, prefix) => {
								var span_8 = root_13();
								var text_22 = $.only_child(span_8, true);

								$.template_effect(() => $.set_text(text_22, $.get(prefix)));
								$.append($$anchor, span_8);
							});

							$.reset(div_35);
							$.reset(div_34);
							$.template_effect(() => $.set_text(text_21, `More Specific (${$.get(results).moreSpecifics.length ?? ''})`));
							$.append($$anchor, div_34);
						};

						$.if(node_19, ($$render) => {
							if ($.get(results).moreSpecifics && $.get(results).moreSpecifics.length > 0) $$render(consequent_9);
						});
					}

					var node_20 = $.sibling(node_19, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_36 = root_14();
							var h5_2 = $.child(div_36);
							var text_23 = $.only_child(h5_2);
							var div_37 = $.sibling(h5_2, 2);

							$.each(div_37, 21, () => $.get(results).lessSpecifics, $.index, ($$anchor, prefix) => {
								var span_9 = root_15();
								var text_24 = $.only_child(span_9, true);

								$.template_effect(() => $.set_text(text_24, $.get(prefix)));
								$.append($$anchor, span_9);
							});

							$.reset(div_37);
							$.reset(div_36);
							$.template_effect(() => $.set_text(text_23, `Less Specific (${$.get(results).lessSpecifics.length ?? ''})`));
							$.append($$anchor, div_36);
						};

						$.if(node_20, ($$render) => {
							if ($.get(results).lessSpecifics && $.get(results).lessSpecifics.length > 0) $$render(consequent_10);
						});
					}

					$.reset(div_33);
					$.reset(div_32);
					$.append($$anchor, div_32);
				};

				$.if(node_18, ($$render) => {
					if ($.get(results).moreSpecifics && $.get(results).moreSpecifics.length > 0 || $.get(results).lessSpecifics && $.get(results).lessSpecifics.length > 0) $$render(consequent_11);
				});
			}

			$.reset(div_13);
			$.reset(div_9);
			$.reset(div_7);

			$.template_effect(() => {
				$.set_text(text_5, `BGP Routing Information for ${$.get(results).resource ?? ''}`);
				button_2.disabled = $.get(copiedState);
				$.set_text(text_6, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Results'}`);
				$.set_class(div_11, 1, `status-item ${$.get(results).announced ? 'success' : 'warning'}`, 'svelte-1gwrbdt');
				$.set_text(text_7, $.get(results).announced ? 'Announced in BGP' : 'Not Announced');

				$.set_text(text_8, $.get(results).announced
					? 'This resource is actively advertised in the global BGP routing table'
					: 'This resource is not currently visible in BGP');
			});

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_12);
		});
	}

	var node_21 = $.sibling(node_4, 2);

	{
		var consequent_13 = ($$anchor) => {
			var div_38 = root_18();
			var div_39 = $.child(div_38);
			var div_40 = $.child(div_39);
			var node_22 = $.child(div_40);

			Icon(node_22, { name: 'alert-triangle', size: 'md' });

			var div_41 = $.sibling(node_22, 2);
			var p_3 = $.sibling($.child(div_41), 2);
			var text_25 = $.only_child(p_3, true);

			$.reset(div_41);
			$.reset(div_40);
			$.reset(div_39);
			$.reset(div_38);
			$.template_effect(() => $.set_text(text_25, $.get(error)));
			$.append($$anchor, div_38);
		};

		$.if(node_21, ($$render) => {
			if ($.get(error)) $$render(consequent_13);
		});
	}

	var div_42 = $.sibling(node_21, 2);
	var div_43 = $.sibling($.child(div_42), 2);
	var div_44 = $.child(div_43);
	var div_45 = $.child(div_44);
	var h4_3 = $.child(div_45);
	var text_26 = $.only_child(h4_3, true);
	var p_4 = $.sibling(h4_3, 2);
	var text_27 = $.only_child(p_4, true);

	$.reset(div_45);

	var div_46 = $.sibling(div_45, 2);
	var h4_4 = $.child(div_46);
	var text_28 = $.only_child(h4_4, true);
	var p_5 = $.sibling(h4_4, 2);
	var text_29 = $.only_child(p_5, true);
	var ul = $.sibling(p_5, 2);

	$.each(ul, 21, () => bgpContent.sections.asPath.attributes, (attr) => attr.name, ($$anchor, attr) => {
		var li = root_19();
		var strong = $.child(li);
		var text_30 = $.only_child(strong);
		var text_31 = $.sibling(strong);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text_30, `${$.get(attr).name ?? ''}:`);
			$.set_text(text_31, ` ${$.get(attr).description ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_46);

	var div_47 = $.sibling(div_46, 2);
	var h4_5 = $.child(div_47);
	var text_32 = $.only_child(h4_5, true);
	var ul_1 = $.sibling(h4_5, 2);

	$.each(ul_1, 21, () => bgpContent.sections.routeTypes.types, (type) => type.type, ($$anchor, type) => {
		var li_1 = root_20();
		var strong_1 = $.child(li_1);
		var text_33 = $.only_child(strong_1);
		var text_34 = $.sibling(strong_1);
		var small_1 = $.sibling(text_34);
		var text_35 = $.only_child(small_1);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_text(text_33, `${$.get(type).type ?? ''}:`);
			$.set_text(text_34, ` ${$.get(type).description ?? ''} `);
			$.set_text(text_35, `(${$.get(type).indicator ?? ''})`);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_47);

	var div_48 = $.sibling(div_47, 2);
	var h4_6 = $.child(div_48);
	var text_36 = $.only_child(h4_6, true);
	var p_6 = $.sibling(h4_6, 2);
	var text_37 = $.only_child(p_6, true);

	$.reset(div_48);
	$.reset(div_44);

	var div_49 = $.sibling(div_44, 2);
	var ul_2 = $.sibling($.child(div_49), 2);

	$.each(ul_2, 21, () => bgpContent.quickTips, $.index, ($$anchor, tip) => {
		var li_2 = root_21();
		var text_38 = $.only_child(li_2, true);

		$.template_effect(() => $.set_text(text_38, $.get(tip)));
		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_49);
	$.reset(div_43);
	$.reset(div_42);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text_1, bgpContent.title);
			$.set_text(text_2, bgpContent.description);
			button_1.disabled = $0;
			$.set_text(text_26, bgpContent.sections.whatIsBGP.title);
			$.set_text(text_27, bgpContent.sections.whatIsBGP.content);
			$.set_text(text_28, bgpContent.sections.asPath.title);
			$.set_text(text_29, bgpContent.sections.asPath.content);
			$.set_text(text_32, bgpContent.sections.routeTypes.title);
			$.set_text(text_36, bgpContent.sections.dataSource.title);
			$.set_text(text_37, bgpContent.sections.dataSource.content);
		},
		[() => $.get(loading) || !$.get(resource).trim()]
	);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(resource).trim()) lookupBGP();
	});

	$.bind_value(input, () => $.get(resource), ($$value) => $.set(resource, $$value));
	$.delegated('click', button_1, lookupBGP);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);