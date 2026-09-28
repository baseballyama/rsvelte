import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$/lib/Icon.svelte';
import Logo from '$/lib/Logo.svelte';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';
import PodcastLinks from '$/lib/PodcastLinks.svelte';
import '../../(site)/style.css';

var root = $.from_html(`<div class="theme-wrapper theme-light"><div class="logo svelte-18y08rk"><a href="/" class="svelte-18y08rk"><!></a></div> <main class="page-layout layout zone"><section><h3 class="h4 lines" style="margin: 2rem 0;">Subscribe to the podcast</h3> <!> <br/> <h3 class="h4 lines">Links</h3> <div class="links svelte-18y08rk"><a target="_blank" class="button subscribe subscribe--x svelte-18y08rk"><!></a> <a target="_blank" class="button subscribe subscribe--github svelte-18y08rk"><!></a> <a target="_blank" class="button subscribe subscribe--instagram svelte-18y08rk"><!></a> <a target="_blank" class="button subscribe subscribe--tiktok svelte-18y08rk"><!></a> <a target="_blank" class="button subscribe subscribe--linkedin svelte-18y08rk"><!></a> <a target="_blank" class="button subscribe subscribe--threads svelte-18y08rk"><!></a></div></section> <div class="zone layout full"><div><!></div></div></main></div>`);

export default function _page($$anchor) {
	const POD_DATA = {
		name: 'Syntax',
		twitter: 'syntaxfm',
		instagram: 'syntax_fm',
		tiktok: 'syntaxfm',
		linkedin_company: 'syntaxfm',
		threads: 'syntax_fm',
		github: 'syntaxfm'
	};

	var div = root();
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.child(a);

	Logo(node, {});
	$.reset(a);
	$.reset(div_1);

	var main = $.sibling(div_1, 2);

	$.set_style(main, '', {}, { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' });

	var section = $.child(main);
	var node_1 = $.sibling($.child(section), 2);

	PodcastLinks(node_1, {});

	var div_2 = $.sibling(node_1, 6);
	var a_1 = $.child(div_2);
	var node_2 = $.child(a_1);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on X`);

		Icon(node_2, {
			name: 'x',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_1);

	var a_2 = $.sibling(a_1, 2);
	var node_3 = $.child(a_2);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on GitHub`);

		Icon(node_3, {
			name: 'github',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_2);

	var a_3 = $.sibling(a_2, 2);
	var node_4 = $.child(a_3);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on Instagram`);

		Icon(node_4, {
			name: 'instagram',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_3);

	var a_4 = $.sibling(a_3, 2);
	var node_5 = $.child(a_4);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on TikTok`);

		Icon(node_5, {
			name: 'tiktok',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_4);

	var a_5 = $.sibling(a_4, 2);
	var node_6 = $.child(a_5);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on LinkedIn`);

		Icon(node_6, {
			name: 'linkedin',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_5);

	var a_6 = $.sibling(a_5, 2);
	var node_7 = $.child(a_6);

	{
		let $0 = $.derived(() => `${POD_DATA.name} on Threads`);

		Icon(node_7, {
			name: 'threads',
			get title() {
				return $.get($0);
			}
		});
	}

	$.reset(a_6);
	$.reset(div_2);
	$.reset(section);

	var div_3 = $.sibling(section, 2);

	$.set_style(div_3, '', {}, { '--bg': 'var(--black)', '--fg': 'var(--white)' });

	var div_4 = $.child(div_3);
	var node_8 = $.child(div_4);

	NewsletterForm(node_8, { show_logo: false });
	$.reset(div_4);
	$.reset(div_3);
	$.reset(main);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a_1, 'href', `https://x.com/${POD_DATA.twitter}`);
		$.set_attribute(a_2, 'href', `https://github.com/${POD_DATA.github}`);
		$.set_attribute(a_3, 'href', `https://www.instagram.com/${POD_DATA.instagram}/`);
		$.set_attribute(a_4, 'href', `https://www.tiktok.com/@${POD_DATA.tiktok}`);
		$.set_attribute(a_5, 'href', `https://www.linkedin.com/company/${POD_DATA.linkedin_company}/`);
		$.set_attribute(a_6, 'href', `https://www.threads.net/@${POD_DATA.threads}`);
	});

	$.append($$anchor, div);
}