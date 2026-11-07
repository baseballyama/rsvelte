import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { suggestRRSIGWindows, formatRRSIGDates, validateRRSIGTiming } from '$lib/utils/dnssec';

var root = $.from_html(`<p class="field-error svelte-1m4lzsh">TTL must be between 1 and 86400 seconds</p>`);
var root_1 = $.from_html(`<p class="field-error svelte-1m4lzsh">Overlap must be between 1 and 168 hours</p>`);
var root_2 = $.from_html(`<p class="field-error svelte-1m4lzsh">Lead time must be between 1 and 168 hours</p>`);
var root_3 = $.from_html(`<p class="field-error svelte-1m4lzsh">Clock skew must be between 0 and 24 hours</p>`);
var root_4 = $.from_html(`<p class="field-error svelte-1m4lzsh">Validity must be between 1 and 365 days</p>`);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<div class="card warning-card svelte-1m4lzsh"><div class="warning-content svelte-1m4lzsh"><!> <div><strong class="svelte-1m4lzsh">Timing Warnings:</strong> <ul class="warning-list svelte-1m4lzsh"></ul></div></div></div>`);
var root_7 = $.from_html(`<div class="window-content svelte-1m4lzsh"><div class="timing-item inception svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Inception (Start Time)</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div> <div class="timing-readable svelte-1m4lzsh"> </div></div> <div class="timing-item expiration svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Expiration (End Time)</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div> <div class="timing-readable svelte-1m4lzsh"> </div></div> <div class="timing-item renewal svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Renewal Time</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div> <div class="timing-note svelte-1m4lzsh">Generate next signatures before this time</div></div> <div class="metrics-grid svelte-1m4lzsh"><div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Validity Period</span> <span class="metric-value svelte-1m4lzsh"> </span></div> <div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Lead Time</span> <span class="metric-value svelte-1m4lzsh"> </span></div> <div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Overlap Period</span> <span class="metric-value svelte-1m4lzsh"> </span></div></div></div>`);
var root_8 = $.from_html(`<div class="window-content svelte-1m4lzsh"><div class="timing-item inception svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Next Inception</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div> <div class="timing-readable svelte-1m4lzsh"> </div></div> <div class="timing-item expiration svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Next Expiration</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div> <div class="timing-readable svelte-1m4lzsh"> </div></div> <div class="timing-item renewal svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh"><!> <span class="timing-label svelte-1m4lzsh">Following Renewal</span></div> <div class="timing-value mono svelte-1m4lzsh"> </div></div> <div class="copy-schedule-section svelte-1m4lzsh"><button><!> Copy Full Schedule</button></div></div>`);

var root_9 = $.from_html(`<div class="card svelte-1m4lzsh"><header class="card-header"><h1>RRSIG Planner</h1> <p>Suggest RRSIG validity windows (inception/expiration) based on TTLs and desired overlap, with renewal lead-time
      guidance for automated DNSSEC signature management.</p></header> <div class="card input-card svelte-1m4lzsh"><div class="input-grid svelte-1m4lzsh"><div class="form-group svelte-1m4lzsh"><label for="ttl" class="svelte-1m4lzsh"><!> TTL (seconds)</label> <input id="ttl" type="number" min="1" max="86400"/> <!></div> <div class="form-group svelte-1m4lzsh"><label for="overlap" class="svelte-1m4lzsh"><!> Desired Overlap (hours)</label> <input id="overlap" type="number" min="1" max="168"/> <!></div> <div class="form-group svelte-1m4lzsh"><label for="lead-time" class="svelte-1m4lzsh"><!> Renewal Lead Time (hours)</label> <input id="lead-time" type="number" min="1" max="168"/> <!></div> <div class="form-group svelte-1m4lzsh"><label for="clock-skew" class="svelte-1m4lzsh"><!> Clock Skew (hours)</label> <input id="clock-skew" type="number" min="0" max="24" step="0.5"/> <!></div> <div class="form-group svelte-1m4lzsh"><label for="validity-days" class="svelte-1m4lzsh"><!> Signature Validity (days)</label> <input id="validity-days" type="number" min="1" max="365"/> <!></div></div></div> <!> <div class="windows-section svelte-1m4lzsh"><div class="windows-grid svelte-1m4lzsh"><div class="card window-card svelte-1m4lzsh"><div class="window-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Current Signature Window</h3> <button><!> Copy</button></div> <!></div> <div class="card window-card svelte-1m4lzsh"><div class="window-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Next Signature Window</h3></div> <!></div></div></div> <div class="card guidelines-card svelte-1m4lzsh"><div class="card-section-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Implementation Guidelines</h3></div> <div class="guidelines-content svelte-1m4lzsh"><div class="guideline-section svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Automation Schedule:</h4> <ul class="guideline-list svelte-1m4lzsh"><li class="svelte-1m4lzsh">Monitor renewal times continuously</li> <li class="svelte-1m4lzsh"> </li> <li class="svelte-1m4lzsh"> </li> <li class="svelte-1m4lzsh"> </li></ul></div> <div class="guideline-section svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Best Practices:</h4> <ul class="guideline-list svelte-1m4lzsh"><li class="svelte-1m4lzsh">Test signature generation before deployment</li> <li class="svelte-1m4lzsh">Monitor DNSSEC validation after updates</li> <li class="svelte-1m4lzsh">Keep backup signatures for rollback</li> <li class="svelte-1m4lzsh">Log all signature generation events</li></ul></div></div></div> <div class="education-card svelte-1m4lzsh"><div class="education-grid svelte-1m4lzsh"><div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">RRSIG Timing</h4> <p class="svelte-1m4lzsh">RRSIG records have inception and expiration timestamps that define when the signature is valid. Proper timing
          ensures continuous DNSSEC validation during key transitions.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Overlap Strategy</h4> <p class="svelte-1m4lzsh">Overlapping signature validity periods prevent validation failures during rollover. New signatures should be
          generated before old ones expire.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Clock Skew Tolerance</h4> <p class="svelte-1m4lzsh">Account for time differences between authoritative servers and validators. Start signatures slightly in the
          past to accommodate clock skew.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Automation Benefits</h4> <p class="svelte-1m4lzsh">Automated RRSIG generation reduces manual errors and ensures consistent timing. Plan renewal schedules based
          on TTL values and operational requirements.</p></div></div></div></div>`);

export default function RRSIGPlanner($$anchor, $$props) {
	$.push($$props, true);

	let ttl = $.state(3600);
	let desiredOverlap = $.state(24);
	let renewalLeadTime = $.state(24);
	let clockSkew = $.state(1);
	let signatureValidityDays = $.state(30);
	const clipboard = useClipboard();

	const planningOptions = $.derived(() => ({
		ttl: $.get(ttl),
		desiredOverlap: $.get(desiredOverlap),
		renewalLeadTime: $.get(renewalLeadTime),
		clockSkew: $.get(clockSkew),
		signatureValidityDays: $.get(signatureValidityDays)
	}));

	const windows = $.derived(() => suggestRRSIGWindows($.get(planningOptions)));
	const currentWindow = $.derived(() => $.get(windows)?.[0] || null);
	const nextWindow = $.derived(() => $.get(windows)?.[1] || null);
	const currentWindowFormatted = $.derived(() => $.get(currentWindow) ? formatRRSIGDates($.get(currentWindow)) : null);
	const nextWindowFormatted = $.derived(() => $.get(nextWindow) ? formatRRSIGDates($.get(nextWindow)) : null);

	const currentValidation = $.derived(() => $.get(currentWindow)
		? validateRRSIGTiming($.get(currentWindow), $.get(ttl))
		: null);

	function copyCurrentWindow() {
		if (!$.get(currentWindowFormatted)) return;

		const text = `RRSIG Timing Window:
Inception: ${$.get(currentWindowFormatted).inceptionFormatted} (${$.get(currentWindowFormatted).inceptionTimestamp})
Expiration: ${$.get(currentWindowFormatted).expirationFormatted} (${$.get(currentWindowFormatted).expirationTimestamp})
Renewal Time: ${$.get(currentWindowFormatted).renewalFormatted}`;

		clipboard.copy(text, 'current');
	}

	function copyBothWindows() {
		if (!$.get(currentWindowFormatted) || !$.get(nextWindowFormatted)) return;

		const text = `RRSIG Planning Schedule:

Current Window:
Inception: ${$.get(currentWindowFormatted).inceptionFormatted} (${$.get(currentWindowFormatted).inceptionTimestamp})
Expiration: ${$.get(currentWindowFormatted).expirationFormatted} (${$.get(currentWindowFormatted).expirationTimestamp})
Renewal Time: ${$.get(currentWindowFormatted).renewalFormatted}

Next Window:
Inception: ${$.get(nextWindowFormatted).inceptionFormatted} (${$.get(nextWindowFormatted).inceptionTimestamp})
Expiration: ${$.get(nextWindowFormatted).expirationFormatted} (${$.get(nextWindowFormatted).expirationTimestamp})
Renewal Time: ${$.get(nextWindowFormatted).renewalFormatted}`;

		clipboard.copy(text, 'both');
	}

	function formatDuration(hours) {
		if (hours < 24) return `${hours}h`;

		const days = Math.floor(hours / 24);
		const remainingHours = hours % 24;

		return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
	}

	const isValidTTL = $.derived(() => () => $.get(ttl) > 0 && $.get(ttl) <= 86400);
	const isValidOverlap = $.derived(() => () => $.get(desiredOverlap) > 0 && $.get(desiredOverlap) <= 168);
	const isValidLeadTime = $.derived(() => () => $.get(renewalLeadTime) > 0 && $.get(renewalLeadTime) <= 168);
	const isValidClockSkew = $.derived(() => () => $.get(clockSkew) >= 0 && $.get(clockSkew) <= 24);
	const isValidityDays = $.derived(() => () => $.get(signatureValidityDays) > 0 && $.get(signatureValidityDays) <= 365);
	var div = root_9();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var label = $.child(div_3);
	var node = $.child(label);

	Icon(node, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label);

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);

	var node_1 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(isValidTTL)) $$render(consequent);
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var label_1 = $.child(div_4);
	var node_2 = $.child(label_1);

	Icon(node_2, { name: 'overlap', size: 'sm' });
	$.next();
	$.reset(label_1);

	var input_1 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_1);

	var node_3 = $.sibling(input_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node_3, ($$render) => {
			if (!$.get(isValidOverlap)) $$render(consequent_1);
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var label_2 = $.child(div_5);
	var node_4 = $.child(label_2);

	Icon(node_4, { name: 'timer', size: 'sm' });
	$.next();
	$.reset(label_2);

	var input_2 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_2);

	var node_5 = $.sibling(input_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var p_2 = root_2();

			$.append($$anchor, p_2);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(isValidLeadTime)) $$render(consequent_2);
		});
	}

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var label_3 = $.child(div_6);
	var node_6 = $.child(label_3);

	Icon(node_6, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_3);

	var input_3 = $.sibling(label_3, 2);

	$.remove_input_defaults(input_3);

	var node_7 = $.sibling(input_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p_3 = root_3();

			$.append($$anchor, p_3);
		};

		$.if(node_7, ($$render) => {
			if (!$.get(isValidClockSkew)) $$render(consequent_3);
		});
	}

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var label_4 = $.child(div_7);
	var node_8 = $.child(label_4);

	Icon(node_8, { name: 'calendar', size: 'sm' });
	$.next();
	$.reset(label_4);

	var input_4 = $.sibling(label_4, 2);

	$.remove_input_defaults(input_4);

	var node_9 = $.sibling(input_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var p_4 = root_4();

			$.append($$anchor, p_4);
		};

		$.if(node_9, ($$render) => {
			if (!$.get(isValidityDays)) $$render(consequent_4);
		});
	}

	$.reset(div_7);
	$.reset(div_2);
	$.reset(div_1);

	var node_10 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_8 = root_6();
			var div_9 = $.child(div_8);
			var node_11 = $.child(div_9);

			Icon(node_11, { name: 'alert-triangle', size: 'sm' });

			var div_10 = $.sibling(node_11, 2);
			var ul = $.sibling($.child(div_10), 2);

			$.each(ul, 21, () => $.get(currentValidation).warnings, $.index, ($$anchor, warning) => {
				var li = root_5();
				var text_1 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_1, $.get(warning)));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_10, ($$render) => {
			if ($.get(currentValidation) && $.get(currentValidation).warnings.length > 0) $$render(consequent_5);
		});
	}

	var div_11 = $.sibling(node_10, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var div_14 = $.child(div_13);
	var button = $.sibling($.child(div_14), 2);
	var node_12 = $.child(button);

	{
		let $0 = $.derived(() => clipboard.isCopied('current') ? 'check' : 'copy');

		Icon(node_12, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	$.next();
	$.reset(button);
	$.reset(div_14);

	var node_13 = $.sibling(div_14, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_15 = root_7();
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var node_14 = $.child(div_17);

			Icon(node_14, { name: 'play', size: 'sm' });
			$.next(2);
			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var text_2 = $.only_child(div_18, true);
			var div_19 = $.sibling(div_18, 2);
			var text_3 = $.only_child(div_19, true);

			$.reset(div_16);

			var div_20 = $.sibling(div_16, 2);
			var div_21 = $.child(div_20);
			var node_15 = $.child(div_21);

			Icon(node_15, { name: 'stop', size: 'sm' });
			$.next(2);
			$.reset(div_21);

			var div_22 = $.sibling(div_21, 2);
			var text_4 = $.only_child(div_22, true);
			var div_23 = $.sibling(div_22, 2);
			var text_5 = $.only_child(div_23, true);

			$.reset(div_20);

			var div_24 = $.sibling(div_20, 2);
			var div_25 = $.child(div_24);
			var node_16 = $.child(div_25);

			Icon(node_16, { name: 'refresh', size: 'sm' });
			$.next(2);
			$.reset(div_25);

			var div_26 = $.sibling(div_25, 2);
			var text_6 = $.only_child(div_26, true);

			$.next(2);
			$.reset(div_24);

			var div_27 = $.sibling(div_24, 2);
			var div_28 = $.child(div_27);
			var span = $.sibling($.child(div_28), 2);
			var text_7 = $.only_child(span, true);

			$.reset(div_28);

			var div_29 = $.sibling(div_28, 2);
			var span_1 = $.sibling($.child(div_29), 2);
			var text_8 = $.only_child(span_1, true);

			$.reset(div_29);

			var div_30 = $.sibling(div_29, 2);
			var span_2 = $.sibling($.child(div_30), 2);
			var text_9 = $.only_child(span_2, true);

			$.reset(div_30);
			$.reset(div_27);
			$.reset(div_15);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_2, $.get(currentWindowFormatted).inceptionFormatted);
					$.set_text(text_3, $.get(currentWindowFormatted).inceptionTimestamp);
					$.set_text(text_4, $.get(currentWindowFormatted).expirationFormatted);
					$.set_text(text_5, $.get(currentWindowFormatted).expirationTimestamp);
					$.set_text(text_6, $.get(currentWindowFormatted).renewalFormatted);
					$.set_text(text_7, $0);
					$.set_text(text_8, $1);
					$.set_text(text_9, $2);
				},
				[
					() => formatDuration($.get(currentWindow).validity),
					() => formatDuration($.get(currentWindow).leadTime),
					() => formatDuration($.get(desiredOverlap))
				]
			);

			$.append($$anchor, div_15);
		};

		$.if(node_13, ($$render) => {
			if ($.get(currentWindowFormatted)) $$render(consequent_6);
		});
	}

	$.reset(div_13);

	var div_31 = $.sibling(div_13, 2);
	var node_17 = $.sibling($.child(div_31), 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_32 = root_8();
			var div_33 = $.child(div_32);
			var div_34 = $.child(div_33);
			var node_18 = $.child(div_34);

			Icon(node_18, { name: 'play', size: 'sm' });
			$.next(2);
			$.reset(div_34);

			var div_35 = $.sibling(div_34, 2);
			var text_10 = $.only_child(div_35, true);
			var div_36 = $.sibling(div_35, 2);
			var text_11 = $.only_child(div_36, true);

			$.reset(div_33);

			var div_37 = $.sibling(div_33, 2);
			var div_38 = $.child(div_37);
			var node_19 = $.child(div_38);

			Icon(node_19, { name: 'stop', size: 'sm' });
			$.next(2);
			$.reset(div_38);

			var div_39 = $.sibling(div_38, 2);
			var text_12 = $.only_child(div_39, true);
			var div_40 = $.sibling(div_39, 2);
			var text_13 = $.only_child(div_40, true);

			$.reset(div_37);

			var div_41 = $.sibling(div_37, 2);
			var div_42 = $.child(div_41);
			var node_20 = $.child(div_42);

			Icon(node_20, { name: 'refresh', size: 'sm' });
			$.next(2);
			$.reset(div_42);

			var div_43 = $.sibling(div_42, 2);
			var text_14 = $.only_child(div_43, true);

			$.reset(div_41);

			var div_44 = $.sibling(div_41, 2);
			var button_1 = $.child(div_44);
			var node_21 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied('both') ? 'check' : 'copy');

				Icon(node_21, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next();
			$.reset(button_1);
			$.reset(div_44);
			$.reset(div_32);

			$.template_effect(
				($0) => {
					$.set_text(text_10, $.get(nextWindowFormatted).inceptionFormatted);
					$.set_text(text_11, $.get(nextWindowFormatted).inceptionTimestamp);
					$.set_text(text_12, $.get(nextWindowFormatted).expirationFormatted);
					$.set_text(text_13, $.get(nextWindowFormatted).expirationTimestamp);
					$.set_text(text_14, $.get(nextWindowFormatted).renewalFormatted);
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-1m4lzsh');
				},
				[() => clipboard.isCopied('both') ? 'copied' : '']
			);

			$.delegated('click', button_1, copyBothWindows);
			$.append($$anchor, div_32);
		};

		$.if(node_17, ($$render) => {
			if ($.get(nextWindowFormatted)) $$render(consequent_7);
		});
	}

	$.reset(div_31);
	$.reset(div_12);
	$.reset(div_11);

	var div_45 = $.sibling(div_11, 2);
	var div_46 = $.sibling($.child(div_45), 2);
	var div_47 = $.child(div_46);
	var ul_1 = $.sibling($.child(div_47), 2);
	var li_1 = $.sibling($.child(ul_1), 2);
	var text_15 = $.only_child(li_1);
	var li_2 = $.sibling(li_1, 2);
	var text_16 = $.only_child(li_2);
	var li_3 = $.sibling(li_2, 2);
	var text_17 = $.only_child(li_3);

	$.reset(ul_1);
	$.reset(div_47);
	$.next(2);
	$.reset(div_46);
	$.reset(div_45);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(input, 1, `number-input ${!$.get(isValidTTL) ? 'invalid' : ''}`, 'svelte-1m4lzsh');
			$.set_class(input_1, 1, `number-input ${!$.get(isValidOverlap) ? 'invalid' : ''}`, 'svelte-1m4lzsh');
			$.set_class(input_2, 1, `number-input ${!$.get(isValidLeadTime) ? 'invalid' : ''}`, 'svelte-1m4lzsh');
			$.set_class(input_3, 1, `number-input ${!$.get(isValidClockSkew) ? 'invalid' : ''}`, 'svelte-1m4lzsh');
			$.set_class(input_4, 1, `number-input ${!$.get(isValidityDays) ? 'invalid' : ''}`, 'svelte-1m4lzsh');
			$.set_class(button, 1, `copy-button ${$0 ?? ''}`, 'svelte-1m4lzsh');
			$.set_text(text_15, `Generate new signatures ${$1 ?? ''} before expiration`);
			$.set_text(text_16, `Maintain ${$2 ?? ''} overlap period`);
			$.set_text(text_17, `Account for ${$.get(clockSkew) ?? ''}h clock skew tolerance`);
		},
		[
			() => clipboard.isCopied('current') ? 'copied' : '',
			() => formatDuration($.get(renewalLeadTime)),
			() => formatDuration($.get(desiredOverlap))
		]
	);

	$.bind_value(input, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.bind_value(input_1, () => $.get(desiredOverlap), ($$value) => $.set(desiredOverlap, $$value));
	$.bind_value(input_2, () => $.get(renewalLeadTime), ($$value) => $.set(renewalLeadTime, $$value));
	$.bind_value(input_3, () => $.get(clockSkew), ($$value) => $.set(clockSkew, $$value));
	$.bind_value(input_4, () => $.get(signatureValidityDays), ($$value) => $.set(signatureValidityDays, $$value));
	$.delegated('click', button, copyCurrentWindow);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);