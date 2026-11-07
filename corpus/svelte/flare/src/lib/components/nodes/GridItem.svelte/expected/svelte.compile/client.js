import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import Icon from '../Icon.svelte';
import { mode } from 'mode-watcher';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'props',
	'selected',
	'inset',
	'fit',
	'aspectRatio'
]);

var root = $.from_html(`<div class="h-full w-full"></div>`);
var root_1 = $.from_html(`<span class="truncate text-sm font-medium"> </span>`);
var root_2 = $.from_html(`<span class="text-muted-foreground truncate text-xs"> </span>`);
var root_3 = $.from_html(`<span class="truncate"> </span>`);
var root_4 = $.from_html(`<div class="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs"><!> <!></div>`);
var root_5 = $.from_html(`<button><div><!></div> <!> <!> <!></button>`);

export default function GridItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	const paddingClass = $.derived(() => {
		switch ($$props.inset) {
			case 'small':
				return 'p-1.5';

			case 'medium':
				return 'p-2.5';

			case 'large':
				return 'p-4';

			default:
				return 'p-1';
		}
	});

	const content = $.derived(() => typeof $$props.props.content === 'object' && 'value' in $$props.props.content ? $$props.props.content.value : $$props.props.content);
	const tooltip = $.derived(() => typeof $$props.props.content === 'object' && 'tooltip' in $$props.props.content ? $$props.props.content.tooltip : undefined);
	var button = root_5();

	$.attribute_effect(button, ($0) => ({ type: 'button', class: $0, ...restProps }), [
		() => cn('flex w-full flex-col text-left focus:outline-none', $.get(paddingClass))
	]);

	var div = $.child(button);
	let classes;
	let styles;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			const color = $.derived(() => typeof $.get(content).color === 'object'
				? mode.current === 'dark'
					? $.get(content).color.dark
					: $.get(content).color.light
				: $.get(content).color);

			var div_1 = root();
			let styles_1;

			$.template_effect(() => styles_1 = $.set_style(div_1, '', styles_1, { 'background-color': $.get(color) }));
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.fit === 'contain' ? 'object-contain' : 'object-fill');

				Icon($$anchor, {
					get icon() {
						return $.get(content);
					},

					get class() {
						return `size-full ${$.get($0) ?? ''}`;
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if (typeof $.get(content) === 'object' && 'color' in $.get(content)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root_1();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.props.title));
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($$props.props.title) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_1 = root_2();
			var text_1 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_1, $$props.props.subtitle));
			$.append($$anchor, span_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.props.subtitle) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root_4();
			var node_4 = $.child(div_2);

			{
				var consequent_3 = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $$props.props.accessory.icon;
						},
						class: 'size-3'
					});
				};

				$.if(node_4, ($$render) => {
					if ($$props.props.accessory.icon) $$render(consequent_3);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var span_2 = root_3();
					var text_2 = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text_2, $$props.props.accessory.text));
					$.append($$anchor, span_2);
				};

				$.if(node_5, ($$render) => {
					if ($$props.props.accessory.text) $$render(consequent_4);
				});
			}

			$.reset(div_2);
			$.template_effect(() => $.set_attribute(div_2, 'title', $$props.props.accessory.tooltip));
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.props.accessory) $$render(consequent_5);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `hover:border-foreground/50 bg-muted mb-1 w-full overflow-hidden rounded-md border-2 ${$$props.selected ? 'border-foreground' : 'border-transparent'}`, null, classes, { 'border-transparent': !$$props.selected });
		$.set_attribute(div, 'title', $.get(tooltip));
		styles = $.set_style(div, '', styles, { 'aspect-ratio': $$props.aspectRatio ?? '1' });
	});

	$.append($$anchor, button);
	$.pop();
}