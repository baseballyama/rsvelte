import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { author } from '$lib/constants/site';

var root = $.from_html(`<h3>About Me</h3>`);
var root_1 = $.from_html(`<div class="link-button blue"><a href="https://aliciasykes.com" target="_blank">Website</a></div>`);
var root_2 = $.from_html(`<li class="app-item svelte-183v3ap"><img width="24" height="24" class="svelte-183v3ap"/> <div class="app-content svelte-183v3ap"><a target="_blank" rel="noopener noreferrer" class="svelte-183v3ap"> </a> <span class="app-description svelte-183v3ap"> </span></div></li>`);

var root_3 = $.from_html(
	`<h3>Sponsorship</h3> <p>I have developed, open sourced and maintain 100+ applications and libraries, used by over 1 million people every
      year. And pretty much everything I build is free to use, open source, and without ads, tracking or paywalls.
      Because I believe software should be free and accessible to everyone. <br/><br/> But running these projects does cost money. And maintaining them takes time. So, if you've found this app useful, please
      consider <a target="_blank" rel="noopener noreferrer">sponsoring me</a>. My sponsors mean
      the world to me, and it's because of their generosity that this app can remain free for everyone.</p> <div class="link-button pink"><a href="https://github.com/sponsors/lissy93" target="_blank">Sponsor</a></div> <h3 id="more-apps">More Apps</h3> <p>If you've found this app useful, you might also like some of my other projects:</p> <ul class="more-app-list svelte-183v3ap"></ul> <div class="link-button purple"><a href="https://lissy93.github.io" target="_blank">More Apps</a></div>`,
	1
);

var root_4 = $.from_html(`<section id="author"><h2>Author</h2> <!> <div class="author-section svelte-183v3ap"><div class="author-bio"><p class="svelte-183v3ap">This was built by me, <a target="_blank" rel="noopener noreferrer"> </a> (<a target="_blank" rel="noopener noreferrer"> </a> on GitHub). I'm an open
        source developer, passionate about Linux, security and the web.</p> <p class="svelte-183v3ap">I build free and open source software for the developers, sysadmins and sometimes humans. My objective is to
        build tools that respect a user's privacy and are accessible to everyone. I have a particular interest in
        security, Linux and self-hosting. But also just love to build things that are fun and (sometimes, maybe) useful.</p></div> <img class="profile-photo svelte-183v3ap" width="128"/></div> <!> <!></section>`);

export default function AuthorSection($$anchor, $$props) {
	$.push($$props, true);

	let longMode = $.prop($$props, 'longMode', 3, false);

	const moreApps = [
		{
			name: 'domain-locker',
			title: 'Domain Locker',
			icon: 'https://cdn.as93.net/logo/domain-locker/w128',
			description: 'Domain name portfolio app for monitoring your domains',
			color: '#9571ff'
		},

		{
			name: 'web-check',
			title: 'Web Check',
			description: 'The ultimate all-in-one OSINT tool for analyzing any website',
			icon: 'https://cdn.as93.net/logo/web-check/w128',
			color: '#9fef00'
		},

		{
			name: 'permissionator',
			title: 'Permissionator',
			description: 'A Linux chmod calculator, for generating safe file permissions',
			icon: 'https://cdn.as93.net/logo/permissionator/w128',
			color: '#05df72'
		},

		{
			name: 'personal-security-checklist',
			title: 'Digital Defense',
			description: 'The ultimate security checklist, for protecting your data online',
			icon: 'https://pixelflare.cc/alicia/logo/digital-defense/w128',
			color: '#a78bfa'
		},

		{
			name: 'awesome-privacy',
			title: 'Awesome Privacy',
			icon: 'https://pixelflare.cc/alicia/logo/awesome-privacy/w128',
			description: 'A curated list of services which respects your privacy',
			color: '#fc60a8'
		},

		{
			name: 'dashy',
			title: 'Dashy',
			description: 'A self-hostable personal server dashboard',
			icon: 'https://cdn.as93.net/logo/dashy/w128',
			color: '#00efe3'
		}
	];

	var section = root_4();
	var node = $.sibling($.child(section), 2);

	{
		var consequent = ($$anchor) => {
			var h3 = root();

			$.append($$anchor, h3);
		};

		$.if(node, ($$render) => {
			if (longMode()) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var a = $.sibling($.child(p));
	var text = $.only_child(a, true);
	var a_1 = $.sibling(a, 2);
	var text_1 = $.only_child(a_1);

	$.next();
	$.reset(p);
	$.next(2);
	$.reset(div_1);

	var img = $.sibling(div_1, 2);

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (longMode()) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root_3();
			var p_1 = $.sibling($.first_child(fragment), 2);
			var a_2 = $.sibling($.child(p_1), 4);

			$.next();
			$.reset(p_1);

			var ul = $.sibling(p_1, 8);

			$.each(ul, 21, () => moreApps, (app) => app.name, ($$anchor, app) => {
				var li = root_2();
				var img_1 = $.child(li);
				var div_3 = $.sibling(img_1, 2);
				var a_3 = $.child(div_3);
				var text_2 = $.only_child(a_3, true);
				var span = $.sibling(a_3, 2);
				var text_3 = $.only_child(span, true);

				$.reset(div_3);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(img_1, 'src', $.get(app).icon);
					$.set_attribute(img_1, 'alt', $.get(app).title);
					$.set_attribute(a_3, 'href', `https://github.com/lissy93/${$.get(app).name ?? ''}`);
					$.set_style(a_3, `--app-color: ${$.get(app).color ?? ''}`);
					$.set_text(text_2, $.get(app).title);
					$.set_text(text_3, $.get(app).description);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.next(2);
			$.template_effect(() => $.set_attribute(a_2, 'href', author.sponsor));
			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if (longMode()) $$render(consequent_2);
		});
	}

	$.reset(section);

	$.template_effect(() => {
		$.set_attribute(a, 'href', author.url);
		$.set_text(text, author.name);
		$.set_attribute(a_1, 'href', author.githubUrl);
		$.set_text(text_1, `@${author.github ?? ''}`);
		$.set_attribute(img, 'src', author.avatar);
		$.set_attribute(img, 'alt', author.name);
	});

	$.append($$anchor, section);
	$.pop();
}