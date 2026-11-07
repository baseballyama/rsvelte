import * as $ from 'svelte/internal/server';

export default function EditorDestinationsCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const countriesCount = $.derived(() => data.length);

		if (Array.isArray(data)) {
			$$renderer.push(`<!--[0--><div class="list svelte-1fo3vwf"><span>`);

			if (countriesCount() && countriesCount() <= 3) {
				$$renderer.push(`<!--[0-->${$.escape(data.map((item) => item.label).join(", "))}`);
			} else if (countriesCount() > 3) {
				$$renderer.push(`<!--[1-->${$.escape(data.slice(0, 3).map((item) => item.label).join(", "))} and ${$.escape(countriesCount() - 3)} more`);
			} else {
				$$renderer.push(`<!--[-1--><span class="empty svelte-1fo3vwf">not selected</span>`);
			}

			$$renderer.push(`<!--]--></span></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="custom-option svelte-1fo3vwf"><div class="info svelte-1fo3vwf"><div class="label">${$.escape(data.flag)}
				${$.escape(data.label)}</div> <div class="code svelte-1fo3vwf">(${$.escape(data.code)})</div></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}