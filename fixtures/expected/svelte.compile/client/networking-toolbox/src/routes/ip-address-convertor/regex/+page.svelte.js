import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPRegexGenerator from '$lib/components/tools/IPRegexGenerator.svelte';
import { ipAddressValidationContent } from '$lib/content/ip-address-validation.js';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="example-card svelte-1r7pivk"><h4 class="svelte-1r7pivk"> </h4> <div class="pattern-code svelte-1r7pivk"><code class="svelte-1r7pivk"> </code></div> <p class="example-description svelte-1r7pivk"> </p> <div class="example-details svelte-1r7pivk"><div class="matches svelte-1r7pivk"><strong class="svelte-1r7pivk">Matches:</strong> </div> <div class="fails svelte-1r7pivk"><strong class="svelte-1r7pivk">Fails:</strong> </div> <div class="limitation svelte-1r7pivk"><strong class="svelte-1r7pivk">Limitation:</strong> </div></div></div>`);
var root_1 = $.from_html(`<div class="recommendation-card svelte-1r7pivk"><div class="rec-icon svelte-1r7pivk"><!></div> <div class="rec-content svelte-1r7pivk"><h4 class="svelte-1r7pivk"> </h4> <p class="svelte-1r7pivk"> </p></div></div>`);
var root_2 = $.from_html(`<!> <div class="card content-section svelte-1r7pivk"><div class="container"><div class="card-header ref-header svelte-1r7pivk"><h2 class="svelte-1r7pivk"> </h2> <p class="subtitle"> </p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk"> </h3> <p class="svelte-1r7pivk"> </p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk"> </h3> <p class="svelte-1r7pivk"></p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk"> </h3> <p class="svelte-1r7pivk"></p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk"> </h3> <p class="svelte-1r7pivk"></p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">Example Patterns</h3> <div class="examples-grid svelte-1r7pivk"></div></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk"> </h3> <p class="svelte-1r7pivk"></p></div> <div class="ref-section svelte-1r7pivk"><h3 class="svelte-1r7pivk">Key Recommendations</h3> <div class="recommendations-grid svelte-1r7pivk"></div></div></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var node = $.first_child(fragment);

	IPRegexGenerator(node, {});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h3 = $.child(div_3);
	var text_2 = $.only_child(h3, true);
	var p_1 = $.sibling(h3, 2);
	var text_3 = $.only_child(p_1, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var h3_1 = $.child(div_4);
	var text_4 = $.only_child(h3_1, true);
	var p_2 = $.sibling(h3_1, 2);

	$.html(p_2, () => ipAddressValidationContent.sections.ipv4.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'), true);
	$.reset(p_2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var h3_2 = $.child(div_5);
	var text_5 = $.only_child(h3_2, true);
	var p_3 = $.sibling(h3_2, 2);

	$.html(p_3, () => ipAddressValidationContent.sections.ipv6.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'), true);
	$.reset(p_3);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var h3_3 = $.child(div_6);
	var text_6 = $.only_child(h3_3, true);
	var p_4 = $.sibling(h3_3, 2);

	$.html(p_4, () => ipAddressValidationContent.sections.regexValidation.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'), true);
	$.reset(p_4);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.sibling($.child(div_7), 2);

	$.each(div_8, 21, () => Object.values(ipAddressValidationContent.examples), (example) => example.pattern, ($$anchor, example) => {
		var div_9 = root();
		var h4 = $.child(div_9);
		var text_7 = $.only_child(h4, true);
		var div_10 = $.sibling(h4, 2);
		var code = $.child(div_10);
		var text_8 = $.only_child(code, true);

		$.reset(div_10);

		var p_5 = $.sibling(div_10, 2);
		var text_9 = $.only_child(p_5, true);
		var div_11 = $.sibling(p_5, 2);
		var div_12 = $.child(div_11);
		var text_10 = $.sibling($.child(div_12));

		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var text_11 = $.sibling($.child(div_13));

		$.reset(div_13);

		var div_14 = $.sibling(div_13, 2);
		var text_12 = $.sibling($.child(div_14));

		$.reset(div_14);
		$.reset(div_11);
		$.reset(div_9);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_7, $.get(example).title);
				$.set_text(text_8, $.get(example).pattern);
				$.set_text(text_9, $.get(example).description);
				$.set_text(text_10, ` ${$0 ?? ''}`);
				$.set_text(text_11, ` ${$1 ?? ''}`);
				$.set_text(text_12, ` ${$.get(example).limitation ?? ''}`);
			},
			[
				() => $.get(example).matches.join(', '),
				() => $.get(example).fails.join(', ')
			]
		);

		$.append($$anchor, div_9);
	});

	$.reset(div_8);
	$.reset(div_7);

	var div_15 = $.sibling(div_7, 2);
	var h3_4 = $.child(div_15);
	var text_13 = $.only_child(h3_4, true);
	var p_6 = $.sibling(h3_4, 2);

	$.html(p_6, () => ipAddressValidationContent.sections.practicalTips.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;'), true);
	$.reset(p_6);
	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var div_17 = $.sibling($.child(div_16), 2);

	$.each(div_17, 21, () => ipAddressValidationContent.recommendations, (rec) => rec.title, ($$anchor, rec) => {
		var div_18 = root_1();
		var div_19 = $.child(div_18);
		var node_1 = $.child(div_19);

		Icon(node_1, {
			get name() {
				return $.get(rec).icon;
			},
			size: 'md'
		});

		$.reset(div_19);

		var div_20 = $.sibling(div_19, 2);
		var h4_1 = $.child(div_20);
		var text_14 = $.only_child(h4_1, true);
		var p_7 = $.sibling(h4_1, 2);
		var text_15 = $.only_child(p_7, true);

		$.reset(div_20);
		$.reset(div_18);

		$.template_effect(() => {
			$.set_style(div_19, `color: ${$.get(rec).color ?? ''}`);
			$.set_text(text_14, $.get(rec).title);
			$.set_text(text_15, $.get(rec).description);
		});

		$.append($$anchor, div_18);
	});

	$.reset(div_17);
	$.reset(div_16);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ipAddressValidationContent.title);
		$.set_text(text_1, ipAddressValidationContent.description);
		$.set_text(text_2, ipAddressValidationContent.sections.overview.title);
		$.set_text(text_3, ipAddressValidationContent.sections.overview.content);
		$.set_text(text_4, ipAddressValidationContent.sections.ipv4.title);
		$.set_text(text_5, ipAddressValidationContent.sections.ipv6.title);
		$.set_text(text_6, ipAddressValidationContent.sections.regexValidation.title);
		$.set_text(text_13, ipAddressValidationContent.sections.practicalTips.title);
	});

	$.append($$anchor, fragment);
	$.pop();
}