import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import slug from 'speakingurl';

var root = $.from_html(`<li class="svelte-1mn6y5p"><a class="svelte-1mn6y5p"><span class="timestamp fst-900 svelte-1mn6y5p"> </span> </a></li>`);
var root_1 = $.from_html(`<div class="toc"><ul class="svelte-1mn6y5p"></ul></div>`);

export default function TableOfContents($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var ul = $.child(div);

	$.each(ul, 21, () => $$props.aiShowNote?.summary || [], $.index, ($$anchor, summary) => {
		var li = root();
		var a = $.child(li);
		var span = $.child(a);
		var text = $.only_child(span, true);
		var text_1 = $.sibling(span);

		$.reset(a);
		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', `#${$0 ?? ''}`);
				$.set_text(text, $.get(summary).time);
				$.set_text(text_1, ` ${$.get(summary).text ?? ''}`);
			},
			[() => slug($.get(summary).text)]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}