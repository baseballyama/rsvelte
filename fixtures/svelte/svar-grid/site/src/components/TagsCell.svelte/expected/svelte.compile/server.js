import * as $ from 'svelte/internal/server';
import { getData } from "../data/index";

export default function TagsCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;
		const tagsData = getData().tags;

		function getTags(data, value) {
			const result = [];

			for (let i = 0; i < data.length; i++) {
				const item = data[i];

				if (value.indexOf(item.id) !== -1) result.push(item);
				if (result.length === value.length) break;
			}

			return result;
		}

		let tags = $.derived(() => getTags(tagsData, row[column.id]));

		if (tags().length) {
			$$renderer.push(`<!--[0--><div class="tags svelte-nyssxx"><div class="tags-wrapper svelte-nyssxx"><!--[-->`);

			const each_array = $.ensure_array_like(tags());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tag = each_array[$$index];

				$$renderer.push(`<span class="tag svelte-nyssxx"${$.attr_style(`background:${$.stringify(tag.background)};color:${$.stringify(tag.color)}`)}>${$.escape(tag.label)}</span>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}