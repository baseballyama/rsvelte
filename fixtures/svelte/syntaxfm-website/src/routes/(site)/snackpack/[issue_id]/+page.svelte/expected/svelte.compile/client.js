import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { format } from 'date-fns';

var root = $.from_html(`<main><header class="center svelte-1l9dban"><h2 class="h6"> </h2> <p class="text-sm"> <br/> <a href="/snackpack">← Back to all issues</a></p></header> <div class="newsletter-output svelte-1l9dban"><div></div></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let embed = $.state(null);

	$.user_effect(() => {
		if ($.get(embed)) {
			$.get(embed).innerHTML = '';

			const container = document.createElement("shadow-dom-container");
			const shadow = container.attachShadow({ mode: "open" });

			$.get(embed).appendChild(container);

			const wrapper = document.createElement("div");

			wrapper.classList.add('wrapper');
			wrapper.innerHTML = $$props.data.html;
			shadow.appendChild(wrapper);

			$$props.data.styles?.forEach((style) => {
				const style_element = document.createElement('style');

				style_element.innerHTML = style;
				shadow.appendChild(style_element);
			});

			const main_styles = document.createElement('style');

			main_styles.innerHTML = `img {
	max-width: 100%;
}
.ck-inner-section {
	border: 0 !important;
}
table {
	border: 0 !important;
}`;

			shadow.appendChild(main_styles);
		}
	});

	var main = root();
	var header = $.child(main);
	var h2 = $.child(header);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.child(p);

	$.next(3);
	$.reset(p);
	$.reset(header);

	var div = $.sibling(header, 2);
	var div_1 = $.child(div);

	$.bind_this(div_1, ($$value) => $.set(embed, $$value), () => $.get(embed));
	$.reset(div);
	$.reset(main);

	$.template_effect(
		($0) => {
			$.set_text(text, $$props.data.subject);
			$.set_text(text_1, `You are viewing the Newsletter Archive. Published ${$0 ?? ''} `);
		},
		[
			() => format(new Date($$props.data.published_at), 'EEEE MMM dd, yyyy')
		]
	);

	$.append($$anchor, main);
	$.pop();
}