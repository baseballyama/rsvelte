import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../../styles/pages.scss';
import { author, site } from '$lib/constants/site';
import ApiSection from '$lib/components/page-specific/about/ApiSection.svelte';
import SelfHostingSection from '$lib/components/page-specific/about/SelfHostingSection.svelte';
import TipsSection from '$lib/components/page-specific/about/TipsSection.svelte';
import BuildingSection from '$lib/components/page-specific/about/BuildingSection.svelte';
import AuthorSection from '$lib/components/page-specific/about/AuthorSection.svelte';
import AttributionsSection from '$lib/components/page-specific/about/AttributionsSection.svelte';
import LicenseSection from '$lib/components/page-specific/about/LicenseSection.svelte';

var root = $.from_html(
	`<div class="hero svelte-cwls5q"><h2 class="svelte-cwls5q"> </h2> <p class="lead svelte-cwls5q">Networking Toolbox is a collection of free, open-source networking utilities designed to simplify common
    network-related tasks for system administrators and network engineers.</p></div>  <section class="contents svelte-cwls5q"><div><h3>About</h3> <ul><li><a href="/about/api">API</a></li> <li><a href="/about/deploying">Self-Hosting</a></li> <li><a href="/about/building">Developing</a></li> <li><a href="/about/support">Get Support</a></li> <li><a href="/about/attributions">Attributions</a></li> <li><a href="/about/author">About Author</a></li> <li><a href="/about/legal/license">License</a></li></ul></div> <div><h3>External links</h3> <ul><li><a>Source on GitHub</a></li> <li><a>CodeBerg mirror</a></li> <li><a>DockerHub</a></li> <li><a>More apps...</a></li></ul></div></section> <!> <!> <!> <!> <!> <!> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var // Import section components
	div = $.first_child(fragment);

	var h2 = $.child(div);
	var text = $.only_child(h2);

	$.next(2);
	$.reset(div);

	var section = $.sibling(div, 2);
	var div_1 = $.sibling($.child(section), 2);
	var ul = $.sibling($.child(div_1), 2);
	var li = $.child(ul);
	var a = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	var a_1 = $.only_child(li_1);
	var li_2 = $.sibling(li_1, 2);
	var a_2 = $.only_child(li_2);
	var li_3 = $.sibling(li_2, 2);
	var a_3 = $.only_child(li_3);

	$.reset(ul);
	$.reset(div_1);
	$.reset(section);

	var node = $.sibling(section, 2);

	TipsSection(node, {});

	var node_1 = $.sibling(node, 2);

	ApiSection(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	SelfHostingSection(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	BuildingSection(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	AttributionsSection(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	AuthorSection(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	LicenseSection(node_6, {});

	$.template_effect(() => {
		$.set_text(text, `About ${site.title ?? ''}`);
		$.set_attribute(a, 'href', site.repo);
		$.set_attribute(a_1, 'href', site.mirror);
		$.set_attribute(a_2, 'href', site.docker);
		$.set_attribute(a_3, 'href', author.portfolio);
	});

	$.append($$anchor, fragment);
	$.pop();
}