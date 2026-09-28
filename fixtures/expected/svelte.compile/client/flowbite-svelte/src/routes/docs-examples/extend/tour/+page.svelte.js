import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tour, Button, Avatar } from "$lib";

import {
	FireOutline,
	BellRingOutline,
	BellOutline,
	GlobeOutline,
	GridOutline,
	QuestionCircleOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<div class="min-h-screen bg-gray-50"><header class="sticky top-0 z-50 border-b border-gray-200 bg-white"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex h-16 items-center justify-between"><div class="flex items-center gap-8"><h1 id="welcome-section" class="text-xl font-bold text-gray-900">MyApp</h1> <div id="search-bar" class="hidden sm:block"><input type="text" placeholder="Search..." class="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div></div> <div class="flex items-center gap-4"><button id="notifications" class="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900" aria-label="Notifications"><!> <span class="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span></button> <button id="help-center" class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900" aria-label="Help"><!></button> <button id="profile-button" class="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"><!> <span class="hidden text-sm font-medium text-gray-700 sm:block">John Doe</span></button></div></div></div></header> <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div class="mb-8 rounded-lg bg-white p-8 shadow-sm"><h2 class="mb-4 text-2xl font-bold text-gray-900">Welcome Back! 👋</h2> <p class="mb-6 text-gray-600">Ready to explore? Start the interactive tour to learn about all the features.</p> <!></div> <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"><div id="fast-performance" class="rounded-lg bg-white p-6 shadow-sm"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"><!></div> <h3 class="mb-2 text-lg font-semibold text-gray-900">Fast Performance</h3> <p class="text-sm text-gray-600">Lightning fast load times and smooth interactions.</p></div> <div id="secure" class="rounded-lg bg-white p-6 shadow-sm"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"><!></div> <h3 class="mb-2 text-lg font-semibold text-gray-900">Secure</h3> <p class="text-sm text-gray-600">Your data is protected with enterprise-grade security.</p></div> <div id="customizable" class="rounded-lg bg-white p-6 shadow-sm"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100"><!></div> <h3 class="mb-2 text-lg font-semibold text-gray-900">Customizable</h3> <p class="text-sm text-gray-600">Tailor the experience to match your workflow.</p></div> <div id="a11y" class="rounded-lg bg-white p-6 shadow-sm"><div class="bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"><!></div> <h3 class="mb-2 text-lg font-semibold text-gray-900">A11y</h3> <p class="text-sm text-gray-600">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</p></div></div></main> <!></div>`);

export default function _page($$anchor) {
	let tourActive = $.state(false);
	let currentStep = $.state(0);

	const tourSteps = [
		{
			target: "#welcome-section",
			title: "Welcome to Our App! 👋",
			description: "Let us show you around and help you get started with the key features.",
			placement: "bottom"
		},

		{
			target: "#search-bar",
			title: "Search Anything",
			description: "Use our powerful search to find exactly what you need in seconds.",
			placement: "bottom"
		},

		{
			target: "#profile-button",
			title: "Your Profile",
			description: "Access your account settings, preferences, and personal information here.",
			placement: "left"
		},

		{
			target: "#notifications",
			title: "Stay Updated",
			description: "Check your notifications to never miss important updates and messages.",
			placement: "bottom"
		},

		{
			target: "#help-center",
			title: "Need Help?",
			description: "Our help center is always available if you have questions or need assistance.",
			placement: "left"
		},

		{
			target: "#fast-performance",
			title: "Fast Performance",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
			placement: "right"
		},

		{
			target: "#secure",
			title: "Secure",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
			placement: "top"
		},

		{
			target: "#customizable",
			title: "Customizable",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
			placement: "bottom"
		},

		{
			target: "#a11y",
			title: "Accessibility Features",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
			placement: "left"
		}
	];

	function handleTourComplete() {
		console.log("Tour completed! 🎉");

		// Save to localStorage that user completed the tour
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("tourCompleted", "true");
		}
	}

	function handleTourSkip() {
		console.log("Tour skipped");
	}

	function startTour() {
		$.set(currentStep, 0);
		$.set(tourActive, true);
	}

	var div = root();
	var header = $.child(div);
	var div_1 = $.child(header);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var button = $.child(div_3);
	var node = $.child(button);

	BellOutline(node, { class: 'h-6 w-6' });
	$.next(2);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_1 = $.child(button_1);

	QuestionCircleOutline(node_1, { class: 'h-6 w-6' });
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var node_2 = $.child(button_2);

	Avatar(node_2, {
		class: 'bg-blue-400 text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('JD');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(button_2);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(header);

	var main = $.sibling(header, 2);
	var div_4 = $.child(main);
	var node_3 = $.sibling($.child(div_4), 4);

	Button(node_3, {
		onclick: startTour,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Start Tour');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var node_4 = $.child(div_7);

	FireOutline(node_4, { class: 'h-6 w-6 text-purple-600' });
	$.reset(div_7);
	$.next(4);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_5 = $.child(div_9);

	BellRingOutline(node_5, { class: 'h-6 w-6 text-green-600' });
	$.reset(div_9);
	$.next(4);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_6 = $.child(div_11);

	GlobeOutline(node_6, { class: 'h-6 w-6 text-blue-600' });
	$.reset(div_11);
	$.next(4);
	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var div_13 = $.child(div_12);
	var node_7 = $.child(div_13);

	GridOutline(node_7, { class: 'text-primary-600 h-6 w-6' });
	$.reset(div_13);
	$.next(4);
	$.reset(div_12);
	$.reset(div_5);
	$.reset(main);

	var node_8 = $.sibling(main, 2);

	Tour(node_8, {
		get steps() {
			return tourSteps;
		},
		oncomplete: handleTourComplete,
		onskip: handleTourSkip,
		get active() {
			return $.get(tourActive);
		},

		set active($$value) {
			$.set(tourActive, $$value, true);
		},

		get currentStep() {
			return $.get(currentStep);
		},

		set currentStep($$value) {
			$.set(currentStep, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}