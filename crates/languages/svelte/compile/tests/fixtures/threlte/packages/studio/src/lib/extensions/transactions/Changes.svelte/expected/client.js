import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStudio } from '../../internal/extensions.js';
import { transactionsScope } from './types.js';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`Unsaved changes in:<br/> <ul class="svelte-82x53i"></ul>`, 1);
var root_2 = $.from_html(`<div class="svelte-82x53i"><!></div>`);

export default function Changes($$anchor, $$props) {
	$.push($$props, true);

	const { useExtension } = useStudio();
	const extension = useExtension(transactionsScope);

	const fileNames = $.derived(() => {
		if (!extension.state.queue) return [];

		return [
			...new Set(extension.state.queue.syncQueue.map((t) => t.moduleId.replace(/^.*[\\/]/, '')))
		];
	});

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var ul = $.sibling($.first_child(fragment), 3);

			$.each(ul, 20, () => $.get(fileNames), (fileName) => fileName, ($$anchor, fileName) => {
				var li = root();
				var text = $.only_child(li, true);

				$.template_effect(() => $.set_text(text, fileName));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Up-to-date');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(fileNames).length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}