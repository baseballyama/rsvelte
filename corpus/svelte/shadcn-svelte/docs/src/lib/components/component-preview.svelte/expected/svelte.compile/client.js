import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentPreviewTabs from "./component-preview-tabs.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'type',
	'class',
	'align',
	'hideCode'
]);

var root = $.from_html(`<div class="relative aspect-[4/2.5] w-full overflow-hidden rounded-md border md:-mx-4" data-llm-ignore=""><img class="absolute start-0 top-0 z-20 w-[970px] max-w-none bg-background sm:w-7xl md:hidden dark:hidden md:dark:hidden"/> <img class="absolute start-0 top-0 z-20 hidden w-[970px] max-w-none bg-background sm:w-7xl md:hidden dark:block md:dark:hidden"/> <div class="absolute inset-0 hidden w-[1600px] bg-background md:block"><iframe class="size-full"></iframe></div></div>`);

export default function Component_preview($$anchor, $$props) {
	let type = $.prop($$props, 'type', 3, "example"),
		align = $.prop($$props, 'align', 3, "center"),
		hideCode = $.prop($$props, 'hideCode', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var img = $.child(div);

			$.set_attribute(img, 'width', 1440);
			$.set_attribute(img, 'height', 900);

			var img_1 = $.sibling(img, 2);

			$.set_attribute(img_1, 'width', 1440);
			$.set_attribute(img_1, 'height', 900);

			var div_1 = $.sibling(img_1, 2);
			var iframe = $.only_child(div_1);

			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(img, 'src', `/img/registry/${$$props.name ?? ''}-light.png`);
				$.set_attribute(img, 'alt', $$props.name);
				$.set_attribute(img_1, 'src', `/img/registry/${$$props.name ?? ''}-dark.png`);
				$.set_attribute(img_1, 'alt', $$props.name);
				$.set_attribute(iframe, 'src', `/view/${$$props.name ?? ''}`);
				$.set_attribute(iframe, 'title', $$props.name);
			});

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			ComponentPreviewTabs($$anchor, $.spread_props(
				{
					get name() {
						return $$props.name;
					},

					get class() {
						return $$props.class;
					},

					get align() {
						return align();
					},

					get hideCode() {
						return hideCode();
					}
				},
				() => restProps
			));
		};

		$.if(node, ($$render) => {
			if (type() === "block") $$render(consequent); else if (type() === "component" || type() === "example") $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
}