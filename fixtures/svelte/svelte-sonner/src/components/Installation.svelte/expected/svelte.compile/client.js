import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import copy from 'copy-to-clipboard';

var root = $.from_html(`<div class="svelte-ieftj0"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M20 6L9 17l-5-5"></path></svg></div>`);
var root_1 = $.from_html(`<div class="svelte-ieftj0"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path></svg></div>`);
var root_2 = $.from_html(`<div><h2>Installation</h2>  <code class="code svelte-ieftj0">npm install svelte-sonner <button aria-label="Copy code" class="copy svelte-ieftj0"><!></button></code></div>`);

export default function Installation($$anchor, $$props) {
	$.push($$props, true);

	let copying = 0;

	function onCopy() {
		copy('npm install svelte-sonner');
		copying++;

		setTimeout(
			() => {
				copying--;
			},
			2000
		);
	}

	var div = root_2();
	var code = $.sibling($.child(div), 2);
	var button = $.sibling($.child(code));
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (copying) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(code);
	$.reset(div);
	$.delegated('click', code, onCopy);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);