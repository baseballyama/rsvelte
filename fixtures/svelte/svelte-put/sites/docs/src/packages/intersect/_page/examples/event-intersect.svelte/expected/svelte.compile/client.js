import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { intersect } from '@svelte-put/intersect';

var root = $.from_html(`<span> </span> & <span> </span>`, 1);
var root_1 = $.from_html(`<p><!></p>`);
var root_2 = $.from_html(`<div class="hl-info mx-auto flex h-80 w-4/5 flex-col items-center justify-between"></div>`);

export default function Event_intersect($$anchor, $$props) {
	$.push($$props, true);

	let detail = $.state(void 0);

	function onIntersect(e) {
		$.set(detail, e.detail, true);
	}

	var div = root_2();

	$.each(div, 20, () => new Array(2), $.index, ($$anchor, _) => {
		var p = root_1();
		var node = $.child(p);

		{
			var consequent = ($$anchor) => {
				var fragment = root();
				var span = $.first_child(fragment);
				var text = $.only_child(span);
				var span_1 = $.sibling(span, 2);
				var text_1 = $.only_child(span_1, true);

				$.template_effect(() => {
					$.set_text(text, `Scrolling ${$.get(detail)?.direction ?? ''}`);
					$.set_text(text_1, $.get(detail)?.entries[0]?.isIntersecting ? 'entering' : 'leaving');
				});

				$.append($$anchor, fragment);
			};

			$.if(node, ($$render) => {
				if ($.get(detail)) $$render(consequent);
			});
		}

		$.reset(p);
		$.append($$anchor, p);
	});

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => intersect?.($$node, $$action_arg), () => ({ threshold: 0.5, rootMargin: '-100px 0px 0px' }));
	$.event('intersect', div, onIntersect);
	$.append($$anchor, div);
	$.pop();
}