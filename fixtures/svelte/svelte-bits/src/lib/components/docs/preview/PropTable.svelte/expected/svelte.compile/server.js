import * as $ from 'svelte/internal/server';

export default function PropTable($$renderer, $$props) {
	let { rows } = $$props;

	$$renderer.push(`<section class="prop-table-section"><h2 class="demo-title-extra">Props</h2> <div class="prop-table-wrap"><table class="prop-table"><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody><!--[-->`);

	const each_array = $.ensure_array_like(rows);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let row = each_array[$$index];

		$$renderer.push(`<tr><td><code class="prop-code">${$.escape(row.name)}</code></td><td><span class="prop-type">${$.escape(row.type)}</span></td><td><code class="prop-code">${$.escape(row.default)}</code></td><td>${$.escape(row.description)}</td></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table></div> <div class="prop-cards"><!--[-->`);

	const each_array_1 = $.ensure_array_like(rows);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let row = each_array_1[$$index_1];

		$$renderer.push(`<div class="prop-card"><div class="prop-card-header"><code class="prop-code">${$.escape(row.name)}</code> <span class="prop-card-type">${$.escape(row.type)}</span></div> <p class="prop-card-desc">${$.escape(row.description)}</p> <div class="prop-card-default"><span class="prop-card-label">Default:</span> <code class="prop-code">${$.escape(row.default)}</code></div></div>`);
	}

	$$renderer.push(`<!--]--></div></section>`);
}