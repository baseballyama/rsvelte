import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { suggestRRSIGWindows, formatRRSIGDates, validateRRSIGTiming } from '$lib/utils/dnssec';

export default function RRSIGPlanner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ttl = 3600;
		let desiredOverlap = 24;
		let renewalLeadTime = 24;
		let clockSkew = 1;
		let signatureValidityDays = 30;
		const clipboard = useClipboard();

		const planningOptions = $.derived(() => ({
			ttl,
			desiredOverlap,
			renewalLeadTime,
			clockSkew,
			signatureValidityDays
		}));

		const windows = $.derived(() => suggestRRSIGWindows(planningOptions()));
		const currentWindow = $.derived(() => windows()?.[0] || null);
		const nextWindow = $.derived(() => windows()?.[1] || null);
		const currentWindowFormatted = $.derived(() => currentWindow() ? formatRRSIGDates(currentWindow()) : null);
		const nextWindowFormatted = $.derived(() => nextWindow() ? formatRRSIGDates(nextWindow()) : null);
		const currentValidation = $.derived(() => currentWindow() ? validateRRSIGTiming(currentWindow(), ttl) : null);

		function copyCurrentWindow() {
			if (!currentWindowFormatted()) return;

			const text = `RRSIG Timing Window:
Inception: ${currentWindowFormatted().inceptionFormatted} (${currentWindowFormatted().inceptionTimestamp})
Expiration: ${currentWindowFormatted().expirationFormatted} (${currentWindowFormatted().expirationTimestamp})
Renewal Time: ${currentWindowFormatted().renewalFormatted}`;

			clipboard.copy(text, 'current');
		}

		function copyBothWindows() {
			if (!currentWindowFormatted() || !nextWindowFormatted()) return;

			const text = `RRSIG Planning Schedule:

Current Window:
Inception: ${currentWindowFormatted().inceptionFormatted} (${currentWindowFormatted().inceptionTimestamp})
Expiration: ${currentWindowFormatted().expirationFormatted} (${currentWindowFormatted().expirationTimestamp})
Renewal Time: ${currentWindowFormatted().renewalFormatted}

Next Window:
Inception: ${nextWindowFormatted().inceptionFormatted} (${nextWindowFormatted().inceptionTimestamp})
Expiration: ${nextWindowFormatted().expirationFormatted} (${nextWindowFormatted().expirationTimestamp})
Renewal Time: ${nextWindowFormatted().renewalFormatted}`;

			clipboard.copy(text, 'both');
		}

		function formatDuration(hours) {
			if (hours < 24) return `${hours}h`;

			const days = Math.floor(hours / 24);
			const remainingHours = hours % 24;

			return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
		}

		const isValidTTL = $.derived(() => () => ttl > 0 && ttl <= 86400);
		const isValidOverlap = $.derived(() => () => desiredOverlap > 0 && desiredOverlap <= 168);
		const isValidLeadTime = $.derived(() => () => renewalLeadTime > 0 && renewalLeadTime <= 168);
		const isValidClockSkew = $.derived(() => () => clockSkew >= 0 && clockSkew <= 24);
		const isValidityDays = $.derived(() => () => signatureValidityDays > 0 && signatureValidityDays <= 365);

		$$renderer.push(`<div class="card svelte-1m4lzsh"><header class="card-header"><h1>RRSIG Planner</h1> <p>Suggest RRSIG validity windows (inception/expiration) based on TTLs and desired overlap, with renewal lead-time
      guidance for automated DNSSEC signature management.</p></header> <div class="card input-card svelte-1m4lzsh"><div class="input-grid svelte-1m4lzsh"><div class="form-group svelte-1m4lzsh"><label for="ttl" class="svelte-1m4lzsh">`);

		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> TTL (seconds)</label> <input id="ttl" type="number"${$.attr('value', ttl)} min="1" max="86400"${$.attr_class(`number-input ${!isValidTTL() ? 'invalid' : ''}`, 'svelte-1m4lzsh')}/> `);

		if (!isValidTTL()) {
			$$renderer.push(`<!--[0--><p class="field-error svelte-1m4lzsh">TTL must be between 1 and 86400 seconds</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1m4lzsh"><label for="overlap" class="svelte-1m4lzsh">`);
		Icon($$renderer, { name: 'overlap', size: 'sm' });
		$$renderer.push(`<!----> Desired Overlap (hours)</label> <input id="overlap" type="number"${$.attr('value', desiredOverlap)} min="1" max="168"${$.attr_class(`number-input ${!isValidOverlap() ? 'invalid' : ''}`, 'svelte-1m4lzsh')}/> `);

		if (!isValidOverlap()) {
			$$renderer.push(`<!--[0--><p class="field-error svelte-1m4lzsh">Overlap must be between 1 and 168 hours</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1m4lzsh"><label for="lead-time" class="svelte-1m4lzsh">`);
		Icon($$renderer, { name: 'timer', size: 'sm' });
		$$renderer.push(`<!----> Renewal Lead Time (hours)</label> <input id="lead-time" type="number"${$.attr('value', renewalLeadTime)} min="1" max="168"${$.attr_class(`number-input ${!isValidLeadTime() ? 'invalid' : ''}`, 'svelte-1m4lzsh')}/> `);

		if (!isValidLeadTime()) {
			$$renderer.push(`<!--[0--><p class="field-error svelte-1m4lzsh">Lead time must be between 1 and 168 hours</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1m4lzsh"><label for="clock-skew" class="svelte-1m4lzsh">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> Clock Skew (hours)</label> <input id="clock-skew" type="number"${$.attr('value', clockSkew)} min="0" max="24" step="0.5"${$.attr_class(`number-input ${!isValidClockSkew() ? 'invalid' : ''}`, 'svelte-1m4lzsh')}/> `);

		if (!isValidClockSkew()) {
			$$renderer.push(`<!--[0--><p class="field-error svelte-1m4lzsh">Clock skew must be between 0 and 24 hours</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1m4lzsh"><label for="validity-days" class="svelte-1m4lzsh">`);
		Icon($$renderer, { name: 'calendar', size: 'sm' });
		$$renderer.push(`<!----> Signature Validity (days)</label> <input id="validity-days" type="number"${$.attr('value', signatureValidityDays)} min="1" max="365"${$.attr_class(`number-input ${!isValidityDays() ? 'invalid' : ''}`, 'svelte-1m4lzsh')}/> `);

		if (!isValidityDays()) {
			$$renderer.push(`<!--[0--><p class="field-error svelte-1m4lzsh">Validity must be between 1 and 365 days</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> `);

		if (currentValidation() && currentValidation().warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="card warning-card svelte-1m4lzsh"><div class="warning-content svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div><strong class="svelte-1m4lzsh">Timing Warnings:</strong> <ul class="warning-list svelte-1m4lzsh"><!--[-->`);

			const each_array = $.ensure_array_like(currentValidation().warnings);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let warning = each_array[index];

				$$renderer.push(`<li>${$.escape(warning)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="windows-section svelte-1m4lzsh"><div class="windows-grid svelte-1m4lzsh"><div class="card window-card svelte-1m4lzsh"><div class="window-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Current Signature Window</h3> <button${$.attr_class(`copy-button ${clipboard.isCopied('current') ? 'copied' : ''}`, 'svelte-1m4lzsh')}>`);

		Icon($$renderer, {
			name: clipboard.isCopied('current') ? 'check' : 'copy',
			size: 'sm'
		});

		$$renderer.push(`<!----> Copy</button></div> `);

		if (currentWindowFormatted()) {
			$$renderer.push(`<!--[0--><div class="window-content svelte-1m4lzsh"><div class="timing-item inception svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'play', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Inception (Start Time)</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(currentWindowFormatted().inceptionFormatted)}</div> <div class="timing-readable svelte-1m4lzsh">${$.escape(currentWindowFormatted().inceptionTimestamp)}</div></div> <div class="timing-item expiration svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'stop', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Expiration (End Time)</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(currentWindowFormatted().expirationFormatted)}</div> <div class="timing-readable svelte-1m4lzsh">${$.escape(currentWindowFormatted().expirationTimestamp)}</div></div> <div class="timing-item renewal svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'refresh', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Renewal Time</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(currentWindowFormatted().renewalFormatted)}</div> <div class="timing-note svelte-1m4lzsh">Generate next signatures before this time</div></div> <div class="metrics-grid svelte-1m4lzsh"><div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Validity Period</span> <span class="metric-value svelte-1m4lzsh">${$.escape(formatDuration(currentWindow().validity))}</span></div> <div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Lead Time</span> <span class="metric-value svelte-1m4lzsh">${$.escape(formatDuration(currentWindow().leadTime))}</span></div> <div class="metric-item svelte-1m4lzsh"><span class="metric-label svelte-1m4lzsh">Overlap Period</span> <span class="metric-value svelte-1m4lzsh">${$.escape(formatDuration(desiredOverlap))}</span></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="card window-card svelte-1m4lzsh"><div class="window-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Next Signature Window</h3></div> `);

		if (nextWindowFormatted()) {
			$$renderer.push(`<!--[0--><div class="window-content svelte-1m4lzsh"><div class="timing-item inception svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'play', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Next Inception</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(nextWindowFormatted().inceptionFormatted)}</div> <div class="timing-readable svelte-1m4lzsh">${$.escape(nextWindowFormatted().inceptionTimestamp)}</div></div> <div class="timing-item expiration svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'stop', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Next Expiration</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(nextWindowFormatted().expirationFormatted)}</div> <div class="timing-readable svelte-1m4lzsh">${$.escape(nextWindowFormatted().expirationTimestamp)}</div></div> <div class="timing-item renewal svelte-1m4lzsh"><div class="timing-header svelte-1m4lzsh">`);
			Icon($$renderer, { name: 'refresh', size: 'sm' });
			$$renderer.push(`<!----> <span class="timing-label svelte-1m4lzsh">Following Renewal</span></div> <div class="timing-value mono svelte-1m4lzsh">${$.escape(nextWindowFormatted().renewalFormatted)}</div></div> <div class="copy-schedule-section svelte-1m4lzsh"><button${$.attr_class(`copy-button ${clipboard.isCopied('both') ? 'copied' : ''}`, 'svelte-1m4lzsh')}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('both') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> Copy Full Schedule</button></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="card guidelines-card svelte-1m4lzsh"><div class="card-section-header svelte-1m4lzsh"><h3 class="svelte-1m4lzsh">Implementation Guidelines</h3></div> <div class="guidelines-content svelte-1m4lzsh"><div class="guideline-section svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Automation Schedule:</h4> <ul class="guideline-list svelte-1m4lzsh"><li class="svelte-1m4lzsh">Monitor renewal times continuously</li> <li class="svelte-1m4lzsh">Generate new signatures ${$.escape(formatDuration(renewalLeadTime))} before expiration</li> <li class="svelte-1m4lzsh">Maintain ${$.escape(formatDuration(desiredOverlap))} overlap period</li> <li class="svelte-1m4lzsh">Account for ${$.escape(clockSkew)}h clock skew tolerance</li></ul></div> <div class="guideline-section svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Best Practices:</h4> <ul class="guideline-list svelte-1m4lzsh"><li class="svelte-1m4lzsh">Test signature generation before deployment</li> <li class="svelte-1m4lzsh">Monitor DNSSEC validation after updates</li> <li class="svelte-1m4lzsh">Keep backup signatures for rollback</li> <li class="svelte-1m4lzsh">Log all signature generation events</li></ul></div></div></div> <div class="education-card svelte-1m4lzsh"><div class="education-grid svelte-1m4lzsh"><div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">RRSIG Timing</h4> <p class="svelte-1m4lzsh">RRSIG records have inception and expiration timestamps that define when the signature is valid. Proper timing
          ensures continuous DNSSEC validation during key transitions.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Overlap Strategy</h4> <p class="svelte-1m4lzsh">Overlapping signature validity periods prevent validation failures during rollover. New signatures should be
          generated before old ones expire.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Clock Skew Tolerance</h4> <p class="svelte-1m4lzsh">Account for time differences between authoritative servers and validators. Start signatures slightly in the
          past to accommodate clock skew.</p></div> <div class="education-item info-panel svelte-1m4lzsh"><h4 class="svelte-1m4lzsh">Automation Benefits</h4> <p class="svelte-1m4lzsh">Automated RRSIG generation reduces manual errors and ensures consistent timing. Plan renewal schedules based
          on TTL values and operational requirements.</p></div></div></div></div>`);
	});
}