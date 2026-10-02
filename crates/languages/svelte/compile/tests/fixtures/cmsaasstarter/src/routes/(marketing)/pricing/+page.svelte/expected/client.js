import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PricingModule from "./pricing_module.svelte";
import { WebsiteName } from "./../../../config";

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<tr class="bg-base-200 font-bold"><td colspan="3"> </td></tr>`);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 ml-2 inline text-success"><use href="#checkcircle"></use></svg>`);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="w-[26px] h-[26px] inline text-base-200"><use href="#nocircle"></use></svg>`);
var root_4 = $.from_html(`<tr class="relative"><td> </td><td class="text-center"><!></td><td class="text-center"><!></td></tr>`);

var root_5 = $.from_html(`<div class="min-h-[70vh] pb-8 pt-[5vh] px-4"><h1 class="text-3xl font-bold text-center">Pricing</h1> <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">Totally free, scale to millions of users</h2> <div class="w-full my-8"><!> <h1 class="text-2xl font-bold text-center mt-24">Pricing FAQ</h1> <div class="flex place-content-center"><div class="join join-vertical max-w-xl py-6 mx-auto"><div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"/> <div class="collapse-title text-lg font-medium">Is this template free to use?</div> <div class="collapse-content"><p>Yup! This template is free to use for any project.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"/> <div class="collapse-title text-lg font-medium">Why does a free template have a pricing page?</div> <div class="collapse-content"><p>The pricing page is part of the boilerplate. It shows how the
              pricing page integrates into the billing portal and the Stripe
              Checkout flows.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"/> <div class="collapse-title text-lg font-medium">What license is the template under?</div> <div class="collapse-content"><p>The template is under the MIT license.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"/> <div class="collapse-title text-lg font-medium">Can I try out purchase flows without real a credit card?</div> <div class="collapse-content"><p>Our demo page <a href="https://saasstarter.work" class="link">SaasStarter.work</a> has a functional demo page, using Stripe's test environment.</p> <p class="mt-4">You can use the credit card number 4242 4242 4242 4242 with any
              future expiry date to test the payment and upgrade flows.</p></div></div></div></div> <svg style="display:none" version="2.0"><defs><symbol id="checkcircle" viewBox="0 0 24 24" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-4.105-4.498a.791.791 0 0 0-1.082.29l-3.828 6.63-1.733-2.08a.791.791 0 1 0-1.216 1.014l2.459 2.952a.792.792 0 0 0 .608.285.83.83 0 0 0 .068-.003.791.791 0 0 0 .618-.393L12.6 6.866a.791.791 0 0 0-.29-1.081z"></path></symbol></defs></svg> <svg style="display:none" version="2.0"><defs><symbol id="nocircle" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm4,11H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2Z"></path></symbol></defs></svg> <h1 class="text-2xl font-bold text-center mt-16">Plan Features</h1> <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">Example feature table</h2> <div class="overflow-visible mx-auto max-w-xl mt-4"><table class="table"><thead class="text-lg sticky top-0 bg-base-100 bg-opacity-50 z-10 backdrop-blur-sm"><tr><th></th><th class="text-center">Free</th><th class="text-center">Pro</th></tr></thead><tbody></tbody></table></div></div></div>`);

export default function _page($$anchor) {
	const planFeatures = [
		{ name: "Section 1", header: true },
		{ name: "Feature 1", freeIncluded: true, proIncluded: true },
		{ name: "Feature 2", freeIncluded: false, proIncluded: true },
		{ name: "Feature 3", freeString: "3", proString: "Unlimited" },
		{ name: "Section 2", header: true },
		{ name: "Feature 4", freeIncluded: true, proIncluded: true },
		{ name: "Feature 5", freeIncluded: false, proIncluded: true }
	];

	var div = root_5();

	$.head('133tnjx', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `Pricing - ${WebsiteName ?? ''}`));

		$.effect(() => {
			$.document.title = 'Pricing';
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.sibling($.child(div), 4);
	var node = $.child(div_1);

	PricingModule(node, { callToAction: 'Get Started', highlightedPlanId: 'pro' });

	var div_2 = $.sibling(node, 14);
	var table = $.child(div_2);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => planFeatures, $.index, ($$anchor, feature) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var tr = root_1();
				var td = $.child(tr);
				var text = $.only_child(td, true);

				$.reset(tr);
				$.template_effect(() => $.set_text(text, $.get(feature).name));
				$.append($$anchor, tr);
			};

			var alternate_2 = ($$anchor) => {
				var tr_1 = root_4();
				var td_1 = $.child(tr_1);
				var text_1 = $.only_child(td_1, true);
				var td_2 = $.sibling(td_1);
				var node_2 = $.child(td_2);

				{
					var consequent_1 = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(feature).freeString));
						$.append($$anchor, text_2);
					};

					var consequent_2 = ($$anchor) => {
						var svg = root_2();

						$.append($$anchor, svg);
					};

					var alternate = ($$anchor) => {
						var svg_1 = root_3();

						$.append($$anchor, svg_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(feature).freeString) $$render(consequent_1); else if ($.get(feature).freeIncluded) $$render(consequent_2, 1); else $$render(alternate, -1);
					});
				}

				$.reset(td_2);

				var td_3 = $.sibling(td_2);
				var node_3 = $.child(td_3);

				{
					var consequent_3 = ($$anchor) => {
						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(feature).proString));
						$.append($$anchor, text_3);
					};

					var consequent_4 = ($$anchor) => {
						var svg_2 = root_2();

						$.append($$anchor, svg_2);
					};

					var alternate_1 = ($$anchor) => {
						var svg_3 = root_3();

						$.append($$anchor, svg_3);
					};

					$.if(node_3, ($$render) => {
						if ($.get(feature).proString) $$render(consequent_3); else if ($.get(feature).proIncluded) $$render(consequent_4, 1); else $$render(alternate_1, -1);
					});
				}

				$.reset(td_3);
				$.reset(tr_1);
				$.template_effect(() => $.set_text(text_1, $.get(feature).name));
				$.append($$anchor, tr_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(feature).header) $$render(consequent); else $$render(alternate_2, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}