import * as $ from 'svelte/internal/server';
import '../../styles/pages.scss';
import { author, site } from '$lib/constants/site';
import ApiSection from '$lib/components/page-specific/about/ApiSection.svelte';
import SelfHostingSection from '$lib/components/page-specific/about/SelfHostingSection.svelte';
import TipsSection from '$lib/components/page-specific/about/TipsSection.svelte';
import BuildingSection from '$lib/components/page-specific/about/BuildingSection.svelte';
import AuthorSection from '$lib/components/page-specific/about/AuthorSection.svelte';
import AttributionsSection from '$lib/components/page-specific/about/AttributionsSection.svelte';
import LicenseSection from '$lib/components/page-specific/about/LicenseSection.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="hero svelte-cwls5q"><h2 class="svelte-cwls5q">About ${$.escape(
			// Import section components
			site.title
		)}</h2> <p class="lead svelte-cwls5q">Networking Toolbox is a collection of free, open-source networking utilities designed to simplify common
    network-related tasks for system administrators and network engineers.</p></div>  <section class="contents svelte-cwls5q"><div><h3>About</h3> <ul><li><a href="/about/api">API</a></li> <li><a href="/about/deploying">Self-Hosting</a></li> <li><a href="/about/building">Developing</a></li> <li><a href="/about/support">Get Support</a></li> <li><a href="/about/attributions">Attributions</a></li> <li><a href="/about/author">About Author</a></li> <li><a href="/about/legal/license">License</a></li></ul></div> <div><h3>External links</h3> <ul><li><a${$.attr('href', site.repo)}>Source on GitHub</a></li> <li><a${$.attr('href', site.mirror)}>CodeBerg mirror</a></li> <li><a${$.attr('href', site.docker)}>DockerHub</a></li> <li><a${$.attr('href', author.portfolio)}>More apps...</a></li></ul></div></section> `);

		TipsSection($$renderer, {});
		$$renderer.push(`<!----> `);
		ApiSection($$renderer, {});
		$$renderer.push(`<!----> `);
		SelfHostingSection($$renderer, {});
		$$renderer.push(`<!----> `);
		BuildingSection($$renderer, {});
		$$renderer.push(`<!----> `);
		AttributionsSection($$renderer, {});
		$$renderer.push(`<!----> `);
		AuthorSection($$renderer, {});
		$$renderer.push(`<!----> `);
		LicenseSection($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}