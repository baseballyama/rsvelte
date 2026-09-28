import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowLeft, Check } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import Icon from './Icon.svelte';

var root = $.from_html(`<div class="border-background absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 bg-green-500 text-white"><!></div>`);
var root_1 = $.from_html(`<div class="absolute -right-3 bottom-1 z-0"></div>`);
var root_2 = $.from_html(`<p class="text-lg text-white/70"> </p>`);
var root_3 = $.from_html(`<footer class="absolute bottom-8"><span class="text-sm text-white/50">Need to open in another browser? <button class="font-medium text-white/80 hover:underline"><!></button></span></footer>`);
var root_4 = $.from_html(`<div class="flex h-screen flex-col items-center justify-center"><header class="absolute top-4 left-4"><!></header> <div class="flex flex-col items-center gap-4 text-center"><div class="relative mb-2 flex h-20 w-20 items-center justify-center"><div class="bg-background absolute z-10 flex size-12 items-center justify-center rounded-2xl border border-white/10"><!> <!></div> <!></div> <h1 class="text-4xl font-bold text-white"> </h1> <!> <!></div> <!></div>`);

export default function OAuthView($$anchor, $$props) {
	$.push($$props, true);

	let isLinkCopied = $.state(false);

	function handleCopyLink() {
		writeText($$props.authUrl);
		$.set(isLinkCopied, true);

		setTimeout(
			() => {
				$.set(isLinkCopied, false);
			},
			2000
		);
	}

	var div = root_4();
	var header = $.child(div);
	var node = $.child(header);

	Button(node, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full text-white/80',
		get onclick() {
			return $$props.onBack;
		},

		children: ($$anchor, $$slotProps) => {
			ArrowLeft($$anchor, { class: 'size-5' });
		},
		$$slots: { default: true }
	});

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	Icon(node_1, { icon: 'raycast-logo-neg-16', class: 'size-7' });

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var node_3 = $.child(div_4);

			Check(node_3, { class: 'size-4' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($$props.status === 'success') $$render(consequent);
		});
	}

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_1();

			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if ($$props.providerIcon) $$render(consequent_1);
		});
	}

	$.reset(div_2);

	var h1 = $.sibling(div_2, 2);
	var text = $.only_child(h1, true);
	var node_5 = $.sibling(h1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var p = root_2();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Successfully connected to ${$$props.providerName ?? ''}`));
			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_2();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, $$props.description));
			$.append($$anchor, p_1);
		};

		$.if(node_5, ($$render) => {
			if ($$props.status === 'success') $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			Button($$anchor, {
				class: 'mt-4 bg-white/10 px-8 py-3 text-base font-semibold text-white hover:bg-white/20',
				get onclick() {
					return $$props.onSignIn;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, `Sign in with ${$$props.providerName ?? ''}`));
					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($$props.status === 'initial') $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var footer = root_3();
			var span = $.child(footer);
			var button = $.sibling($.child(span));
			var node_8 = $.child(button);

			{
				var consequent_4 = ($$anchor) => {
					var text_4 = $.text('Copied!');

					$.append($$anchor, text_4);
				};

				var alternate_1 = ($$anchor) => {
					var text_5 = $.text('Copy authorization link');

					$.append($$anchor, text_5);
				};

				$.if(node_8, ($$render) => {
					if ($.get(isLinkCopied)) $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(button);
			$.reset(span);
			$.reset(footer);
			$.delegated('click', button, handleCopyLink);
			$.append($$anchor, footer);
		};

		$.if(node_7, ($$render) => {
			if ($$props.status === 'initial') $$render(consequent_5);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.providerName));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);