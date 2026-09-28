import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { humanizeTTL, calculateCacheExpiry } from '$lib/utils/dns-validation.js';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

var root = $.from_html(`<button><div class="ttl-value svelte-1ppq2qw"> </div> <div class="ttl-seconds svelte-1ppq2qw"> </div> <div class="ttl-description svelte-1ppq2qw"> </div></button>`);
var root_1 = $.from_html(`<button><div class="example-scenario svelte-1ppq2qw"> </div> <div class="example-ttl svelte-1ppq2qw"> </div> <div class="example-description svelte-1ppq2qw"> </div></button>`);
var root_2 = $.from_html(`<input type="datetime-local"/>`);
var root_3 = $.from_html(`<div class="expiry-card svelte-1ppq2qw"><div class="expiry-label svelte-1ppq2qw"><!> From Custom Date</div> <div class="expiry-time svelte-1ppq2qw"> </div> <div class="expiry-relative svelte-1ppq2qw"> </div></div>`);
var root_4 = $.from_html(`<li class="recommendation-item svelte-1ppq2qw"> </li>`);
var root_5 = $.from_html(`<div class="card results-card svelte-1ppq2qw"><div class="results-header svelte-1ppq2qw"><h3 class="svelte-1ppq2qw">TTL Analysis</h3> <button><!> Copy TTL</button></div> <div class="ttl-analysis svelte-1ppq2qw"><div class="ttl-main-info svelte-1ppq2qw"><div class="ttl-human svelte-1ppq2qw"><span class="ttl-human-value svelte-1ppq2qw"> </span> <span> </span></div> <div class="ttl-seconds-display svelte-1ppq2qw"><span class="seconds-value svelte-1ppq2qw"> </span> <span class="seconds-label svelte-1ppq2qw">seconds</span></div></div></div> <div class="expiry-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Cache Expiry Times</h4> <div class="expiry-cards svelte-1ppq2qw"><div class="expiry-card svelte-1ppq2qw"><div class="expiry-label svelte-1ppq2qw"><!> From Now</div> <div class="expiry-time svelte-1ppq2qw"> </div> <div class="expiry-relative svelte-1ppq2qw"> </div></div> <!></div></div> <div class="recommendations-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Summary</h4> <ul class="recommendations-list svelte-1ppq2qw"></ul></div> <div class="guidelines-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">TTL Guidelines by Category</h4> <div class="guidelines-grid svelte-1ppq2qw"><div class="guideline-item svelte-1ppq2qw"><div class="guideline-category very-short svelte-1ppq2qw">Very Short (&lt; 5 min)</div> <div class="guideline-text svelte-1ppq2qw">High DNS load, instant propagation</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category short svelte-1ppq2qw">Short (5 min - 1 hr)</div> <div class="guideline-text svelte-1ppq2qw">Frequent changes, good for testing</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category medium svelte-1ppq2qw">Medium (1 hr - 1 day)</div> <div class="guideline-text svelte-1ppq2qw">Balanced performance and flexibility</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category long svelte-1ppq2qw">Long (1 day - 1 week)</div> <div class="guideline-text svelte-1ppq2qw">Stable records, reduced DNS queries</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category very-long svelte-1ppq2qw">Very Long (> 1 week)</div> <div class="guideline-text svelte-1ppq2qw">Infrastructure, rarely changes</div></div></div></div></div>`);

var root_6 = $.from_html(`<div class="card"><header class="card-header"><h1>TTL Calculator</h1> <p>Humanize DNS TTL values and compute cache expiry times from now or specific dates</p></header> <div class="card info-card svelte-1ppq2qw"><div class="overview-content svelte-1ppq2qw"><div class="overview-item svelte-1ppq2qw"><!> <div><strong class="svelte-1ppq2qw">TTL Humanization:</strong> Convert seconds to human-readable formats like "2 hours" or "1 day".</div></div> <div class="overview-item svelte-1ppq2qw"><!> <div><strong class="svelte-1ppq2qw">Cache Expiry:</strong> Calculate when DNS records will expire from resolver caches.</div></div> <div class="overview-item svelte-1ppq2qw"><!> <div><strong class="svelte-1ppq2qw">TTL Guidelines:</strong> Get recommendations based on record stability and use case.</div></div></div></div> <div class="card common-ttls-card svelte-1ppq2qw"><details class="common-details svelte-1ppq2qw"><summary class="common-summary svelte-1ppq2qw"><!> <h4 class="svelte-1ppq2qw">Common TTL Values</h4></summary> <div class="ttls-grid svelte-1ppq2qw"></div></details></div> <div class="card examples-card svelte-1ppq2qw"><details class="examples-details svelte-1ppq2qw"><summary class="examples-summary svelte-1ppq2qw"><!> <h4 class="svelte-1ppq2qw">TTL by Use Case</h4></summary> <div class="examples-grid svelte-1ppq2qw"></div></details></div> <div class="card input-card svelte-1ppq2qw"><div class="input-group svelte-1ppq2qw"><label for="ttl-input" class="svelte-1ppq2qw"><!> TTL (seconds)</label> <input id="ttl-input" type="number" placeholder="3600" class="ttl-input svelte-1ppq2qw" min="0" max="2147483647"/></div> <div class="input-group svelte-1ppq2qw"><label class="checkbox-label svelte-1ppq2qw"><input type="checkbox" class="styled-checkbox svelte-1ppq2qw"/> Calculate expiry from custom date/time</label> <!></div></div> <!> <div class="education-card svelte-1ppq2qw"><div class="education-grid svelte-1ppq2qw"><div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">TTL Trade-offs</h4> <p class="svelte-1ppq2qw">Lower TTLs allow faster propagation of DNS changes but increase DNS query load. Higher TTLs reduce DNS traffic
          but slow down change propagation. Balance based on your needs.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Cache Behavior</h4> <p class="svelte-1ppq2qw">DNS resolvers cache records for the TTL duration. Once expired, they must query authoritative servers again.
          Some resolvers may cache slightly longer or shorter than the exact TTL.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Change Planning</h4> <p class="svelte-1ppq2qw">Before making DNS changes, consider lowering TTLs in advance. This reduces the time users see old records.
          After changes stabilize, you can increase TTLs again.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Monitoring Impact</h4> <p class="svelte-1ppq2qw">Monitor DNS query volumes when changing TTLs. Very short TTLs can significantly increase load on authoritative
          servers and may impact DNS provider costs.</p></div></div></div></div>`);

export default function TTLCalculator($$anchor, $$props) {
	$.push($$props, true);

	let ttlInput = $.state('3600');
	let customDate = $.state('');
	let useCustomDate = $.state(false);
	let activeTTLIndex = $.state(null);
	let activeExampleIndex = $.state(null);
	let results = $.state(null);
	const clipboard = useClipboard();

	const commonTTLs = [
		{
			seconds: 60,
			label: '1 minute',
			description: 'Very short - high DNS load'
		},

		{
			seconds: 300,
			label: '5 minutes',
			description: 'Short - for frequently changing records'
		},

		{
			seconds: 600,
			label: '10 minutes',
			description: 'Short - development/testing'
		},

		{
			seconds: 1800,
			label: '30 minutes',
			description: 'Medium-short - moderate changes'
		},

		{
			seconds: 3600,
			label: '1 hour',
			description: 'Medium - balanced performance'
		},

		{
			seconds: 7200,
			label: '2 hours',
			description: 'Medium - most web services'
		},

		{
			seconds: 14400,
			label: '4 hours',
			description: 'Medium-long - stable services'
		},

		{
			seconds: 43200,
			label: '12 hours',
			description: 'Long - very stable records'
		},

		{
			seconds: 86400,
			label: '1 day',
			description: 'Long - default for many records'
		},

		{
			seconds: 172800,
			label: '2 days',
			description: 'Very long - infrastructure records'
		},

		{
			seconds: 604800,
			label: '1 week',
			description: 'Very long - rarely changing records'
		}
	];

	const examples = [
		{
			ttl: '300',
			scenario: 'Load Balancer IP',
			description: 'Short TTL for quick failover capability'
		},

		{
			ttl: '3600',
			scenario: 'Web Server A Record',
			description: 'Standard TTL for web services'
		},

		{
			ttl: '86400',
			scenario: 'MX Record',
			description: 'Stable mail server configuration'
		},

		{
			ttl: '604800',
			scenario: 'NS Record',
			description: 'Authoritative name servers rarely change'
		}
	];

	function loadExample(example, index) {
		$.set(ttlInput, example.ttl, true);
		$.set(activeExampleIndex, index, true);
		$.set(activeTTLIndex, null);
		calculateTTL();
	}

	function loadCommonTTL(ttl, index) {
		$.set(ttlInput, ttl.toString(), true);
		$.set(activeTTLIndex, index, true);
		$.set(activeExampleIndex, null);
		calculateTTL();
	}

	function calculateTTL() {
		const ttlSeconds = parseInt($.get(ttlInput));

		if (isNaN(ttlSeconds) || ttlSeconds < 0) {
			$.set(results, null);

			return;
		}

		const ttlInfo = humanizeTTL(ttlSeconds);
		const expiryFromNow = calculateCacheExpiry(ttlSeconds);
		let expiryFromCustom;
		let customDateValid = true;

		if ($.get(useCustomDate) && $.get(customDate)) {
			const customDateTime = new Date($.get(customDate));

			if (!isNaN(customDateTime.getTime())) {
				expiryFromCustom = calculateCacheExpiry(ttlSeconds, customDateTime);
			} else {
				customDateValid = false;
			}
		}

		$.set(results, { ttlInfo, expiryFromNow, expiryFromCustom, customDateValid }, true);
	}

	function formatDateTime(date) {
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short'
		});
	}

	function formatRelativeTime(date) {
		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffMinutes = Math.round(diffMs / (1000 * 60));
		const diffHours = Math.round(diffMs / (1000 * 60 * 60));
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		if (Math.abs(diffMinutes) < 60) {
			return diffMinutes > 0
				? `in ${diffMinutes} minutes`
				: `${Math.abs(diffMinutes)} minutes ago`;
		} else if (Math.abs(diffHours) < 24) {
			return diffHours > 0
				? `in ${diffHours} hours`
				: `${Math.abs(diffHours)} hours ago`;
		} else {
			return diffDays > 0
				? `in ${diffDays} days`
				: `${Math.abs(diffDays)} days ago`;
		}
	}

	function handleInputChange() {
		// Clear active states when user manually changes input
		$.set(activeTTLIndex, null);

		$.set(activeExampleIndex, null);
		calculateTTL();
	}

	// Calculate on component load
	calculateTTL();

	var div = root_6();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'clock', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'calendar', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'target', size: 'sm' });
	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 23, () => commonTTLs, (ttl) => ttl.seconds, ($$anchor, ttl, index) => {
		var button = root();
		var div_8 = $.child(button);
		var text = $.only_child(div_8, true);
		var div_9 = $.sibling(div_8, 2);
		var text_1 = $.only_child(div_9);
		var div_10 = $.sibling(div_9, 2);
		var text_2 = $.only_child(div_10, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `ttl-card ${$.get(activeTTLIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1ppq2qw');
			$.set_text(text, $.get(ttl).label);
			$.set_text(text_1, `${$.get(ttl).seconds ?? ''}s`);
			$.set_text(text_2, $.get(ttl).description);
		});

		$.delegated('click', button, () => loadCommonTTL($.get(ttl).seconds, $.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_11 = $.sibling(div_6, 2);
	var details_1 = $.child(div_11);
	var summary_1 = $.child(details_1);
	var node_4 = $.child(summary_1);

	Icon(node_4, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary_1);

	var div_12 = $.sibling(summary_1, 2);

	$.each(div_12, 23, () => examples, (example) => example.scenario, ($$anchor, example, index) => {
		var button_1 = root_1();
		var div_13 = $.child(button_1);
		var text_3 = $.only_child(div_13, true);
		var div_14 = $.sibling(div_13, 2);
		var text_4 = $.only_child(div_14);
		var div_15 = $.sibling(div_14, 2);
		var text_5 = $.only_child(div_15, true);

		$.reset(button_1);

		$.template_effect(() => {
			$.set_class(button_1, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1ppq2qw');
			$.set_text(text_3, $.get(example).scenario);
			$.set_text(text_4, `${$.get(example).ttl ?? ''} seconds`);
			$.set_text(text_5, $.get(example).description);
		});

		$.delegated('click', button_1, () => loadExample($.get(example), $.get(index)));
		$.append($$anchor, button_1);
	});

	$.reset(div_12);
	$.reset(details_1);
	$.reset(div_11);

	var div_16 = $.sibling(div_11, 2);
	var div_17 = $.child(div_16);
	var label = $.child(div_17);
	var node_5 = $.child(label);

	Icon(node_5, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter TTL value in seconds');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var label_1 = $.child(div_18);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var node_6 = $.sibling(label_1, 2);

	{
		var consequent = ($$anchor) => {
			var input_2 = root_2();

			$.remove_input_defaults(input_2);
			$.template_effect(() => $.set_class(input_2, 1, `custom-date-input ${$.get(results) && !$.get(results).customDateValid ? 'invalid' : ''}`, 'svelte-1ppq2qw'));
			$.delegated('input', input_2, handleInputChange);
			$.bind_value(input_2, () => $.get(customDate), ($$value) => $.set(customDate, $$value));
			$.append($$anchor, input_2);
		};

		$.if(node_6, ($$render) => {
			if ($.get(useCustomDate)) $$render(consequent);
		});
	}

	$.reset(div_18);
	$.reset(div_16);

	var node_7 = $.sibling(div_16, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_19 = root_5();
			var div_20 = $.child(div_19);
			var button_2 = $.sibling($.child(div_20), 2);
			var node_8 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next();
			$.reset(button_2);
			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var div_22 = $.child(div_21);
			var div_23 = $.child(div_22);
			var span = $.child(div_23);
			var text_6 = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_7 = $.only_child(span_1, true);

			$.reset(div_23);

			var div_24 = $.sibling(div_23, 2);
			var span_2 = $.child(div_24);
			var text_8 = $.only_child(span_2, true);

			$.next(2);
			$.reset(div_24);
			$.reset(div_22);
			$.reset(div_21);

			var div_25 = $.sibling(div_21, 2);
			var div_26 = $.sibling($.child(div_25), 2);
			var div_27 = $.child(div_26);
			var div_28 = $.child(div_27);
			var node_9 = $.child(div_28);

			Icon(node_9, { name: 'clock', size: 'sm' });
			$.next();
			$.reset(div_28);

			var div_29 = $.sibling(div_28, 2);
			var text_9 = $.only_child(div_29, true);
			var div_30 = $.sibling(div_29, 2);
			var text_10 = $.only_child(div_30, true);

			$.reset(div_27);

			var node_10 = $.sibling(div_27, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_31 = root_3();
					var div_32 = $.child(div_31);
					var node_11 = $.child(div_32);

					Icon(node_11, { name: 'calendar', size: 'sm' });
					$.next();
					$.reset(div_32);

					var div_33 = $.sibling(div_32, 2);
					var text_11 = $.only_child(div_33, true);
					var div_34 = $.sibling(div_33, 2);
					var text_12 = $.only_child(div_34, true);

					$.reset(div_31);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_11, $0);
							$.set_text(text_12, $1);
						},
						[
							() => formatDateTime($.get(results).expiryFromCustom),
							() => formatRelativeTime($.get(results).expiryFromCustom)
						]
					);

					$.append($$anchor, div_31);
				};

				$.if(node_10, ($$render) => {
					if ($.get(useCustomDate) && $.get(results).expiryFromCustom) $$render(consequent_1);
				});
			}

			$.reset(div_26);
			$.reset(div_25);

			var div_35 = $.sibling(div_25, 2);
			var ul = $.sibling($.child(div_35), 2);

			$.each(ul, 21, () => $.get(results).ttlInfo.recommendations, $.index, ($$anchor, recommendation) => {
				var li = root_4();
				var text_13 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_13, $.get(recommendation)));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_35);
			$.next(2);
			$.reset(div_19);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					$.set_class(button_2, 1, `copy-button ${$0 ?? ''}`, 'svelte-1ppq2qw');
					$.set_text(text_6, $.get(results).ttlInfo.human);
					$.set_class(span_1, 1, `ttl-category ${$.get(results).ttlInfo.category ?? ''}`, 'svelte-1ppq2qw');
					$.set_text(text_7, $1);
					$.set_text(text_8, $2);
					$.set_text(text_9, $3);
					$.set_text(text_10, $4);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => $.get(results).ttlInfo.category.replace('-', ' '),
					() => formatNumber($.get(results).ttlInfo.seconds),
					() => formatDateTime($.get(results).expiryFromNow),
					() => formatRelativeTime($.get(results).expiryFromNow)
				]
			);

			$.delegated('click', button_2, () => clipboard.copy($.get(ttlInput)));
			$.append($$anchor, div_19);
		};

		$.if(node_7, ($$render) => {
			if ($.get(results)) $$render(consequent_2);
		});
	}

	$.next(2);
	$.reset(div);
	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(ttlInput), ($$value) => $.set(ttlInput, $$value));
	$.delegated('change', input_1, handleInputChange);
	$.bind_checked(input_1, () => $.get(useCustomDate), ($$value) => $.set(useCustomDate, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);