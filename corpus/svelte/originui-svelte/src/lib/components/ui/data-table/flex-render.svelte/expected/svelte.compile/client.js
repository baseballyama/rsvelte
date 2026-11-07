import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RenderComponentConfig, RenderSnippetConfig } from './render-helpers.js';

export default function Flex_render($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.content));
			$.append($$anchor, text);
		};

		var consequent_3 = ($$anchor) => {
			const result = $.derived(() => $$props.content($$props.context));
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					const computed_const = $.derived(() => {
						const { component: Component, props } = $.get(result);

						return { Component, props };
					});

					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => $.get(computed_const).Component, ($$anchor, Component_1) => {
						Component_1($$anchor, $.spread_props(() => $.get(computed_const).props));
					});

					$.append($$anchor, fragment_3);
				};

				var consequent_2 = ($$anchor) => {
					const computed_const_1 = $.derived(() => {
						return $.get(result);
					});

					var fragment_4 = $.comment();
					var node_3 = $.first_child(fragment_4);

					$.snippet(node_3, () => $.get(computed_const_1).snippet, () => $.get(computed_const_1).params);
					$.append($$anchor, fragment_4);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $.get(result)));
					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(result) instanceof RenderComponentConfig) $$render(consequent_1); else if ($.get(result) instanceof RenderSnippetConfig) $$render(consequent_2, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.content === 'string') $$render(consequent); else if ($$props.content instanceof Function) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}