import * as $ from 'svelte/internal/server';
import { ArrowRight, PencilSquare, Heart } from '$lib/icons';

export default function Card($$renderer, $$props) {
	let { preset, editUrl = '' } = $$props;

	if (preset === 'support') {
		$$renderer.push(`<!--[0--><div class="card svelte-ssx89u"><div class="decorative svelte-ssx89u">`);
		Heart($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></div> <span class="title svelte-ssx89u">Support</span> <p class="text svelte-ssx89u">You can support my work on Patreon.</p> <a class="link svelte-ssx89u" href="https://www.patreon.com/joyofcode" target="_blank" rel="noreferrer"><span>Patreon</span> `);
		ArrowRight($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></a></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (preset === 'edit') {
		$$renderer.push(`<!--[0--><div class="card svelte-ssx89u"><div class="decorative svelte-ssx89u">`);
		PencilSquare($$renderer, { width: 24, height: 24, 'aria-hidden': true });

		$$renderer.push(`<!----></div> <span class="title svelte-ssx89u">Found a mistake?</span> <p class="text svelte-ssx89u">Every post is a Markdown file so contributing is simple as following the
			link below and pressing the pencil icon inside GitHub to edit it.</p> <a class="link svelte-ssx89u"${$.attr('href', editUrl)} target="_blank" rel="noreferrer"><span>Edit on GitHub</span> `);

		ArrowRight($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></a></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}