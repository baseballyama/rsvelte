import * as $ from 'svelte/internal/server';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';
import NewsletterLogo from '$lib/newsletter/NewsletterLogo.svelte';
import { format } from 'date-fns';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<main><div><h1 class="h3 lines" id="newsletter-form-label">Syntax Snack Pack</h1> <p class="center svelte-15d9tgf">Wanna be one of the <strong>${$.escape(data.count)}</strong> coolest people in the world?</p> <div class="newsletter-logo-container svelte-15d9tgf">`);
		NewsletterLogo($$renderer, {});
		$$renderer.push(`<!----></div> `);
		NewsletterForm($$renderer, { show_logo: false });
		$$renderer.push(`<!----> <div class="center"><h2 class="lines">Past Issues</h2> <p class="readable center svelte-15d9tgf">Wanna see how good our snackpack is? Looking for something mentioned in the past?</p> `);

		if (!data.issues.length) {
			$$renderer.push(`<!--[0--><p class="error svelte-15d9tgf">Oopsie daisy! Unable to load past issues.</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <ul class="svelte-15d9tgf"><!--[-->`);

		const each_array = $.ensure_array_like(data.issues);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let issue = each_array[$$index];

			$$renderer.push(`<li class="svelte-15d9tgf"><a${$.attr('href', `/snackpack/${$.stringify(issue.id)}`)} class="svelte-15d9tgf"><small class="text-xs">${$.escape(format(new Date(issue.published_at), 'MMM dd, yyyy'))}</small> <p class="svelte-15d9tgf">${$.escape(issue.subject)}</p></a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></main>`);
	});
}