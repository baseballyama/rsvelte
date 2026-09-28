import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';

var root = $.from_html(`<meta name="description" content="Community guidelines and code of conduct for Networking Toolbox contributors"/> <meta property="og:title"/> <meta property="og:description" content="Learn about our community standards and code of conduct"/> <meta property="og:url"/>`, 1);

var root_1 = $.from_html(
	`<div class="hero"><h2>Community Guidelines</h2> <p class="lead">Building a welcoming and inclusive community.</p></div> <section><h3>Code of Conduct</h3> <p>Networking Toolbox follows the <a rel="noopener noreferrer" target="_blank">Contributor Covenant Code of Conduct</a>.</p> <p>We are committed to providing a welcoming and inclusive environment for everyone. This applies to all project spaces
    including GitHub issues, pull requests, discussions, and any other community interactions.</p></section> <section><h3>Expected Behavior</h3> <ul><li>Be respectful and considerate in your communication</li> <li>Welcome newcomers and help them get started</li> <li>Focus on constructive feedback and collaboration</li> <li>Respect differing viewpoints and experiences</li> <li>Accept responsibility and apologize when mistakes are made</li></ul></section> <section><h3>Reporting Issues</h3> <p>If you experience or witness unacceptable behavior, please report it by opening an issue on <a rel="noopener noreferrer" target="_blank">GitHub</a> or contacting the project maintainer directly.</p> <p>All reports will be handled with discretion and confidentiality.</p></section>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment_1 = root_1();

	$.head('1jdnfb2', ($$anchor) => {
		var fragment = root();
		var meta = $.sibling($.first_child(fragment), 2);
		var meta_1 = $.sibling(meta, 4);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', `Community Guidelines | ${site.title ?? ''}`);
			$.set_attribute(meta_1, 'content', `${site.url ?? ''}/about/legal/community`);
		});

		$.effect(() => {
			$.document.title = 'Community Guidelines | Networking Toolbox';
		});

		$.append($$anchor, fragment);
	});

	var section = $.sibling($.first_child(fragment_1), 2);
	var p = $.sibling($.child(section), 2);
	var a = $.sibling($.child(p));

	$.next();
	$.reset(p);
	$.next(2);
	$.reset(section);

	var section_1 = $.sibling(section, 4);
	var p_1 = $.sibling($.child(section_1), 2);
	var a_1 = $.sibling($.child(p_1));

	$.next();
	$.reset(p_1);
	$.next(2);
	$.reset(section_1);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${site.repo ?? ''}/blob/main/.github/CODE_OF_CONDUCT.md`);
		$.set_attribute(a_1, 'href', `${site.repo ?? ''}/issues`);
	});

	$.append($$anchor, fragment_1);
	$.pop();
}