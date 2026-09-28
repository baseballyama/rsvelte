import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<img class="sp-profile__avatar svelte-1t7gz0j" alt="" width="128" height="128"/>`);
var root_1 = $.from_html(`<p class="sp-profile__bio svelte-1t7gz0j"> </p>`);
var root_2 = $.from_html(`<li><a rel="me" class="svelte-1t7gz0j"> </a></li>`);
var root_3 = $.from_html(`<ul class="sp-profile__socials svelte-1t7gz0j"></ul>`);
var root_4 = $.from_html(`<section class="sp-profile svelte-1t7gz0j"><!> <h1 class="sp-profile__name svelte-1t7gz0j"> </h1> <!> <!></section>`);

export default function AuthorProfile($$anchor, $$props) {
	$.push($$props, true);

	const author = $.derived(() => blogConfig.author);

	const socialDefs = [
		{
			key: 'github',
			label: 'GitHub',
			href: (v) => `https://github.com/${v}`
		},

		{
			key: 'twitter',
			label: 'Twitter/X',
			href: (v) => `https://x.com/${v}`
		},
		{ key: 'mastodon', label: 'Mastodon', href: (v) => v },
		{
			key: 'bluesky',
			label: 'Bluesky',
			href: (v) => `https://bsky.app/profile/${v}`
		},
		{ key: 'email', label: 'Email', href: (v) => `mailto:${v}` },
		{ key: 'website', label: 'Website', href: (v) => v },
		{ key: 'rss', label: 'RSS', href: (v) => v }
	];

	const socials = $.derived(() => {
		const s = $.get(author)?.socials;
		const out = [];

		if (s) {
			for (const d of socialDefs) {
				const v = s[d.key];

				if (v) out.push({ label: d.label, href: d.href(v) });
			}
		}

		return out;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var section = root_4();
			var node_1 = $.child(section);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => $.set_attribute(img, 'src', $.get(author).avatar));
					$.append($$anchor, img);
				};

				$.if(node_1, ($$render) => {
					if ($.get(author).avatar) $$render(consequent);
				});
			}

			var h1 = $.sibling(node_1, 2);
			var text = $.only_child(h1, true);
			var node_2 = $.sibling(h1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_1();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $.get(author).bio));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($.get(author).bio) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var ul = root_3();

					$.each(ul, 21, () => $.get(socials), (s) => s.label, ($$anchor, s) => {
						var li = root_2();
						var a = $.child(li);
						var text_2 = $.only_child(a, true);

						$.reset(li);

						$.template_effect(() => {
							$.set_attribute(a, 'href', $.get(s).href);
							$.set_text(text_2, $.get(s).label);
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_3, ($$render) => {
					if ($.get(socials).length) $$render(consequent_2);
				});
			}

			$.reset(section);
			$.template_effect(() => $.set_text(text, $.get(author).name));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(author)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}