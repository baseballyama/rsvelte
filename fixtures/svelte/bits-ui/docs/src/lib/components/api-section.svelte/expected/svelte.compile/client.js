import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import CSSVarsTable from "$lib/components/api-ref/css-vars/css-vars-table.svelte";
import DataAttrsTable from "$lib/components/api-ref/data-attrs/data-attrs-table.svelte";
import PropsTable from "$lib/components/api-ref/props/props-table.svelte";
import { h2 as H2, p as P } from "$lib/components/markdown/index.js";
import { parseMarkdown } from "$lib/utils/index.js";

var root = $.from_html(`<span class="text-foreground/80 font-normal dark:text-neutral-900/80"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><div class="rounded-button bg-accent inline-flex h-[29px] items-center justify-center px-3 font-mono text-[17px] font-medium leading-tight tracking-tight dark:text-neutral-900"><h3 class="scroll-m-20 font-semibold"><!> </h3></div> <!> <div class="flex flex-col gap-4"><!> <!></div></div>`);
var root_3 = $.from_html(`<!> <div class="flex flex-col gap-12 pt-8"></div>`, 1);

export default function Api_section($$anchor, $$props) {
	$.push($$props, true);

	let schemas = $.prop($$props, 'schemas', 19, () => []);
	var fragment = root_3();
	var node = $.first_child(fragment);

	H2(node, {
		id: 'api-reference',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('API Reference');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);

	$.each(div, 21, schemas, (schema) => schema.title, ($$anchor, schema) => {
		var div_1 = root_2();
		var div_2 = $.child(div_1);
		var h3 = $.child(div_2);
		var node_1 = $.child(h3);

		{
			var consequent = ($$anchor) => {
				var span = root();
				var text_1 = $.only_child(span);

				$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''}.`), [() => page.data.metadata.title.replaceAll(" ", "")]);
				$.append($$anchor, span);
			};

			$.if(node_1, ($$render) => {
				if ($.get(schema).type !== "utility") $$render(consequent);
			});
		}

		var text_2 = $.sibling(node_1, 1, true);

		$.reset(h3);
		$.reset(div_2);

		var node_2 = $.sibling(div_2, 2);

		P(node_2, {
			class: 'mt-2! mb-5!',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.html(node_3, () => parseMarkdown($.get(schema).description));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		var div_3 = $.sibling(node_2, 2);
		var node_4 = $.child(div_3);

		{
			var consequent_1 = ($$anchor) => {
				PropsTable($$anchor, {
					get props() {
						return $.get(schema).props;
					}
				});
			};

			$.if(node_4, ($$render) => {
				if ($.get(schema).props) $$render(consequent_1);
			});
		}

		var node_5 = $.sibling(node_4, 2);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_3 = root_1();
				var node_6 = $.first_child(fragment_3);

				DataAttrsTable(node_6, {
					get dataAttrs() {
						return $.get(schema).dataAttributes;
					}
				});

				var node_7 = $.sibling(node_6, 2);

				CSSVarsTable(node_7, {
					get cssVars() {
						return $.get(schema).cssVars;
					}
				});

				$.append($$anchor, fragment_3);
			};

			$.if(node_5, ($$render) => {
				if ($.get(schema).type === "component") $$render(consequent_2);
			});
		}

		$.reset(div_3);
		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_attribute(h3, 'id', $0);
				$.set_text(text_2, $.get(schema).title);
			},
			[() => $.get(schema).title.toLowerCase()]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}