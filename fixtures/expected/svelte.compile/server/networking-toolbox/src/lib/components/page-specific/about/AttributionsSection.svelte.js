import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function AttributionsSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Configuration
		const user = 'lissy93';

		const repo = 'networking-toolbox';
		const apiBase = 'https://readme-contribs.as93.net';
		const optionsLarge = '?avatarSize=72&perRow=10&limit=96';
		const optionsSmall = '?perRow=16&limit=96';
		const githubApi = `https://api.github.com/repos/${user}/${repo}`;

		// Fallback iframe URLs
		const sponsorsUrl = `${apiBase}/sponsors/${user}${optionsLarge}`;

		const contributorsUrl = `${apiBase}/contributors/${user}/${repo}${optionsLarge}`;
		const stargazersUrl = `${apiBase}/stargazers/${user}/${repo}${optionsSmall}`;

		// State
		let sponsors = [];

		let contributors = [];
		let stargazers = [];
		let loadingSponsors = true;
		let loadingContributors = true;
		let loadingStargazers = true;

		onMount(async () => {
			// Fetch sponsors
			try {
				const sponsorsRes = await fetch('https://github-sponsors-api.as93.net/lissy93');

				sponsors = sponsorsRes.ok ? await sponsorsRes.json() : [];
			} finally {
				loadingSponsors = false;
			}

			// Fetch contributors
			try {
				const contributorsRes = await fetch(`${githubApi}/contributors?per_page=100`);

				contributors = contributorsRes.ok ? await contributorsRes.json() : [];
			} finally {
				loadingContributors = false;
			}

			// Fetch stargazers
			try {
				const stargazersRes = await fetch(`${githubApi}/stargazers?per_page=100`);

				stargazers = stargazersRes.ok ? await stargazersRes.json() : [];
			} finally {
				loadingStargazers = false;
			}
		});

		$$renderer.push(`<section id="attributions"><h2>Attributions</h2> <h3>Sponsors</h3> `);

		if (!loadingSponsors && sponsors.length > 0) {
			$$renderer.push(`<!--[0--><div class="avatars-grid svelte-1ybha0i"><!--[-->`);

			const each_array = $.ensure_array_like(sponsors.filter((s) => s.login));

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let sponsor = each_array[index];

				$$renderer.push(`<a${$.attr('href', `https://github.com/${$.stringify(sponsor.login)}`)} target="_blank" rel="noopener" class="avatar-link svelte-1ybha0i"><img width="72"${$.attr('src', sponsor.avatarUrl)}${$.attr('alt', sponsor.name || sponsor.login)} class="avatar large svelte-1ybha0i"/> <span class="svelte-1ybha0i">${$.escape(sponsor.name || sponsor.login)}</span></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><iframe class="readme-contribs sponsors svelte-1ybha0i"${$.attr('src', sponsorsUrl)} title="sponsors"></iframe>`);
		}

		$$renderer.push(`<!--]--> <h3>Contributors</h3> `);

		if (!loadingContributors && contributors.length > 0) {
			$$renderer.push(`<!--[0--><div class="avatars-grid svelte-1ybha0i"><!--[-->`);

			const each_array_1 = $.ensure_array_like(contributors.filter((c) => c.login));

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let contributor = each_array_1[index];

				$$renderer.push(`<a${$.attr('href', `https://github.com/${$.stringify(contributor.login)}`)} target="_blank" rel="noopener" class="avatar-link svelte-1ybha0i"><img width="72"${$.attr('src', contributor.avatar_url)}${$.attr('alt', contributor.login)} class="avatar large svelte-1ybha0i"/> <span class="svelte-1ybha0i">${$.escape(contributor.login)}</span></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><iframe class="readme-contribs contributors svelte-1ybha0i"${$.attr('src', contributorsUrl)} title="contributors"></iframe>`);
		}

		$$renderer.push(`<!--]--> <h3>Stargazers</h3> `);

		if (!loadingStargazers && stargazers.length > 0) {
			$$renderer.push(`<!--[0--><div class="avatars-grid small svelte-1ybha0i"><!--[-->`);

			const each_array_2 = $.ensure_array_like(stargazers.filter((s) => s.login));

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let stargazer = each_array_2[index];

				$$renderer.push(`<a${$.attr('href', `https://github.com/${$.stringify(stargazer.login)}`)} target="_blank" rel="noopener" class="avatar-link small-link svelte-1ybha0i"><img width="72"${$.attr('src', stargazer.avatar_url)}${$.attr('alt', stargazer.login)} class="avatar small svelte-1ybha0i"/> <span class="svelte-1ybha0i">${$.escape(stargazer.login)}</span></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><iframe class="readme-contribs stargazers svelte-1ybha0i"${$.attr('src', stargazersUrl)} title="stargazers"></iframe>`);
		}

		$$renderer.push(`<!--]--></section>`);
	});
}