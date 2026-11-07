import * as $ from 'svelte/internal/server';
import { site, author, license } from '$lib/constants/site';

export default function LicenseSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { longMode = false } = $$props;

		$$renderer.push(`<section id="license"><h2>License</h2> <p class="license-summary"><a${$.attr('href', site.url)}>${$.escape(site.title)}</a> is licensed under the <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17">${$.escape(license.name)} License</a> © <a${$.attr('href', author.url)}>${$.escape(author.name)}</a> ${$.escape(license.date)}</p> `);

		if (longMode) {
			$$renderer.push(`<!--[0--><h3>Conditions</h3> <ul class="license-tldr svelte-5z3xh9"><li class="license-tldr-item can svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Can</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Use commercially</li> <li class="svelte-5z3xh9">Modify the code</li> <li class="svelte-5z3xh9">Distribute the code</li> <li class="svelte-5z3xh9">Sublicense the app</li></ul></li> <li class="license-tldr-item cannot svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Cannot</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Hold the author liable</li></ul></li> <li class="license-tldr-item must svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Must</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Include the original copyright</li> <li class="svelte-5z3xh9">Include the below license in full</li></ul></li></ul>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (longMode) {
			$$renderer.push(`<!--[0--><h3>Full License</h3>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <pre class="license-content svelte-5z3xh9">
Copyright (c) 2026 Alicia Sykes [aliciasykes.com]

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in the
Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre></section>`);
	});
}