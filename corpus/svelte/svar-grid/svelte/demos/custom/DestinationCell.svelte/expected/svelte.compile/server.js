import * as $ from 'svelte/internal/server';

export default function DestinationCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;
		const countriesCount = $.derived(() => data().length);

		let data = $.derived(() => {
			const ids = row[column.id];
			const options = column.options;

			if (!Array.isArray(ids) || !options) return [];

			return ids.map((id) => options.find((o) => o.id == id)).filter(Boolean);
		});

		$$renderer.push(`<span>`);

		if (countriesCount() && countriesCount() <= 3) {
			$$renderer.push(`<!--[0-->${$.escape(data().map((item) => item.label).join(", "))}`);
		} else if (countriesCount() > 3) {
			$$renderer.push(`<!--[1-->${$.escape(data().slice(0, 3).map((item) => item.label).join(", "))} and ${$.escape(countriesCount() - 3)} more`);
		} else {
			$$renderer.push(`<!--[-1--><span class="empty svelte-100i8wr">not selected</span>`);
		}

		$$renderer.push(`<!--]--></span>`);
	});
}