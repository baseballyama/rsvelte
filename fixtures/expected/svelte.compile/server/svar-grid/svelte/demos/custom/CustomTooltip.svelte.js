import * as $ from 'svelte/internal/server';

export default function CustomTooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		const stars = $.derived(() => {
			const res = [];
			const max = 5;
			const n = Math.round(data.row.stars / 10000 * max);

			for (let i = 0; i < max; i++) {
				if (i < n) res.push({ filled: true }); else res.push({});
			}

			return res;
		});

		$$renderer.push(`<div class="data svelte-1mtuc6h"><div class="line svelte-1mtuc6h"><b>Name:</b> ${$.escape(data.row.firstName)}
		${$.escape(data.row.lastName)}</div> <div class="line svelte-1mtuc6h"><b>City:</b> ${$.escape(data.row.city || "Unknown")}</div> <div class="line svelte-1mtuc6h"><b>Email:</b> ${$.escape(data.row.email)}</div> <div class="line svelte-1mtuc6h"><b>Address:</b> ${$.escape(data.row.street)}, ${$.escape(data.row.zipCode)}</div> <div class="line stars svelte-1mtuc6h"><!--[-->`);

		const each_array = $.ensure_array_like(stars());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let star = each_array[$$index];

			$$renderer.push(`<i${$.attr_class('wxi-cat svelte-1mtuc6h', void 0, { 'filled': star.filled })}></i>`);
		}

		$$renderer.push(`<!--]--> (${$.escape(data.row.stars)})</div> <div class="line svelte-1mtuc6h"><b>Followers:</b> ${$.escape(data.row.followers)}</div></div>`);
	});
}