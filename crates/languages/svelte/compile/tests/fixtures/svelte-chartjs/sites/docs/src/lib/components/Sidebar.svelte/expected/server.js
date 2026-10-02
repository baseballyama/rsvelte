import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { base } from '$app/paths';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false } = $$props;

		const charts = [
			{ href: '/charts/bar', label: 'Bar' },
			{ href: '/charts/line', label: 'Line' },
			{ href: '/charts/pie', label: 'Pie' },
			{ href: '/charts/doughnut', label: 'Doughnut' },
			{ href: '/charts/radar', label: 'Radar' },
			{ href: '/charts/polar', label: 'Polar Area' },
			{ href: '/charts/bubble', label: 'Bubble' },
			{ href: '/charts/scatter', label: 'Scatter' }
		];

		const examples = [
			{ href: '/examples/ref', label: 'Chart Instance' },
			{ href: '/examples/events', label: 'Events' },
			{ href: '/examples/horizontal-bar', label: 'Horizontal Bar' },
			{ href: '/examples/stacked-bar', label: 'Stacked Bar' },
			{ href: '/examples/multitype', label: 'Mixed Chart' },
			{ href: '/examples/gradient', label: 'Gradient' }
		];

		const guides = [{ href: '/guides/reactivity', label: 'Reactive Data' }];

		function closeOnMobile() {
			open = false;
		}

		if (open) {
			$$renderer.push(`<!--[0--><div class="overlay svelte-1b25erl" role="button" tabindex="-1"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <aside${$.attr_class('svelte-1b25erl', void 0, { 'open': open })}><nav class="svelte-1b25erl"><a${$.attr('href', `${base}/`)}${$.attr_class('svelte-1b25erl', void 0, { 'active': page.url.pathname === `${base}/` })}>Home</a> <h4 class="svelte-1b25erl">Charts</h4> <!--[-->`);

		const each_array = $.ensure_array_like(charts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { href, label } = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `${base}${href}`)}${$.attr_class('svelte-1b25erl', void 0, { 'active': page.url.pathname === `${base}${href}` })}>${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--> <h4 class="svelte-1b25erl">Examples</h4> <!--[-->`);

		const each_array_1 = $.ensure_array_like(examples);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { href, label } = each_array_1[$$index_1];

			$$renderer.push(`<a${$.attr('href', `${base}${href}`)}${$.attr_class('svelte-1b25erl', void 0, { 'active': page.url.pathname === `${base}${href}` })}>${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--> <h4 class="svelte-1b25erl">Guides</h4> <!--[-->`);

		const each_array_2 = $.ensure_array_like(guides);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { href, label } = each_array_2[$$index_2];

			$$renderer.push(`<a${$.attr('href', `${base}${href}`)}${$.attr_class('svelte-1b25erl', void 0, { 'active': page.url.pathname === `${base}${href}` })}>${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--> <h4 class="svelte-1b25erl">Reference</h4> <a${$.attr('href', `${base}/api`)}${$.attr_class('svelte-1b25erl', void 0, { 'active': page.url.pathname === `${base}/api` })}>API</a></nav></aside>`);
		$.bind_props($$props, { open });
	});
}