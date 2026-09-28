import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextField from "components/TextField";
import Code from "docs/Code.svelte";

var root = $.from_html(
	`<h4 class="pb-8">Color helper classes</h4> <p>Right now Smelte adds very little to what Tailwind <a class="a" href="https://tailwindcss.com/docs/background-color/">has</a> <a class="a" href="https://tailwindcss.com/docs/text-color/">to offer</a> dealing with color except for porting the Material design color <a class="a" href="https://material.io/design/color/#tools-for-picking-colors">palette</a> and adding a few extra utilities like caret color on inputs or colored ripple
  animation effect. Colors themselves are configured in <a class="a" href="https://github.com/matyunya/smelte/blob/master/tailwind.config.js">tailwind.config.js</a> .</p> <h5 class="mt-6 mb-2">Background</h5> <span class="code-inline"></span> gives element appropriate background color: <!> <div class="bg-deep-purple-500 text-white p-4">This div is deep purple.</div> <h5 class="mt-6 mb-2">Text</h5> <span class="code-inline"></span> changes text color accordingly: <!> <h4 class="text-error-500">This header is error color</h4> <h5 class="mt-6 mb-2">Border</h5> Same principle applies to border, but there are also border width <span class="code-inline"></span> and type <span class="code-inline"></span> helpers. <!> <div class="border-2 border-secondary-600 p-4">This div has secondary color border</div>`,
	1
);

export default function Color($$anchor) {
	var fragment = root();
	var span = $.sibling($.first_child(fragment), 6);

	span.textContent = '.bg-{color}-{variant}';

	var node = $.sibling(span, 2);

	Code(node, {
		code: '<div class="bg-deep-purple-500 text-white p-4">This div is deep purple.</div>'
	});

	var span_1 = $.sibling(node, 6);

	span_1.textContent = '.text-{color}-{variant}';

	var node_1 = $.sibling(span_1, 2);

	Code(node_1, { code: '<h4 class="text-error-500">This header is error</h4>' });

	var span_2 = $.sibling(node_1, 6);

	span_2.textContent = 'border-{n}';

	var span_3 = $.sibling(span_2, 2);

	span_3.textContent = 'border-{solid|dashed|dotted|none}';

	var node_2 = $.sibling(span_3, 2);

	Code(node_2, {
		code: '<div class="border-2 border-secondary-600 p-4">This div has secondary border</div>'
	});

	$.next(2);
	$.append($$anchor, fragment);
}