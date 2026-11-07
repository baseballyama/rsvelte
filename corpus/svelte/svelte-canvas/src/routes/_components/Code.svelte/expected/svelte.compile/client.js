import 'svelte/internal/disclose-version';
import { createHighlighter } from 'shiki';
import * as $ from 'svelte/internal/client';

const { codeToHtml } = await createHighlighter({ themes: ['one-dark-pro'], langs: ['typescript', 'svelte'] });
var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<div class="hljs title svelte-1mat97j"></div>`);
var root_2 = $.from_html(`<button class="copy svelte-1mat97j" aria-label="Copy to clipboard"><svg viewBox="0 0 32 32"><path d="m17.709 1.9941c-0.51479-8.807e-4 -1.0805 0.0058594-1.709 0.0058594h-4c-1.4978 0-2.6354-0.002642-3.5762 0.10352s-1.7668 0.33644-2.377 0.94727c-0.61012 0.61083-0.83978 1.4368-0.94531 2.377s-0.10156 2.0765-0.10156 3.5723v10a1.0001 1.0001 0 0 0 0 0.009766 1.0001 1.0001 0 0 0 0 0.011718c0 2.5474-0.1083 4.0675 0.58984 5.3379 0.34907 0.63518 0.97662 1.101 1.666 1.3242 0.53202 0.17225 1.1381 0.23738 1.8125 0.27734 0.013242 0.19927 0.01449 0.4321 0.035156 0.61523 0.10616 0.94072 0.33644 1.7668 0.94727 2.377 0.61083 0.61012 1.4368 0.83978 2.377 0.94531 0.94019 0.10553 2.0765 0.10156 3.5723 0.10156h4c1.4978 0 2.6354 0.0026 3.5762-0.10352 0.94072-0.10616 1.7668-0.33644 2.377-0.94726s0.83978-1.4368 0.94531-2.377c0.10553-0.94019 0.10156-2.0765 0.10156-3.5723v-10c0-1.4978 0.0026-2.6354-0.10352-3.5762-0.10616-0.94072-0.33644-1.7668-0.94726-2.377s-1.4368-0.83978-2.377-0.94531c-0.18849-0.021156-0.42724-0.021887-0.63281-0.035156-0.04161-0.70746-0.11126-1.3341-0.30273-1.8867-0.23402-0.67543-0.71468-1.2822-1.3477-1.6152-0.94946-0.49955-2.0357-0.56767-3.5801-0.57031zm-5.709 2.0059h4c2.513 0 3.9261 0.10706 4.3574 0.33398 0.21565 0.11346 0.27566 0.17381 0.38867 0.5 0.081847 0.23623 0.13914 0.65988 0.18164 1.1719-0.3111-9.989e-4 -0.57979-0.0058594-0.92773-0.0058594h-4c-1.4978 0-2.6354-0.002642-3.5762 0.10352s-1.7668 0.33644-2.377 0.94727c-0.61012 0.61083-0.83978 1.4368-0.94531 2.377-0.10553 0.94019-0.10156 2.0765-0.10156 3.5723v10c0 0.35612 0.0046599 0.63162 0.0058594 0.94922-0.48679-0.039688-0.89531-0.091073-1.1328-0.16797-0.34888-0.11296-0.41474-0.17827-0.5293-0.38672-0.22911-0.41689-0.34375-1.8274-0.34375-4.373a1.0001 1.0001 0 0 0 0 -0.009765 1.0001 1.0001 0 0 0 0 -0.011719v-10c0-1.4952 0.0061497-2.604 0.089844-3.3496 0.08369-0.74562 0.22984-1.0461 0.37109-1.1875 0.14126-0.14142 0.44176-0.28889 1.1875-0.37305 0.74574-0.084155 1.8548-0.089844 3.3516-0.089844zm4 4h4c1.4952 0 2.604 0.0061497 3.3496 0.089844 0.74562 0.08369 1.0461 0.22984 1.1875 0.37109 0.14142 0.14126 0.28889 0.44176 0.37305 1.1875 0.084155 0.74575 0.089844 1.8548 0.089844 3.3516v10c0 1.4952-0.006204 2.604-0.089844 3.3496-0.08369 0.74562-0.22984 1.0461-0.37109 1.1875-0.14126 0.14142-0.44175 0.28889-1.1875 0.37305-0.74575 0.084155-1.8548 0.089844-3.3516 0.089844h-4c-1.4952 0-2.604-0.006204-3.3496-0.089844-0.74562-0.08369-1.0461-0.22984-1.1875-0.37109-0.14142-0.14126-0.28889-0.44175-0.37305-1.1875-0.084155-0.74575-0.089844-1.8548-0.089844-3.3516v-10c0-1.4952 0.006204-2.604 0.089844-3.3496 0.08369-0.74562 0.22984-1.0461 0.37109-1.1875 0.14126-0.14142 0.44175-0.28889 1.1875-0.37305 0.74575-0.084155 1.8548-0.089844 3.3516-0.089844z" class="svelte-1mat97j"></path></svg></button>`);
var root_3 = $.from_html(`<div class="code svelte-1mat97j"><!> <div class="inner svelte-1mat97j"><!> <!></div></div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	let files = $.prop($$props, 'files', 19, () => []),
		text = $.prop($$props, 'text', 3, ''),
		lang = $.prop($$props, 'lang', 3, 'svelte'),
		copy = $.prop($$props, 'copy', 3, false);

	let selectedFile = $.state(0);
	let code = $.derived(() => files().length ? files()[$.get(selectedFile)][1] : text().trim());
	let html = $.derived(() => codeToHtml($.get(code), { lang: lang(), theme: 'one-dark-pro' }));
	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();

			$.each(div_1, 21, files, $.index, ($$anchor, $$item, i) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 1));
				let title = () => $.get($$array)[0];
				var button = root();
				let classes;
				var text_1 = $.only_child(button, true);

				$.template_effect(() => {
					classes = $.set_class(button, 1, 'tab svelte-1mat97j', null, classes, { active: $.get(selectedFile) === i });
					$.set_text(text_1, title());
				});

				$.delegated('click', button, () => $.set(selectedFile, i, true));
				$.append($$anchor, button);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (files()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var button_1 = root_2();

			$.delegated('click', button_1, () => navigator.clipboard.writeText($.get(code)));
			$.append($$anchor, button_1);
		};

		$.if(node_1, ($$render) => {
			if (copy()) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.html(node_2, () => $.get(html));
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);