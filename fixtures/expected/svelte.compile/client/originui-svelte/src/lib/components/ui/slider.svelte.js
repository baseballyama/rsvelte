import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';
import { Slider as SliderPrimitive } from 'bits-ui';
import { on } from 'svelte/events';

const thumb = ($$anchor, props = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SliderPrimitive.Thumb, ($$anchor, SliderPrimitive_Thumb) => {
		SliderPrimitive_Thumb($$anchor, $.spread_props(
			{
				class: 'border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-xs outline-hidden transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50'
			},
			props
		));
	});

	$.append($$anchor, fragment);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'orientation',
	'ref',
	'showTooltip',
	'tooltipContent',
	'value'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="bg-secondary relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"><!></span> <!>`, 1);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		ref = $.prop($$props, 'ref', 15, null),
		showTooltip = $.prop($$props, 'showTooltip', 3, false),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let tooltipOpen = $.state(false);

	function handlePointerUp() {
		$.set(tooltipOpen, false);
	}

	function handlePointerDown() {
		$.set(tooltipOpen, true);
	}

	$.user_effect(() => {
		if (showTooltip()) {
			const cleanup = on(document, 'pointerup', handlePointerUp);

			return cleanup;
		}
	});

	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	{
		const children = ($$anchor, $$arg0) => {
			let thumbItems = () => ($$arg0?.()).thumbItems;
			var fragment_2 = root_1();
			var span = $.first_child(fragment_2);
			var node_2 = $.child(span);

			$.component(node_2, () => SliderPrimitive.Range, ($$anchor, SliderPrimitive_Range) => {
				SliderPrimitive_Range($$anchor, {
					get 'data-orientation'() {
						return orientation();
					},
					class: 'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
				});
			});

			$.reset(span);

			var node_3 = $.sibling(span, 2);

			$.each(node_3, 17, thumbItems, (thumbItem) => thumbItem.index, ($$anchor, thumbItem) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					var consequent = ($$anchor) => {
						thumb($$anchor, () => ({ index: $.get(thumbItem).index }));
					};

					var alternate_1 = ($$anchor) => {
						TooltipProvider($$anchor, {
							children: ($$anchor, $$slotProps) => {
								Tooltip($$anchor, {
									get open() {
										return $.get(tooltipOpen);
									},

									set open($$value) {
										$.set(tooltipOpen, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_5 = $.first_child(fragment_7);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												{
													let $0 = $.derived(() => ({
														index: $.get(thumbItem).index,
														...props(),
														onpointerdown: handlePointerDown
													}));

													thumb($$anchor, () => $.get($0));
												}
											};

											TooltipTrigger(node_5, { child, $$slots: { child: true } });
										}

										var node_6 = $.sibling(node_5, 2);

										{
											let $0 = $.derived(() => orientation() === 'vertical' ? 'right' : 'top');

											TooltipContent(node_6, {
												get side() {
													return $.get($0);
												},
												sideOffset: 8,
												class: 'border-input bg-popover text-muted-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-2 py-1 text-xs outline-hidden',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													{
														var consequent_1 = ($$anchor) => {
															var text = $.text();

															$.template_effect(($0) => $.set_text(text, $0), [
																() => $$props.tooltipContent
																	? $$props.tooltipContent(value()[$.get(thumbItem).index])
																	: value()[$.get(thumbItem).index]
															]);

															$.append($$anchor, text);
														};

														var d = $.derived(() => Array.isArray(value()));

														var alternate = ($$anchor) => {
															var text_1 = $.text();

															$.template_effect(($0) => $.set_text(text_1, $0), [
																() => $$props.tooltipContent ? $$props.tooltipContent(value()) : value()
															]);

															$.append($$anchor, text_1);
														};

														$.if(node_7, ($$render) => {
															if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					};

					$.if(node_4, ($$render) => {
						if (!showTooltip()) $$render(consequent); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.template_effect(() => $.set_attribute(span, 'data-orientation', orientation()));
			$.append($$anchor, fragment_2);
		};

		let $0 = $.derived(() => cn('relative flex w-full touch-none items-center select-none disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col', $$props.class));

		$.component(node_1, () => SliderPrimitive.Root, ($$anchor, SliderPrimitive_Root) => {
			SliderPrimitive_Root($$anchor, $.spread_props(
				{
					get orientation() {
						return orientation();
					},

					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}