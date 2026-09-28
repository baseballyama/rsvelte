import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BlockViewerContext } from "./block-viewer.svelte";

var root = $.from_html(`<div class="overflow-hidden rounded-xl border"><img class="object-cover dark:hidden"/> <img class="hidden object-cover dark:block"/></div>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-2 lg:hidden"><div class="flex items-center gap-2 px-2"><div class="line-clamp-1 text-sm font-medium"> </div> <div class="ms-auto shrink-0 font-mono text-xs text-muted-foreground"> </div></div> <!></div>`);

export default function Block_viewer_view_mobile($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_1 = $.only_child(div_3, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_4 = root();
			var img = $.child(div_4);

			$.set_attribute(img, 'width', 1440);
			$.set_attribute(img, 'height', 900);

			var img_1 = $.sibling(img, 2);

			$.set_attribute(img_1, 'width', 1440);
			$.set_attribute(img_1, 'height', 900);
			$.reset(div_4);

			$.template_effect(() => {
				$.set_attribute(img, 'src', `/img/registry/${ctx.item.name ?? ''}-light.png`);
				$.set_attribute(img, 'alt', ctx.item.name);
				$.set_attribute(img, 'data-block', ctx.item.name);
				$.set_attribute(img_1, 'src', `/img/registry/${ctx.item.name ?? ''}-dark.png`);
				$.set_attribute(img_1, 'alt', ctx.item.name);
				$.set_attribute(img_1, 'data-block', ctx.item.name);
			});

			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if (ctx.item.meta?.mobile === "component") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ctx.item.description);
		$.set_text(text_1, ctx.item.name);
	});

	$.append($$anchor, div);
	$.pop();
}