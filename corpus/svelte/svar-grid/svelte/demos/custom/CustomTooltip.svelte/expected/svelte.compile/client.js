import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<div class="data svelte-1mtuc6h"><div class="line svelte-1mtuc6h"><b>Name:</b> </div> <div class="line svelte-1mtuc6h"><b>City:</b> </div> <div class="line svelte-1mtuc6h"><b>Email:</b> </div> <div class="line svelte-1mtuc6h"><b>Address:</b> </div> <div class="line stars svelte-1mtuc6h"><!> </div> <div class="line svelte-1mtuc6h"><b>Followers:</b> </div></div>`);

export default function CustomTooltip($$anchor, $$props) {
	$.push($$props, true);

	const stars = $.derived(() => {
		const res = [];
		const max = 5;
		const n = Math.round($$props.data.row.stars / 10000 * max);

		for (let i = 0; i < max; i++) {
			if (i < n) res.push({ filled: true }); else res.push({});
		}

		return res;
	});

	var div = root_1();
	var div_1 = $.child(div);
	var text = $.sibling($.child(div_1));

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text_1 = $.sibling($.child(div_2));

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var text_2 = $.sibling($.child(div_3));

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var text_3 = $.sibling($.child(div_4));

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node = $.child(div_5);

	$.each(node, 17, () => $.get(stars), $.index, ($$anchor, star) => {
		var i_1 = root();
		let classes;

		$.template_effect(() => classes = $.set_class(i_1, 1, 'wxi-cat svelte-1mtuc6h', null, classes, { filled: $.get(star).filled }));
		$.append($$anchor, i_1);
	});

	var text_4 = $.sibling(node);

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var text_5 = $.sibling($.child(div_6));

	$.reset(div_6);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ` ${$$props.data.row.firstName ?? ''}
		${$$props.data.row.lastName ?? ''}`);

		$.set_text(text_1, ` ${($$props.data.row.city || "Unknown") ?? ''}`);
		$.set_text(text_2, ` ${$$props.data.row.email ?? ''}`);
		$.set_text(text_3, ` ${$$props.data.row.street ?? ''}, ${$$props.data.row.zipCode ?? ''}`);
		$.set_text(text_4, ` (${$$props.data.row.stars ?? ''})`);
		$.set_text(text_5, ` ${$$props.data.row.followers ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}