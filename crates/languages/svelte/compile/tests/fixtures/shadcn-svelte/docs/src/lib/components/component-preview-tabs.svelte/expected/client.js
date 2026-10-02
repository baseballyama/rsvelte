import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'align',
	'component',
	'example',
	'children',
	'name',
	'hideCode'
]);

var root = $.from_html(`<p class="text-sm text-muted-foreground">Component <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"> </code> not found in registry.</p>`);
var root_1 = $.from_html(`<div class="absolute inset-0 flex items-center justify-center pb-4"><div class="absolute inset-0" style="background: linear-gradient(to top, var(--color-code), color-mix(in oklab, var(--color-code) 60%, transparent), transparent)"></div> <!></div>`);
var root_2 = $.from_html(`<div data-slot="code" class="relative overflow-hidden **:data-rehype-pretty-code-figure:m-0! **:data-rehype-pretty-code-figure:rounded-t-none **:data-rehype-pretty-code-figure:border-t data-[code-visible=false]:**:data-rehype-pretty-code-figure:max-h-22 data-[code-visible=false]:**:data-rehype-pretty-code-figure:overflow-hidden **:data-[slot=copy-button]:right-4 **:data-[slot=copy-button]:hidden data-[code-visible=true]:**:data-[slot=copy-button]:flex data-[code-visible=true]:[&amp;_pre]:max-h-72"><!> <!></div>`);
var root_3 = $.from_html(`<div><div data-slot="preview" class="preview flex w-full justify-center data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start" data-llm-ignore=""><div class="preview flex min-h-[450px] w-full justify-center p-10 data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start"><!></div></div> <!></div>`);

export default function Component_preview_tabs($$anchor, $$props) {
	$.push($$props, true);

	const ExampleFallback = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				const Component = $.derived(() => $$props.component);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => $.get(Component), ($$anchor, Component_1) => {
					Component_1($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var p = root();
				var code = $.sibling($.child(p));
				var text = $.only_child(code, true);

				$.next();
				$.reset(p);
				$.template_effect(() => $.set_text(text, $$props.name));
				$.append($$anchor, p);
			};

			$.if(node, ($$render) => {
				if ($$props.component) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let align = $.prop($$props, 'align', 3, "center"),
		hideCode = $.prop($$props, 'hideCode', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let codeVisible = $.state(false);
	var div = root_3();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn("group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-xl border", $$props.class)
	]);

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_2 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.example);
			$.append($$anchor, fragment_2);
		};

		var alternate_1 = ($$anchor) => {
			ExampleFallback($$anchor);
		};

		$.if(node_2, ($$render) => {
			if ($$props.example) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_2();
			var node_5 = $.child(div_3);

			$.snippet(node_5, () => $$props.children ?? $.noop);

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_1();
					var node_7 = $.sibling($.child(div_4), 2);

					Button(node_7, {
						type: 'button',
						size: 'sm',
						variant: 'outline',
						class: 'relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted dark:bg-background dark:text-foreground dark:hover:bg-muted',
						onclick: () => {
							$.set(codeVisible, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('View Code');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_6, ($$render) => {
					if (!$.get(codeVisible)) $$render(consequent_2);
				});
			}

			$.reset(div_3);
			$.template_effect(() => $.set_attribute(div_3, 'data-code-visible', $.get(codeVisible)));
			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if (!hideCode()) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_attribute(div_2, 'data-align', align()));
	$.append($$anchor, div);
	$.pop();
}