import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useMutationObserver } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div>No mutations yet</div>`);
var root_2 = $.from_html(`<div></div>`);

export default function Use_mutation_observer($$anchor, $$props) {
	$.push($$props, true);

	let el = $.state(null);
	const messages = $.proxy([]);
	let className = $.state("");
	let style = $.state("");

	useMutationObserver(
		() => $.get(el),
		(mutations) => {
			const mutation = mutations[0];

			if (!mutation) return;

			messages.push(mutation.attributeName);
		},
		{ attributes: true }
	);

	setTimeout(
		() => {
			$.set(className, "text-brand");
		},
		1000
	);

	setTimeout(
		() => {
			$.set(style, "font-style: italic;");
		},
		1500
	);

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.each(
				div,
				23,
				() => messages,
				(text, i) => `${text}-${i}`,
				($$anchor, text) => {
					var div_1 = root();
					var text_1 = $.only_child(div_1);

					$.template_effect(() => $.set_text(text_1, `Mutation Attribute: ${$.get(text) ?? ''}`));
					$.append($$anchor, div_1);
				},
				($$anchor) => {
					var div_2 = root_1();

					$.append($$anchor, div_2);
				}
			);

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(el, $$value), () => $.get(el));

			$.template_effect(() => {
				$.set_class(div, 1, $.clsx($.get(className)));
				$.set_style(div, $.get(style));
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}