import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from "./avatar.svelte";
import { overflowBase, sizeStyle, fontSizeStyle } from "./styles.js";
import { resolveOverlapPx } from "./utils.js";

var root = $.from_html(`<div class="relative"><!></div>`);
var root_1 = $.from_html(`<div class="relative"><div> </div></div>`);
var root_2 = $.from_html(`<div><!> <!></div>`);

export default function Avatar_group($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 32),
		limit = $.prop($$props, 'limit', 3, 0),
		reverse = $.prop($$props, 'reverse', 3, false),
		overlap = $.prop($$props, 'overlap', 3, "auto");

	let visible = $.derived(() => limit() > 0 ? $$props.members.slice(0, limit()) : $$props.members);
	let overflow = $.derived(() => limit() > 0 && $$props.members.length > limit() ? $$props.members.length - limit() : 0);
	let overlapPx = $.derived(() => resolveOverlapPx(size(), overlap()));
	let spacing = $.derived(() => `margin-left: -${$.get(overlapPx)}px;`);
	var div = root_2();
	var node = $.child(div);

	$.each(node, 19, () => $.get(visible), (member, index) => member.username ?? member.src ?? member.letter ?? index, ($$anchor, member, index) => {
		var div_1 = root();
		let styles;
		var node_1 = $.child(div_1);

		Avatar(node_1, {
			get size() {
				return size();
			},

			get src() {
				return $.get(member).src;
			},

			get username() {
				return $.get(member).username;
			},

			get letter() {
				return $.get(member).letter;
			},

			get title() {
				return $.get(member).title;
			},
			class: 'ring-kui-light-bg dark:ring-kui-dark-bg ring-1'
		});

		$.reset(div_1);

		$.template_effect(() => styles = $.set_style(div_1, $.get(index) > 0 ? $.get(spacing) : undefined, styles, {
			'z-index': reverse()
				? $.get(index) + 1
				: $.get(visible).length - $.get(index)
		}));

		$.append($$anchor, div_1);
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();
			let styles_1;
			var div_3 = $.child(div_2);
			var text = $.only_child(div_3);

			$.reset(div_2);

			$.template_effect(
				($0, $1) => {
					styles_1 = $.set_style(div_2, $.get(visible).length > 0 ? $.get(spacing) : undefined, styles_1, { 'z-index': reverse() ? $.get(visible).length + 1 : 0 });
					$.set_class(div_3, 1, $.clsx(overflowBase));
					$.set_style(div_3, `${$0 ?? ''}${$1 ?? ''}`);
					$.set_attribute(div_3, 'aria-label', `${$.get(overflow) ?? ''} more members`);
					$.set_text(text, `+${$.get(overflow) ?? ''}`);
				},
				[() => sizeStyle(size()), () => fontSizeStyle(size())]
			);

			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(overflow) > 0) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `flex ${$$props.class ?? ''}`);
		$.set_attribute(div, 'aria-label', `${$$props.members.length ?? ''} members`);
	});

	$.append($$anchor, div);
	$.pop();
}