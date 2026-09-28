import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	PKG_MANAGERS,
	isInRegistry,
	registryUrl,
	shadcnAddSnippet,
	jsrepoAddSnippet
} from '$lib/constants/cli';

import { dependenciesForSlug } from '$lib/constants/componentDependencies';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

var root = $.from_html(`<p class="cli-install-empty svelte-12cskd0">This component isn't in the registry yet. Copy the source from the section below.</p>`);
var root_1 = $.from_html(`<button type="button" class="cli-tool-tab svelte-12cskd0"> </button>`);
var root_2 = $.from_svg(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
var root_3 = $.from_svg(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
var root_4 = $.from_html(`Pulls the component from <a target="_blank" rel="noreferrer" class="svelte-12cskd0"> </a> and copies it into your project.`, 1);
var root_5 = $.from_html(`<div class="cli-install-section svelte-12cskd0"><div class="mode-switch svelte-12cskd0"><button type="button" class="cli-toggle-button svelte-12cskd0">shadcn</button> <button type="button" class="cli-toggle-button svelte-12cskd0">jsrepo</button> <button type="button">Manual</button></div> <div class="cli-row svelte-12cskd0"><div class="pkg-buttons svelte-12cskd0"></div></div> <div class="code-wrapper svelte-12cskd0"><code class="cli-code svelte-12cskd0"> </code> <button type="button" aria-label="Copy installation command"><!></button></div> <p class="cli-hint svelte-12cskd0"><!></p></div>`);
var root_6 = $.from_html(`<div class="cli-install svelte-12cskd0"><h3 class="cli-install-title svelte-12cskd0">Install</h3> <!></div>`);

export default function CliInstall($$anchor, $$props) {
	$.push($$props, true);

	let pkg = $.state('npm');
	let tab = $.state('shadcn');
	const inRegistry = $.derived(() => isInRegistry($$props.slug));
	const dependencies = $.derived(() => dependenciesForSlug($$props.slug));
	const hasManual = $.derived(() => $.get(dependencies).length > 0);

	const dependencyCommand = $.derived(() => $.get(dependencies).length > 0
		? `${$.get(pkg)} install ${$.get(dependencies).join(' ')}`
		: '');

	const command = $.derived(() => $.get(tab) === 'manual'
		? $.get(dependencyCommand)
		: $.get(tab) === 'jsrepo'
			? jsrepoAddSnippet($$props.slug, $.get(pkg))
			: shadcnAddSnippet($$props.slug, $.get(pkg)));

	const clipboard = new UseClipboard();

	$.user_effect(() => {
		if ($.get(tab) === 'manual' && !$.get(hasManual)) $.set(tab, 'shadcn');
	});

	var div = root_6();
	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate_2 = ($$anchor) => {
			var div_1 = root_5();
			var div_2 = $.child(div_1);
			var button = $.child(div_2);
			var button_1 = $.sibling(button, 2);
			var button_2 = $.sibling(button_1, 2);
			let classes;

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var div_4 = $.child(div_3);

			$.each(div_4, 20, () => PKG_MANAGERS, (m) => m, ($$anchor, m) => {
				var button_3 = root_1();
				var text = $.only_child(button_3, true);

				$.template_effect(() => {
					$.set_attribute(button_3, 'data-active', $.get(pkg) === m);
					$.set_text(text, m);
				});

				$.delegated('click', button_3, () => $.set(pkg, m, true));
				$.append($$anchor, button_3);
			});

			$.reset(div_4);
			$.reset(div_3);

			var div_5 = $.sibling(div_3, 2);
			var code = $.child(div_5);
			var text_1 = $.only_child(code, true);
			var button_4 = $.sibling(code, 2);
			let classes_1;
			var node_1 = $.child(button_4);

			{
				var consequent_1 = ($$anchor) => {
					var svg = root_2();

					$.append($$anchor, svg);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root_3();

					$.append($$anchor, svg_1);
				};

				$.if(node_1, ($$render) => {
					if (clipboard.copied) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button_4);
			$.reset(div_5);

			var p_1 = $.sibling(div_5, 2);
			var node_2 = $.child(p_1);

			{
				var consequent_2 = ($$anchor) => {
					var text_2 = $.text('Install dependencies manually, then copy the usage and component source below.');

					$.append($$anchor, text_2);
				};

				var alternate_1 = ($$anchor) => {
					var fragment = root_4();
					var a = $.sibling($.first_child(fragment));
					var text_3 = $.only_child(a, true);

					$.next();

					$.template_effect(
						($0, $1) => {
							$.set_attribute(a, 'href', $0);
							$.set_text(text_3, $1);
						},
						[
							() => registryUrl($$props.slug),
							() => registryUrl($$props.slug)
						]
					);

					$.append($$anchor, fragment);
				};

				$.if(node_2, ($$render) => {
					if ($.get(tab) === 'manual') $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(p_1);
			$.reset(div_1);

			$.template_effect(() => {
				$.set_attribute(button, 'data-active', $.get(tab) === 'shadcn');
				$.set_attribute(button_1, 'data-active', $.get(tab) === 'jsrepo');
				classes = $.set_class(button_2, 1, 'cli-toggle-button svelte-12cskd0', null, classes, { disabled: !$.get(hasManual) });
				$.set_attribute(button_2, 'data-active', $.get(tab) === 'manual');
				button_2.disabled = !$.get(hasManual);
				$.set_attribute(button_2, 'aria-disabled', !$.get(hasManual));

				$.set_attribute(button_2, 'title', $.get(hasManual)
					? 'Install dependencies manually'
					: 'No external dependencies');

				$.set_text(text_1, $.get(command));
				classes_1 = $.set_class(button_4, 1, 'cli-copy svelte-12cskd0', null, classes_1, { done: clipboard.copied });
			});

			$.delegated('click', button, () => $.set(tab, 'shadcn'));
			$.delegated('click', button_1, () => $.set(tab, 'jsrepo'));

			$.delegated('click', button_2, () => {
				if ($.get(hasManual)) $.set(tab, 'manual');
			});

			$.delegated('click', button_4, () => clipboard.copy($.get(command)));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(inRegistry)) $$render(consequent); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);