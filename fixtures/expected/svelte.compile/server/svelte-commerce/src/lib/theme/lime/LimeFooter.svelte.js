import * as $ from 'svelte/internal/server';
import { version } from '$app/environment';
import { Plus } from '@lucide/svelte';
import { onMount } from 'svelte';

export default function LimeFooter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { footer, brandName = '' } = $$props;

		// Footer columns are open on desktop, tap-to-expand accordions on mobile.
		// onMount (client-only, always in a valid context) sets up the media query;
		// using $effect here can throw effect_orphan depending on how the footer is
		// instantiated, and this listener doesn't depend on reactive state anyway.
		let footerColsOpen = true;

		onMount(() => {
			const mq = window.matchMedia('(min-width: 901px)');
			const sync = () => footerColsOpen = mq.matches;

			sync();
			mq.addEventListener('change', sync);

			return () => mq.removeEventListener('change', sync);
		});

		$$renderer.push(`<footer class="lime-footer svelte-zqg6jl">`);

		if (footer?.logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', footer.logo)}${$.attr('alt', footer.logoAlt || brandName)} class="svelte-zqg6jl"/>`);
		} else if (brandName) {
			$$renderer.push(`<!--[1--><p class="lime-footer-wordmark svelte-zqg6jl">${$.escape(brandName)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (footer?.assistance) {
			$$renderer.push(`<!--[0--><div class="lime-assistance svelte-zqg6jl"><span class="svelte-zqg6jl">${$.escape(footer.assistance.label)}</span> <!--[-->`);

			const each_array = $.ensure_array_like(footer.assistance.links);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let link = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', link.href)} class="svelte-zqg6jl">${$.escape(link.label)}</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="lime-footer-grid svelte-zqg6jl"><!--[-->`);

		const each_array_1 = $.ensure_array_like(footer?.columns || []);

		for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
			let column = each_array_1[$$index_3];

			$$renderer.push(`<details class="lime-footer-col svelte-zqg6jl"${$.attr('open', footerColsOpen, true)}><summary class="svelte-zqg6jl"><h3 class="svelte-zqg6jl">${$.escape(column.title)}</h3>`);
			Plus($$renderer, { class: 'lime-foot-plus' });
			$$renderer.push(`<!----></summary> <!--[-->`);

			const each_array_2 = $.ensure_array_like(column.links || []);

			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
				let link = each_array_2[$$index_1];

				$$renderer.push(`<a${$.attr('href', link.href)} class="svelte-zqg6jl">${$.escape(link.label)}</a>`);
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_3 = $.ensure_array_like(column.text || []);

			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let text = each_array_3[$$index_2];

				$$renderer.push(`<p class="svelte-zqg6jl">${$.escape(text)}</p>`);
			}

			$$renderer.push(`<!--]--></details>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (footer?.copyright) {
			$$renderer.push(`<!--[0--><p class="lime-copyright svelte-zqg6jl">${$.escape(footer.copyright)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <p class="lime-version svelte-zqg6jl">v${$.escape(version)}</p></footer>`);
	});
}