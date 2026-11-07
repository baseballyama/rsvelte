import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_svg(`<svg class="h-4 w-4 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
var root_1 = $.from_html(`<div class="h-3 w-3 rounded-full bg-[#120F17]"></div>`);
var root_2 = $.from_html(`<span class="text-sm"> </span>`);
var root_3 = $.from_html(`<div class="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-neutral-600"><div class="absolute left-0 top-0 h-full transition-[width,background-color] duration-[400ms]"></div></div>`);
var root_4 = $.from_html(`<div role="button" tabindex="0"><div class="flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-[background-color,color] duration-300"><!></div></div> <!>`, 1);
var root_5 = $.from_html(`<div><div class="px-8"><!></div></div>`);
var root_6 = $.from_html(`<button> </button>`);
var root_7 = $.from_html(`<div><div><!> <button class="next-button duration-350 flex items-center justify-center rounded-full py-1.5 px-3.5 font-medium tracking-tight transition svelte-15qsqvs"> </button></div></div>`);
var root_8 = $.from_html(`<div class="flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1]"><div style="border:1px solid #222;"><div></div> <div><!></div> <!></div></div>`);

export default function Stepper($$anchor, $$props) {
	$.push($$props, true);

	let initialStep = $.prop($$props, 'initialStep', 3, 1),
		stepCircleContainerClass = $.prop($$props, 'stepCircleContainerClass', 3, ''),
		stepContainerClass = $.prop($$props, 'stepContainerClass', 3, ''),
		contentClass = $.prop($$props, 'contentClass', 3, ''),
		footerClass = $.prop($$props, 'footerClass', 3, ''),
		backButtonText = $.prop($$props, 'backButtonText', 3, 'Back'),
		nextButtonText = $.prop($$props, 'nextButtonText', 3, 'Continue'),
		disableStepIndicators = $.prop($$props, 'disableStepIndicators', 3, false),
		accentColor = $.prop($$props, 'accentColor', 3, '#FF8A4C');

	let currentStep = $.state($.proxy(initialStep()));
	let direction = $.state(0);
	let parentHeight = $.state(0);
	let measureRef = $.state(null);
	const totalSteps = $.derived(() => $$props.steps.length);
	const isCompleted = $.derived(() => $.get(currentStep) > $.get(totalSteps));
	const isLastStep = $.derived(() => $.get(currentStep) === $.get(totalSteps));

	function updateStep(n) {
		$.set(currentStep, n, true);

		if (n > $.get(totalSteps)) $$props.onFinalStepCompleted?.(); else $$props.onStepChange?.(n);
	}

	function back() {
		if ($.get(currentStep) > 1) {
			$.set(direction, -1);
			updateStep($.get(currentStep) - 1);
		}
	}

	function next() {
		if (!$.get(isLastStep)) {
			$.set(direction, 1);
			updateStep($.get(currentStep) + 1);
		}
	}

	function complete() {
		$.set(direction, 1);
		updateStep($.get(totalSteps) + 1);
	}

	function goTo(n) {
		if (disableStepIndicators()) return;
		if (n === $.get(currentStep)) return;

		$.set(direction, n > $.get(currentStep) ? 1 : -1, true);
		updateStep(n);
	}

	$.user_effect(() => {
		void $.get(currentStep);

		(async () => {
			await tick();

			if ($.get(measureRef)) $.set(parentHeight, $.get(measureRef).offsetHeight, true);
		})();
	});

	var div = root_8();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $$props.steps, $.index, ($$anchor, _, i) => {
		const stepNumber = $.derived(() => i + 1);

		const status = $.derived(() => $.get(currentStep) === $.get(stepNumber)
			? 'active'
			: $.get(currentStep) < $.get(stepNumber) ? 'inactive' : 'complete');

		var fragment = root_4();
		var div_3 = $.first_child(fragment);
		var div_4 = $.child(div_3);
		var node = $.child(div_4);

		{
			var consequent = ($$anchor) => {
				var svg = root();

				$.append($$anchor, svg);
			};

			var consequent_1 = ($$anchor) => {
				var div_5 = root_1();

				$.append($$anchor, div_5);
			};

			var alternate = ($$anchor) => {
				var span = root_2();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(stepNumber)));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if ($.get(status) === 'complete') $$render(consequent); else if ($.get(status) === 'active') $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		$.reset(div_4);
		$.reset(div_3);

		var node_1 = $.sibling(div_3, 2);

		{
			var consequent_2 = ($$anchor) => {
				var div_6 = root_3();
				var div_7 = $.only_child(div_6);

				$.template_effect(() => $.set_style(div_7, $.get(currentStep) > $.get(stepNumber)
					? `width:100%;background-color:${accentColor()};`
					: 'width:0;background-color:transparent;'));

				$.append($$anchor, div_6);
			};

			$.if(node_1, ($$render) => {
				if (i < $$props.steps.length - 1) $$render(consequent_2);
			});
		}

		$.template_effect(() => {
			$.set_class(div_3, 1, `relative outline-none focus:outline-none ${disableStepIndicators() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`, 'svelte-15qsqvs');

			$.set_style(div_4, $.get(status) === 'inactive'
				? 'background:#222;color:#a3a3a3;'
				: `background:${accentColor()};color:${accentColor()};`);
		});

		$.delegated('click', div_3, () => goTo($.get(stepNumber)));
		$.delegated('keydown', div_3, (e) => (e.key === 'Enter' || e.key === ' ') && goTo($.get(stepNumber)));
		$.append($$anchor, fragment);
	});

	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var node_2 = $.child(div_8);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.key(node_3, () => $.get(currentStep), ($$anchor) => {
				var div_9 = root_5();
				var div_10 = $.child(div_9);
				var node_4 = $.child(div_10);

				$.snippet(node_4, () => $$props.steps[$.get(currentStep) - 1] ?? $.noop);
				$.reset(div_10);
				$.reset(div_9);
				$.bind_this(div_9, ($$value) => $.set(measureRef, $$value), () => $.get(measureRef));
				$.template_effect(() => $.set_style(div_9, `position:absolute;left:0;right:0;top:0;animation:stepper-enter 0.4s cubic-bezier(0.4,0,0.2,1) forwards;--enter-x:${$.get(direction) >= 0 ? '-100%' : '100%'};`));
				$.append($$anchor, div_9);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(isCompleted)) $$render(consequent_3);
		});
	}

	$.reset(div_8);

	var node_5 = $.sibling(div_8, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_11 = root_7();
			var div_12 = $.child(div_11);
			var node_6 = $.child(div_12);

			{
				var consequent_4 = ($$anchor) => {
					var button = root_6();
					var text_1 = $.only_child(button, true);

					$.template_effect(() => {
						$.set_class(
							button,
							1,
							`duration-350 rounded px-2 py-1 transition ${$.get(currentStep) === 1
								? 'pointer-events-none opacity-50 text-neutral-400'
								: 'text-neutral-400 hover:text-neutral-700'}`,
							'svelte-15qsqvs'
						);

						$.set_text(text_1, backButtonText());
					});

					$.delegated('click', button, back);
					$.append($$anchor, button);
				};

				$.if(node_6, ($$render) => {
					if ($.get(currentStep) !== 1) $$render(consequent_4);
				});
			}

			var button_1 = $.sibling(node_6, 2);
			var text_2 = $.only_child(button_1, true);

			$.reset(div_12);
			$.reset(div_11);

			$.template_effect(() => {
				$.set_class(div_11, 1, `px-8 pb-8 ${footerClass()}`, 'svelte-15qsqvs');
				$.set_class(div_12, 1, `mt-10 flex ${$.get(currentStep) !== 1 ? 'justify-between' : 'justify-end'}`, 'svelte-15qsqvs');
				$.set_text(text_2, $.get(isLastStep) ? 'Complete' : nextButtonText());
			});

			$.delegated('click', button_1, function (...$$args) {
				($.get(isLastStep) ? complete : next)?.apply(this, $$args);
			});

			$.append($$anchor, div_11);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(isCompleted)) $$render(consequent_5);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_1, 1, `mx-auto w-full max-w-md rounded-4xl shadow-xl ${stepCircleContainerClass()}`, 'svelte-15qsqvs');
		$.set_class(div_2, 1, `${stepContainerClass()} flex w-full items-center p-8`, 'svelte-15qsqvs');
		$.set_class(div_8, 1, `space-y-2 px-8 ${contentClass()}`, 'svelte-15qsqvs');
		$.set_style(div_8, `position:relative;overflow:hidden;height:${($.get(isCompleted) ? 0 : $.get(parentHeight)) ?? ''}px;transition:height 0.4s cubic-bezier(0.5,1,0.5,1);`);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);