import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { themeSettings } from '$lib/data/settings.svelte.js';

var root = $.from_html(`<div class="mt-4 text-center"><p class="text-red-500 dark:text-red-400 font-medium"> </p> <p class="text-sm text-gray-500 dark:text-gray-400 mt-1"> </p></div>`);
var root_1 = $.from_html(`<div class="mt-4 text-center"><p class="text-xl text-gray-600 dark:text-gray-400"> </p> <p class="min-h-[1.5rem] text-sm text-gray-500 dark:text-gray-400 mt-1"> </p></div>`);
var root_2 = $.from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-bg"><div class="text-center"><div class="relative mx-auto mb-4 h-40 w-40"><img src="/svg/spin_body.svg" alt=""/> <img alt=""/></div> <h1 class="mb-2 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-dark-text"><span> </span> <span class="mt-0.5 ms-2 rounded-lg bg-yellow-200 px-2 py-0.5 text-xs font-medium text-black"> </span></h1> <p class="text-xl text-gray-600 dark:text-gray-400"> </p> <!> <div class="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"><p> </p> <p> </p></div></div></div>`);

export default function SplashScreen($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let showProgress = $.prop($$props, 'showProgress', 3, false),
		progress = $.prop($$props, 'progress', 3, 0),
		stage = $.prop($$props, 'stage', 3, ''),
		hasError = $.prop($$props, 'hasError', 3, false),
		errorMessage = $.prop($$props, 'errorMessage', 3, '');

	// Smooth animated progress counter
	let displayProgress = $.state(0);

	let animationFrame;

	// Animation loop that runs continuously
	onMount(() => {
		const animate = () => {
			const diff = progress() - $.get(displayProgress);

			// If we're close enough, just set it directly
			if (Math.abs(diff) < 0.1) {
				$.set(displayProgress, progress());
			} else {
				// Otherwise, animate towards the target
				// Use a smaller step for smoother animation
				$.set(displayProgress, $.get(displayProgress) + diff * 0.08);
			}

			// Keep animating
			animationFrame = requestAnimationFrame(animate);
		};

		// Start animation
		animate();

		// Cleanup
		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var img = $.child(div_2);
	let classes;
	var img_1 = $.sibling(img, 2);
	let classes_1;

	$.reset(div_2);

	var h1 = $.sibling(div_2, 2);
	var span = $.child(h1);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(h1);

	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);
	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var p_1 = $.child(div_3);
			var text_3 = $.only_child(p_1, true);
			var p_2 = $.sibling(p_1, 2);
			var text_4 = $.only_child(p_2, true);

			$.reset(div_3);

			$.template_effect(
				($0) => {
					$.set_text(text_3, errorMessage() || "An error occurred");
					$.set_text(text_4, $0);
				},
				[
					() => s("loading.errorFallback") || "Continuing with limited functionality..."
				]
			);

			$.append($$anchor, div_3);
		};

		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var p_3 = $.child(div_4);
			var text_5 = $.only_child(p_3);
			var p_4 = $.sibling(p_3, 2);
			var text_6 = $.only_child(p_4, true);

			$.reset(div_4);

			$.template_effect(
				($0) => {
					$.set_text(text_5, `${$0 ?? ''}%`);
					$.set_text(text_6, stage() || "");
				},
				[() => Math.round($.get(displayProgress))]
			);

			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if (hasError()) $$render(consequent); else if (showProgress()) $$render(consequent_1, 1);
		});
	}

	var div_5 = $.sibling(node, 2);
	var p_5 = $.child(div_5);
	var text_7 = $.only_child(p_5, true);
	var p_6 = $.sibling(p_5, 2);
	var text_8 = $.only_child(p_6, true);

	$.reset(div_5);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4) => {
			classes = $.set_class(img, 1, 'absolute inset-0 h-full w-full animate-spin-slow', null, classes, {
				'brightness-75': hasError(),
				sepia: hasError(),
				'hue-rotate-[320deg]': hasError(),
				'saturate-150': hasError()
			});

			$.set_attribute(img_1, 'src', themeSettings.isDark
				? "/svg/spin_circle_dark.svg"
				: "/svg/spin_circle_light.svg");

			classes_1 = $.set_class(img_1, 1, 'absolute inset-0 h-full w-full animate-spin-reverse', null, classes_1, {
				'brightness-75': hasError(),
				sepia: hasError(),
				'hue-rotate-[320deg]': hasError(),
				'saturate-150': hasError()
			});

			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_7, $3);
			$.set_text(text_8, $4);
		},
		[
			() => s("app.title") || "Kite",
			() => s("app.beta") || "BETA",
			() => s("app.motto") || "News. Elevated.",
			() => s("app.disclaimerAutoGenerated") || "Summaries are auto-generated and Kite can make mistakes.",
			() => s("app.disclaimerVerify") || "Please verify important information."
		]
	);

	$.append($$anchor, div);
	$.pop();
}