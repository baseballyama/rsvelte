import * as $ from 'svelte/internal/server';

export default function NoorFooter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { footer, description = '', brandName = '' } = $$props;

		$$renderer.push(`<footer class="noor-footer svelte-d7pv0n"><div class="noor-footer-brand svelte-d7pv0n">`);

		if (footer?.logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', footer.logo)}${$.attr('alt', footer.logoAlt || brandName)} class="svelte-d7pv0n"/>`);
		} else if (brandName) {
			$$renderer.push(`<!--[1--><p class="noor-footer-wordmark svelte-d7pv0n">${$.escape(brandName)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (description) {
			$$renderer.push(`<!--[0--><p class="svelte-d7pv0n">${$.escape(description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <!--[-->`);

		const each_array = $.ensure_array_like(footer?.columns || []);

		for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
			let column = each_array[$$index_2];

			$$renderer.push(`<div class="noor-footer-column"><h3 class="svelte-d7pv0n">${$.escape(column.title)}</h3> <!--[-->`);

			const each_array_1 = $.ensure_array_like(column.links || []);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let link = each_array_1[$$index];

				$$renderer.push(`<a${$.attr('href', link.href)} class="svelte-d7pv0n">${$.escape(link.label)}</a>`);
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_2 = $.ensure_array_like(column.text || []);

			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
				let text = each_array_2[$$index_1];

				$$renderer.push(`<p class="svelte-d7pv0n">${$.escape(text)}</p>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></footer>`);
	});
}