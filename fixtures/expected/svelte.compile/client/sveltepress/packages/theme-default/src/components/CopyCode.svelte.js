import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Copy from './icons/Copy.svelte';
import CopyDone from './icons/CopyDone.svelte';

var root = $.from_html(`<div class="svp-code-block--copy-code"><!></div>`);
var root_1 = $.from_html(`<div class="svp-code-block--copy-code" role="button" tabindex="0" aria-label="Copy code"><!></div>`);

export default function CopyCode($$anchor, $$props) {
	$.push($$props, true);

	let container = $.state(void 0);
	let copied = $.state(false);

	function handleClick() {
		const content = $.get(container)?.parentElement?.querySelector('.shiki')?.textContent || '';

		navigator.clipboard.writeText(content);
		$.set(copied, true);

		setTimeout(
			() => {
				$.set(copied, false);
			},
			2000
		);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			CopyDone(node_1, {});
			$.reset(div);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			Copy(node_2, {});
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(container, $$value), () => $.get(container));
			$.delegated('click', div_1, handleClick);
			$.delegated('keyup', div_1, handleClick);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(copied)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keyup']);