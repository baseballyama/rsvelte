import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site, author, license } from '$lib/constants/site';

var root = $.from_html(`<h3>Conditions</h3> <ul class="license-tldr svelte-5z3xh9"><li class="license-tldr-item can svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Can</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Use commercially</li> <li class="svelte-5z3xh9">Modify the code</li> <li class="svelte-5z3xh9">Distribute the code</li> <li class="svelte-5z3xh9">Sublicense the app</li></ul></li> <li class="license-tldr-item cannot svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Cannot</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Hold the author liable</li></ul></li> <li class="license-tldr-item must svelte-5z3xh9"><div class="item-head svelte-5z3xh9">You Must</div> <ul class="svelte-5z3xh9"><li class="svelte-5z3xh9">Include the original copyright</li> <li class="svelte-5z3xh9">Include the below license in full</li></ul></li></ul>`, 1);
var root_1 = $.from_html(`<h3>Full License</h3>`);

var root_2 = $.from_html(`<section id="license"><h2>License</h2> <p class="license-summary"><a> </a> is licensed under the <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17"> </a> © <a> </a> </p> <!> <!> <pre class="license-content svelte-5z3xh9">
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

export default function LicenseSection($$anchor, $$props) {
	$.push($$props, true);

	let longMode = $.prop($$props, 'longMode', 3, false);
	var section = root_2();
	var p = $.sibling($.child(section), 2);
	var a = $.child(p);
	var text = $.only_child(a, true);
	var a_1 = $.sibling(a, 2);
	var text_1 = $.only_child(a_1);
	var a_2 = $.sibling(a_1, 2);
	var text_2 = $.only_child(a_2, true);
	var text_3 = $.sibling(a_2);

	$.reset(p);

	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (longMode()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var h3 = root_1();

			$.append($$anchor, h3);
		};

		$.if(node_1, ($$render) => {
			if (longMode()) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(section);

	$.template_effect(() => {
		$.set_attribute(a, 'href', site.url);
		$.set_text(text, site.title);
		$.set_text(text_1, `${license.name ?? ''} License`);
		$.set_attribute(a_2, 'href', author.url);
		$.set_text(text_2, author.name);
		$.set_text(text_3, ` ${license.date ?? ''}`);
	});

	$.append($$anchor, section);
	$.pop();
}