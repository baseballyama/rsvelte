import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<a target="_blank" rel="noopener" class="avatar-link svelte-1ybha0i"><img width="72" class="avatar large svelte-1ybha0i"/> <span class="svelte-1ybha0i"> </span></a>`);
var root_1 = $.from_html(`<div class="avatars-grid svelte-1ybha0i"></div>`);
var root_2 = $.from_html(`<iframe class="readme-contribs sponsors svelte-1ybha0i" title="sponsors"></iframe>`);
var root_3 = $.from_html(`<iframe class="readme-contribs contributors svelte-1ybha0i" title="contributors"></iframe>`);
var root_4 = $.from_html(`<a target="_blank" rel="noopener" class="avatar-link small-link svelte-1ybha0i"><img width="72" class="avatar small svelte-1ybha0i"/> <span class="svelte-1ybha0i"> </span></a>`);
var root_5 = $.from_html(`<div class="avatars-grid small svelte-1ybha0i"></div>`);
var root_6 = $.from_html(`<iframe class="readme-contribs stargazers svelte-1ybha0i" title="stargazers"></iframe>`);
var root_7 = $.from_html(`<section id="attributions"><h2>Attributions</h2> <h3>Sponsors</h3> <!> <h3>Contributors</h3> <!> <h3>Stargazers</h3> <!></section>`);

export default function AttributionsSection($$anchor, $$props) {
	$.push($$props, true);

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

	var section = root_7();
	var node = $.sibling($.child(section), 4);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 23, () => sponsors.filter((s) => s.login), (sponsor, index) => sponsor.login || `sponsor-${index}`, ($$anchor, sponsor) => {
				var a = root();
				var img = $.child(a);
				var span = $.sibling(img, 2);
				var text = $.only_child(span, true);

				$.reset(a);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `https://github.com/${$.get(sponsor).login ?? ''}`);
					$.set_attribute(img, 'src', $.get(sponsor).avatarUrl);
					$.set_attribute(img, 'alt', $.get(sponsor).name || $.get(sponsor).login);
					$.set_text(text, $.get(sponsor).name || $.get(sponsor).login);
				});

				$.append($$anchor, a);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var iframe = root_2();

			$.set_attribute(iframe, 'src', sponsorsUrl);
			$.append($$anchor, iframe);
		};

		$.if(node, ($$render) => {
			if (!loadingSponsors && sponsors.length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 4);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.each(div_1, 23, () => contributors.filter((c) => c.login), (contributor, index) => contributor.login || `contributor-${index}`, ($$anchor, contributor) => {
				var a_1 = root();
				var img_1 = $.child(a_1);
				var span_1 = $.sibling(img_1, 2);
				var text_1 = $.only_child(span_1, true);

				$.reset(a_1);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', `https://github.com/${$.get(contributor).login ?? ''}`);
					$.set_attribute(img_1, 'src', $.get(contributor).avatar_url);
					$.set_attribute(img_1, 'alt', $.get(contributor).login);
					$.set_text(text_1, $.get(contributor).login);
				});

				$.append($$anchor, a_1);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_1 = ($$anchor) => {
			var iframe_1 = root_3();

			$.set_attribute(iframe_1, 'src', contributorsUrl);
			$.append($$anchor, iframe_1);
		};

		$.if(node_1, ($$render) => {
			if (!loadingContributors && contributors.length > 0) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var node_2 = $.sibling(node_1, 4);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_5();

			$.each(div_2, 23, () => stargazers.filter((s) => s.login), (stargazer, index) => stargazer.login || `stargazer-${index}`, ($$anchor, stargazer) => {
				var a_2 = root_4();
				var img_2 = $.child(a_2);
				var span_2 = $.sibling(img_2, 2);
				var text_2 = $.only_child(span_2, true);

				$.reset(a_2);

				$.template_effect(() => {
					$.set_attribute(a_2, 'href', `https://github.com/${$.get(stargazer).login ?? ''}`);
					$.set_attribute(img_2, 'src', $.get(stargazer).avatar_url);
					$.set_attribute(img_2, 'alt', $.get(stargazer).login);
					$.set_text(text_2, $.get(stargazer).login);
				});

				$.append($$anchor, a_2);
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate_2 = ($$anchor) => {
			var iframe_2 = root_6();

			$.set_attribute(iframe_2, 'src', stargazersUrl);
			$.append($$anchor, iframe_2);
		};

		$.if(node_2, ($$render) => {
			if (!loadingStargazers && stargazers.length > 0) $$render(consequent_2); else $$render(alternate_2, -1);
		});
	}

	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}