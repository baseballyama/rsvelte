import * as $ from 'svelte/internal/server';
import { pricingPlans } from "./pricing_plans";

export default function Pricing_module($$renderer, $$props) {
	// Module context
	let {
		highlightedPlanId = "",
		callToAction,
		currentPlanId = "",
		center = true
	} = $$props;

	$$renderer.push(`<div${$.attr_class(`flex flex-col lg:flex-row gap-10 ${center ? 'place-content-center' : ''} flex-wrap`)}><!--[-->`);

	const each_array = $.ensure_array_like(pricingPlans);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let plan = each_array[$$index_1];

		$$renderer.push(`<div${$.attr_class(`flex-none card card-bordered ${plan.id === highlightedPlanId ? 'border-primary' : 'border-gray-200'} shadow-xl flex-1 grow min-w-[260px] max-w-[310px] p-6`)}><div class="flex flex-col h-full"><div class="text-xl font-bold">${$.escape(plan.name)}</div> <p class="mt-2 text-sm text-gray-500 leading-relaxed">${$.escape(plan.description)}</p> <div class="mt-auto pt-4 text-sm text-gray-600">Plan Includes: <ul class="list-disc list-inside mt-2 space-y-1"><!--[-->`);

		const each_array_1 = $.ensure_array_like(plan.features);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let feature = each_array_1[$$index];

			$$renderer.push(`<li>${$.escape(feature)}</li>`);
		}

		$$renderer.push(`<!--]--> <ul></ul></ul></div> <div class="pt-8"><span class="text-4xl font-bold">${$.escape(plan.price)}</span> <span class="text-gray-400">${$.escape(plan.priceIntervalName)}</span> <div class="mt-6 pt-4 flex-1 flex flex-row items-center">`);

		if (plan.id === currentPlanId) {
			$$renderer.push(`<!--[0--><div class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default">Current Plan</div>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attr('href', "/account/subscribe/" + (plan?.stripe_price_id ?? "free_plan"))} class="btn btn-primary w-[80%] mx-auto">${$.escape(callToAction)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}