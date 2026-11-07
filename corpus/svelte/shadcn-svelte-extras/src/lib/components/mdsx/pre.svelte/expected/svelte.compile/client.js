import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Code from '$lib/components/ui/code';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'children',
	'data-mdsx-raw',
	'data-mdsx-lang',
	'data-mdsx-highlight',
	'data-language'
]);

var root = $.from_html(`<div><!></div>`);

export default function Pre($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	function decodeBase64Url(s) {
		const pad = ('=').repeat((4 - s.length % 4) % 4);
		const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
		const bin = atob(b64);
		const bytes = new Uint8Array(bin.length);

		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

		return new TextDecoder().decode(bytes);
	}

	const code = $.derived(() => $$props['data-mdsx-raw'] ? decodeBase64Url($$props['data-mdsx-raw']) : '');

	const highlight = $.derived(() => $$props['data-mdsx-highlight']
		? $$props['data-mdsx-highlight'].split(',').map((n) => Number.parseInt(n, 10)).filter((n) => !Number.isNaN(n))
		: []);

	const LANG_MAP = {
		bash: 'bash',
		diff: 'diff',
		javascript: 'javascript',
		js: 'javascript',
		json: 'json',
		svelte: 'svelte',
		text: 'text',
		plaintext: 'text',
		typescript: 'typescript',
		ts: 'typescript'
	};

	const lang = $.derived(() => {
		const raw = ($$props['data-mdsx-lang'] ?? $$props['data-language'] ?? 'plaintext').toLowerCase();

		return LANG_MAP[raw] ?? 'typescript';
	});

	const hideLines = $.derived(() => $.get(lang) === 'text');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, ($0) => ({ class: $0, ...rest }), [() => cn('not-prose mt-6 w-full min-w-0', $$props.class)]);

			var node_1 = $.child(div);

			$.component(node_1, () => Code.Root, ($$anchor, Code_Root) => {
				Code_Root($$anchor, {
					get code() {
						return $.get(code);
					},

					get lang() {
						return $.get(lang);
					},

					get hideLines() {
						return $.get(hideLines);
					},

					get highlight() {
						return $.get(highlight);
					},
					class: 'w-full min-w-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
							Code_CopyButton($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(code)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}