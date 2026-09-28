import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pricingPlans } from "./pricing_plans";

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default">Current Plan</div>`);
var root_2 = $.from_html(`<a class="btn btn-primary w-[80%] mx-auto"> </a>`);
var root_3 = $.from_html(`<div><div class="flex flex-col h-full"><div class="text-xl font-bold"> </div> <p class="mt-2 text-sm text-gray-500 leading-relaxed"> </p> <div class="mt-auto pt-4 text-sm text-gray-600">Plan Includes: <ul class="list-disc list-inside mt-2 space-y-1"><!> <ul></ul></ul></div> <div class="pt-8"><span class="text-4xl font-bold"> </span> <span class="text-gray-400"> </span> <div class="mt-6 pt-4 flex-1 flex flex-row items-center"><!></div></div></div></div>`);
var root_4 = $.from_html(`<div></div>`);

export default function Pricing_module($$anchor, $$props) {
	// Module context
	let highlightedPlanId = $.prop($$props, 'highlightedPlanId', 3, ""),
		currentPlanId = $.prop($$props, 'currentPlanId', 3, ""),
		center = $.prop($$props, 'center', 3, true);

	var div = root_4();

	$.each(div, 21, () => pricingPlans, $.index, ($$anchor, plan) => {
		var div_1 = root_3();
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		var text = $.only_child(div_3, true);
		var p = $.sibling(div_3, 2);
		var text_1 = $.only_child(p, true);
		var div_4 = $.sibling(p, 2);
		var ul = $.sibling($.child(div_4));
		var node = $.child(ul);

		$.each(node, 17, () => $.get(plan).features, $.index, ($$anchor, feature) => {
			var li = root();
			var text_2 = $.only_child(li, true);

			$.template_effect(() => $.set_text(text_2, $.get(feature)));
			$.append($$anchor, li);
		});

		$.next(2);
		$.reset(ul);
		$.reset(div_4);

		var div_5 = $.sibling(div_4, 2);
		var span = $.child(div_5);
		var text_3 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_4 = $.only_child(span_1, true);
		var div_6 = $.sibling(span_1, 2);
		var node_1 = $.child(div_6);

		{
			var consequent = ($$anchor) => {
				var div_7 = root_1();

				$.append($$anchor, div_7);
			};

			var alternate = ($$anchor) => {
				var a = root_2();
				var text_5 = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', "/account/subscribe/" + ($.get(plan)?.stripe_price_id ?? "free_plan"));
					$.set_text(text_5, $$props.callToAction);
				});

				$.append($$anchor, a);
			};

			$.if(node_1, ($$render) => {
				if ($.get(plan).id === currentPlanId()) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_6);
		$.reset(div_5);
		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_class(div_1, 1, `flex-none card card-bordered ${$.get(plan).id === highlightedPlanId() ? 'border-primary' : 'border-gray-200'} shadow-xl flex-1 grow min-w-[260px] max-w-[310px] p-6`);
			$.set_text(text, $.get(plan).name);
			$.set_text(text_1, $.get(plan).description);
			$.set_text(text_3, $.get(plan).price);
			$.set_text(text_4, $.get(plan).priceIntervalName);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `flex flex-col lg:flex-row gap-10 ${center() ? 'place-content-center' : ''} flex-wrap`));
	$.append($$anchor, div);
}