import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';
import { cn } from '$lib/utils.js';

export default function Pre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children: _children,
			'data-mdsx-raw': dataMdsxRaw,
			'data-mdsx-lang': dataMdsxLang,
			'data-mdsx-highlight': dataMdsxHighlight,
			'data-language': dataLanguage,
			$$slots,
			$$events,
			...rest
		} = $$props;

		function decodeBase64Url(s) {
			const pad = ('=').repeat((4 - s.length % 4) % 4);
			const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
			const bin = atob(b64);
			const bytes = new Uint8Array(bin.length);

			for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

			return new TextDecoder().decode(bytes);
		}

		const code = $.derived(() => dataMdsxRaw ? decodeBase64Url(dataMdsxRaw) : '');

		const highlight = $.derived(() => dataMdsxHighlight
			? dataMdsxHighlight.split(',').map((n) => Number.parseInt(n, 10)).filter((n) => !Number.isNaN(n))
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
			const raw = (dataMdsxLang ?? dataLanguage ?? 'plaintext').toLowerCase();

			return LANG_MAP[raw] ?? 'typescript';
		});

		const hideLines = $.derived(() => lang() === 'text');

		if (code()) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				class: $.clsx(cn('not-prose mt-6 w-full min-w-0', className)),
				...rest
			})}>`);

			if (Code.Root) {
				$$renderer.push('<!--[-->');

				Code.Root($$renderer, {
					code: code(),
					lang: lang(),
					hideLines: hideLines(),
					highlight: highlight(),
					class: 'w-full min-w-0',
					children: ($$renderer) => {
						if (Code.CopyButton) {
							$$renderer.push('<!--[-->');
							Code.CopyButton($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}