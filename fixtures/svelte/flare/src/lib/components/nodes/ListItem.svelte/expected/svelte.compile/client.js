import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ListItemBase from './shared/ListItemBase.svelte';
import Icon from '../Icon.svelte';
import { colorLikeToColor } from '$lib/props/color';
import { mode } from 'mode-watcher';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'props', 'selected']);
var root = $.from_html(`<span class="rounded px-1.5 py-0.5 text-xs font-medium"> </span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<div class="text-muted-foreground flex items-center gap-1 text-sm"><!> <!></div>`);

export default function ListItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	function formatRelative(date) {
		const now = new Date();
		const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
		const diffMinutes = Math.round(diffSeconds / 60);
		const diffHours = Math.round(diffMinutes / 60);
		const diffDays = Math.round(diffHours / 24);
		const diffWeeks = Math.round(diffDays / 7);
		const diffMonths = Math.round(diffDays / 30.44);
		const diffYears = Math.round(diffDays / 365.25);

		if (diffSeconds < 60) return 'now';
		if (diffMinutes < 60) return `${diffMinutes}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		if (diffWeeks < 5) return `${diffWeeks}w`;
		if (diffMonths < 12) return `${diffMonths}mo`;

		return `${diffYears}y`;
	}

	{
		const accessories = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => $$props.props.accessories ?? [], $.index, ($$anchor, accessory) => {
						const tagContent = $.derived(() => $.get(accessory).tag ?? $.get(accessory).date);
						const textContent = $.derived(() => $.get(accessory).text);
						var div = root_2();
						var node_2 = $.child(div);

						{
							var consequent = ($$anchor) => {
								Icon($$anchor, {
									get icon() {
										return $.get(accessory).icon;
									},
									class: 'size-3.5'
								});
							};

							$.if(node_2, ($$render) => {
								if ($.get(accessory).icon) $$render(consequent);
							});
						}

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								const tagValue = $.derived(() => typeof $.get(tagContent) === 'object' && $.get(tagContent) !== null && 'value' in $.get(tagContent) ? $.get(tagContent).value : $.get(tagContent));
								const tagColorProp = $.derived(() => typeof $.get(tagContent) === 'object' && $.get(tagContent) !== null && 'color' in $.get(tagContent) ? $.get(tagContent).color : undefined);
								const tagText = $.derived(() => $.get(tagValue) instanceof Date ? formatRelative($.get(tagValue)) : $.get(tagValue));

								const color = $.derived(() => $.get(tagColorProp)
									? colorLikeToColor($.get(tagColorProp), mode.current === 'dark')
									: 'var(--color-muted-foreground)');

								var span = root();
								let styles;
								var text = $.only_child(span, true);

								$.template_effect(() => {
									styles = $.set_style(span, '', styles, {
										color: $.get(color),
										'background-color': $.get(tagColorProp)
											? `color-mix(in srgb, ${$.get(color)} 15%, transparent)`
											: 'transparent'
									});

									$.set_text(text, $.get(tagText));
								});

								$.append($$anchor, span);
							};

							var consequent_2 = ($$anchor) => {
								const textValue = $.derived(() => typeof $.get(textContent) === 'object' ? $.get(textContent).value : $.get(textContent));

								const textColor = $.derived(() => typeof $.get(textContent) === 'object' && $.get(textContent).color
									? colorLikeToColor($.get(textContent).color, mode.current === 'dark')
									: undefined);

								var span_1 = root_1();
								let styles_1;
								var text_1 = $.only_child(span_1, true);

								$.template_effect(() => {
									styles_1 = $.set_style(span_1, '', styles_1, { color: $.get(textColor) });
									$.set_text(text_1, $.get(textValue));
								});

								$.append($$anchor, span_1);
							};

							$.if(node_3, ($$render) => {
								if ($.get(tagContent)) $$render(consequent_1); else if ($.get(textContent)) $$render(consequent_2, 1);
							});
						}

						$.reset(div);
						$.template_effect(() => $.set_attribute(div, 'title', $.get(accessory).tooltip ?? undefined));
						$.append($$anchor, div);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if ($$props.props.accessories && $$props.props.accessories.length > 0) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_1);
		};

		ListItemBase($$anchor, {
			get title() {
				return $$props.props.title;
			},

			get icon() {
				return $$props.props.icon;
			},

			get isSelected() {
				return $$props.selected;
			},

			get onclick() {
				return $$props.onclick;
			},
			accessories,
			$$slots: { accessories: true }
		});
	}

	$.pop();
}