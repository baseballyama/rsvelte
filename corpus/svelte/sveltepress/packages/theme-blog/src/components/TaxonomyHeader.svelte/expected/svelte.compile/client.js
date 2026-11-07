import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<header class="sp-taxonomy svelte-1yg6wfl"><p class="sp-taxonomy__type svelte-1yg6wfl"> </p> <h1 class="sp-taxonomy__name svelte-1yg6wfl"> </h1> <p class="sp-taxonomy__count svelte-1yg6wfl"> </p></header>`);

export default function TaxonomyHeader($$anchor, $$props) {
	var header = root();
	var p = $.child(header);
	var text = $.only_child(p, true);
	var h1 = $.sibling(p, 2);
	var text_1 = $.only_child(h1, true);
	var p_1 = $.sibling(h1, 2);
	var text_2 = $.only_child(p_1);

	$.reset(header);

	$.template_effect(() => {
		$.set_text(text, $$props.type === 'tag' ? '标签' : '分类');
		$.set_text(text_1, $$props.name);
		$.set_text(text_2, `${$$props.count ?? ''} 篇文章`);
	});

	$.append($$anchor, header);
}