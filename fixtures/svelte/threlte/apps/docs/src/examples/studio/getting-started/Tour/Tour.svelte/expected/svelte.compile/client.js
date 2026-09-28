import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import Portal from 'svelte-portal';
import { TourManager } from './Tour/TourManager.svelte';

var root = $.from_html(`<div class="pointer-events-auto rounded-md bg-white px-3 py-2 text-black shadow-2xl"><!></div> <div class="absolute h-2 w-2 rotate-45 bg-white"></div>`, 1);
var root_1 = $.from_html(`<div class="pointer-events-none absolute top-0 left-0 z-10000 w-max max-w-96 select-none"><!></div>`);
var root_2 = $.from_html(`<div class="pointer-events-auto max-w-[60%] rounded-md bg-white px-3 py-2 text-black"><!></div>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<button>Skip Tour →</button>`);
var root_5 = $.from_html(`<button>Start Tour</button>`);
var root_6 = $.from_html(`<div class="contents"><div class="absolute top-0 left-0 z-10000 h-full w-full"><svg class="pointer-events-none" width="100%" height="100%" style="opacity: 0;"><mask id="myMask"><rect x="0" y="0" width="100%" height="100%" fill="white"></rect><rect x="0" y="0" rx="999" ry="999" width="100" height="100" fill="black"></rect></mask><rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#myMask)"></rect><rect x="0" y="0" rx="999" ry="999" width="100" height="100" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2px" fill="transparent"></rect></svg></div> <!> <div class="pointer-events-auto absolute right-4 bottom-4 z-10001 rounded-md bg-white px-1 py-0.5 text-sm text-neutral-600"><!></div></div>`);

export default function Tour($$anchor, $$props) {
	$.push($$props, true);

	const tourManager = new TourManager();

	onMount(async () => {
		await tick();
		tourManager.startTour();
	});

	const instructionsPlacement = $.derived(() => tourManager.instructionsManager.currentInstructions?.style?.subtitle?.placement);

	$.event(
		'pointermove',
		$.window,
		function (...$$args) {
			tourManager.tourStopMaskManager.onPointerMove?.apply(this, $$args);
		},
		true
	);

	Portal($$anchor, {
		target: '#tour-target',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var div_1 = $.child(div);
			var svg = $.child(div_1);
			var mask = $.child(svg);
			var rect = $.sibling($.child(mask));

			$.bind_this(rect, ($$value) => tourManager.tourStopMaskManager.maskRect = $$value, () => tourManager?.tourStopMaskManager?.maskRect);
			$.reset(mask);

			var rect_1 = $.sibling(mask);

			$.bind_this(rect_1, ($$value) => tourManager.tourStopMaskManager.darkenerRect = $$value, () => tourManager?.tourStopMaskManager?.darkenerRect);

			var rect_2 = $.sibling(rect_1);

			$.bind_this(rect_2, ($$value) => tourManager.tourStopMaskManager.highlightRect = $$value, () => tourManager?.tourStopMaskManager?.highlightRect);
			$.bind_this(rect_2, ($$value) => tourManager.instructionsManager.referenceElement = $$value, () => tourManager?.instructionsManager?.referenceElement);
			$.reset(svg);
			$.bind_this(svg, ($$value) => tourManager.tourStopMaskManager.svg = $$value, () => tourManager?.tourStopMaskManager?.svg);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => tourManager.tourStopMaskManager.wrapperRef = $$value, () => tourManager?.tourStopMaskManager?.wrapperRef);

			var node = $.sibling(div_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root_1();
					var node_1 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var fragment_1 = root();
							var div_3 = $.first_child(fragment_1);
							var node_2 = $.child(div_3);

							$.component(node_2, () => tourManager.instructionsManager.currentInstructions.content.component, (
								$$anchor,
								tourManager_instructionsManager_currentInstructions_content_component
							) => {
								tourManager_instructionsManager_currentInstructions_content_component($$anchor, $.spread_props(() => tourManager.instructionsManager.currentInstructions.content.props));
							});

							$.reset(div_3);
							$.bind_this(div_3, ($$value) => tourManager.instructionsManager.wrapper = $$value, () => tourManager?.instructionsManager?.wrapper);

							var div_4 = $.sibling(div_3, 2);

							$.bind_this(div_4, ($$value) => tourManager.instructionsManager.tooltipArrowElement = $$value, () => tourManager?.instructionsManager?.tooltipArrowElement);
							$.append($$anchor, fragment_1);
						};

						$.if(node_1, ($$render) => {
							if (tourManager.instructionsManager.currentInstructions) $$render(consequent);
						});
					}

					$.reset(div_2);
					$.bind_this(div_2, ($$value) => tourManager.instructionsManager.tooltipElement = $$value, () => tourManager?.instructionsManager?.tooltipElement);
					$.append($$anchor, div_2);
				};

				var alternate = ($$anchor) => {
					var div_5 = root_3();
					var node_3 = $.child(div_5);

					{
						var consequent_2 = ($$anchor) => {
							var div_6 = root_2();
							var node_4 = $.child(div_6);

							$.component(node_4, () => tourManager.instructionsManager.currentInstructions.content.component, (
								$$anchor,
								tourManager_instructionsManager_currentInstructions_content_component_1
							) => {
								tourManager_instructionsManager_currentInstructions_content_component_1($$anchor, $.spread_props(() => tourManager.instructionsManager.currentInstructions.content.props));
							});

							$.reset(div_6);
							$.bind_this(div_6, ($$value) => tourManager.instructionsManager.wrapper = $$value, () => tourManager?.instructionsManager?.wrapper);
							$.append($$anchor, div_6);
						};

						$.if(node_3, ($$render) => {
							if (tourManager.instructionsManager.currentInstructions) $$render(consequent_2);
						});
					}

					$.reset(div_5);

					$.template_effect(() => $.set_class(div_5, 1, $.clsx([
						'pointer-events-none absolute z-10000 flex w-full items-center justify-center select-none',
						$.get(instructionsPlacement) === 'bottom' || !$.get(instructionsPlacement) ? 'bottom-2' : 'top-1/2 -translate-y-1/2'
					])));

					$.append($$anchor, div_5);
				};

				$.if(node, ($$render) => {
					if (tourManager.instructionsManager.isToolTip) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var div_7 = $.sibling(node, 2);
			var node_5 = $.child(div_7);

			{
				var consequent_3 = ($$anchor) => {
					var button = root_4();

					$.event(
						'click',
						button,
						(e) => {
							e.stopPropagation();
							tourManager.stopTour();
						},
						true
					);

					$.append($$anchor, button);
				};

				var alternate_1 = ($$anchor) => {
					var button_1 = root_5();

					$.event('click', button_1, () => location.reload(), true);
					$.append($$anchor, button_1);
				};

				$.if(node_5, ($$render) => {
					if (tourManager.tourStarted) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_7);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}