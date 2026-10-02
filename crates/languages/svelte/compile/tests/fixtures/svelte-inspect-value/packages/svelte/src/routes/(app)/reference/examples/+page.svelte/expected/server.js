import * as $ from 'svelte/internal/server';
import BasicEditable from '$doclib/examples/BasicEditable.svelte';
import Classes from '$doclib/examples/Classes.svelte';
import EmbedMedia from '$doclib/examples/EmbedMedia.svelte';
import Functions from '$doclib/examples/Functions.svelte';
import GettersAndSetters from '$doclib/examples/GettersAndSetters.svelte';
import HtmlElements from '$doclib/examples/HTMLElements.svelte';
import Iterators from '$doclib/examples/Iterators.svelte';
import MapAndSet from '$doclib/examples/MapAndSet.svelte';
import MultiLineStrings from '$doclib/examples/MultiLineStrings.svelte';
import Other from '$doclib/examples/Other.svelte';
import Promises from '$doclib/examples/Promises.svelte';
import Stores from '$doclib/examples/Stores.svelte';
import Urls from '$doclib/examples/Urls.svelte';
import { createPageTitle } from '$doclib/util.js';
import { PanelValue } from '$lib/index.js';
import { setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let codeSamples = $.derived(() => data.codeSamples);
		const toc = new SvelteMap();

		setContext('toc', toc);

		$.head('irkmml', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('Examples'))}</title>`);
			});
		});

		PanelValue($$renderer, { key: 'toc', value: toc });
		$$renderer.push(`<!----> <div class="toc"><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [title, id] = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `#${id}`)}>${$.escape(title)}</a> <hr/>`);
		}

		$$renderer.push(`<!--]--></div> <h2>Examples</h2> `);
		BasicEditable($$renderer, {});
		$$renderer.push(`<!----> `);
		MultiLineStrings($$renderer, {});
		$$renderer.push(`<!----> `);
		MapAndSet($$renderer, {});
		$$renderer.push(`<!----> `);
		Promises($$renderer, { code: codeSamples().promises });
		$$renderer.push(`<!----> `);
		Stores($$renderer, {});
		$$renderer.push(`<!----> `);
		HtmlElements($$renderer, {});
		$$renderer.push(`<!----> `);
		Classes($$renderer, {});
		$$renderer.push(`<!----> `);
		Functions($$renderer, {});
		$$renderer.push(`<!----> `);
		Urls($$renderer, {});
		$$renderer.push(`<!----> `);
		GettersAndSetters($$renderer, { code: codeSamples().gettersAndSetters });
		$$renderer.push(`<!----> `);
		Iterators($$renderer, { code: codeSamples().iterators });
		$$renderer.push(`<!----> `);
		EmbedMedia($$renderer, {});
		$$renderer.push(`<!----> `);
		Other($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}