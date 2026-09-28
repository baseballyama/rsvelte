import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';
import { URLStore } from '$lib/common/stores.js';
import { APIKeyStore } from '$lib/common/stores.js';
import { getAPIKeys } from '$lib/common/apiFunctions.svelte';
import { onMount } from 'svelte';
import ApiKeyTimeLeft from './ServerSettings/APIKeyTimeLeft.svelte';
import RolloverApi from './ServerSettings/RolloverAPI.svelte';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`);
var root_2 = $.from_html(`<button class="btn btn-sm btn-secondary capitalize" type="button">Save API Key</button>`);
var root_3 = $.from_html(`<button class="btn btn-sm btn-primary capitalize" type="button">Edit API Key</button>`);
var root_4 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="green" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
var root_5 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="red" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`);
var root_6 = $.from_html(`<form><h1 class="text-2xl bold text-primary mb-4">Server Settings</h1> <label class="block text-secondary text-sm font-bold mb-2" for="url">Headscale URL</label> <input class="form-input" type="url" placeholder="https://hs.yourdomain.com.au"/> <p class="text-xs text-base-content text-italics mb-8">URL for your headscale server instance</p> <label class="block text-secondary text-sm font-bold mb-2" for="password">Headscale API Key <!></label> <div class="flex relative"><input/> <button type="button" class="absolute right-40"><!></button> <!></div> <p class="text-xs text-base-content text-italics mb-8">Generate an API key for your headscale instance and place it here.</p> <!> <button class="btn btn-sm btn-primary capitalize" type="button">Clear Server Settings</button> <button class="btn btn-sm btn-secondary capitalize" type="button">Test Server Settings</button> <!> <!></form>`);

export default function ServerSettings($$anchor, $$props) {
	$.push($$props, true);

	const $URLStore = () => $.store_get(URLStore, '$URLStore', $$stores);
	const $APIKeyStore = () => $.store_get(APIKeyStore, '$APIKeyStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Server Settings
	let apiStatus = 'untested';

	let apiKeyInputState = 'password';

	function TestServerSettings() {
		getAPIKeys().then(() => {
			apiStatus = 'succeeded';
		}).catch(() => {
			apiStatus = 'failed';
		});
	}

	function ClearServerSettings() {
		$.store_set(URLStore, '');
		$.store_set(APIKeyStore, '');
		apiStatus = 'untested';
	}

	onMount(() => {
		// test api settings on page load
		TestServerSettings();
	});

	var form = root_6();
	var input = $.sibling($.child(form), 4);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'pattern', String.raw`https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`);

	var label = $.sibling(input, 4);
	var node = $.sibling($.child(label));

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.key(node_1, $APIKeyStore, ($$anchor) => {
				ApiKeyTimeLeft($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (apiStatus == 'succeeded') $$render(consequent);
		});
	}

	$.reset(label);

	var div = $.sibling(label, 2);
	var input_1 = $.child(div);

	$.attribute_effect(
		input_1,
		() => ({
			...{ type: apiKeyInputState },
			class: 'form-input',
			disabled: apiStatus == 'succeeded',
			required: true,
			placeholder: '******************'
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	var button = $.sibling(input_1, 2);
	var node_2 = $.child(button);

	{
		var consequent_1 = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node_2, ($$render) => {
			if (apiKeyInputState == 'password') $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_3 = $.sibling(button, 2);

	RolloverApi(node_3, {
		get apiStatus() {
			return apiStatus;
		}
	});

	$.reset(div);

	var node_4 = $.sibling(div, 4);

	{
		var consequent_2 = ($$anchor) => {
			var button_1 = root_2();

			$.event('click', button_1, () => {
				TestServerSettings();
			});

			$.append($$anchor, button_1);
		};

		var alternate_1 = ($$anchor) => {
			var button_2 = root_3();

			$.event('click', button_2, () => {
				apiStatus = 'untested';
			});

			$.append($$anchor, button_2);
		};

		$.if(node_4, ($$render) => {
			if (apiStatus != 'succeeded') $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	var button_3 = $.sibling(node_4, 2);
	var button_4 = $.sibling(button_3, 2);
	var node_5 = $.sibling(button_4, 2);

	{
		var consequent_3 = ($$anchor) => {
			var svg_2 = root_4();

			$.transition(5, svg_2, () => fly, () => ({ x: 10, duration: 600 }));
			$.append($$anchor, svg_2);
		};

		$.if(node_5, ($$render) => {
			if (apiStatus === 'succeeded') $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_4 = ($$anchor) => {
			var svg_3 = root_5();

			$.transition(5, svg_3, () => fly, () => ({ x: 10, duration: 600 }));
			$.append($$anchor, svg_3);
		};

		$.if(node_6, ($$render) => {
			if (apiStatus === 'failed') $$render(consequent_4);
		});
	}

	$.reset(form);
	$.bind_value(input, $URLStore, ($$value) => $.store_set(URLStore, $$value));
	$.bind_value(input_1, $APIKeyStore, ($$value) => $.store_set(APIKeyStore, $$value));

	$.event('click', button, () => {
		apiKeyInputState == 'text'
			? apiKeyInputState = 'password'
			: apiKeyInputState = 'text';
	});

	$.event('click', button_3, () => ClearServerSettings());
	$.event('click', button_4, () => TestServerSettings());
	$.append($$anchor, form);
	$.pop();
	$$cleanup();
}