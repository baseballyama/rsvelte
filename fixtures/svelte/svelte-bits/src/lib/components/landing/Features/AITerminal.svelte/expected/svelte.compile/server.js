import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';

export default function AITerminal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const AI_CONVOS = [
			{
				q: 'add a glowing card',
				lines: [
					{ cls: 'kw', text: 'import ' },
					{ cls: 'comp', text: 'BorderGlow' },
					{ cls: 'kw', text: ' from ' },
					{ cls: 'str', text: '"./BorderGlow"' }
				],
				jsx: [
					{ cls: 'tag', text: '<' },
					{ cls: 'comp', text: 'BorderGlow' },
					{ cls: 'attr', text: ' glowIntensity' },
					{ cls: 'punc', text: '=' },
					{ cls: 'num', text: '{0.8}' },
					{ cls: 'tag', text: ' />' }
				]
			},

			{
				q: 'animate hero text',
				lines: [
					{ cls: 'kw', text: 'import ' },
					{ cls: 'comp', text: 'SplitText' },
					{ cls: 'kw', text: ' from ' },
					{ cls: 'str', text: '"./SplitText"' }
				],
				jsx: [
					{ cls: 'tag', text: '<' },
					{ cls: 'comp', text: 'SplitText' },
					{ cls: 'attr', text: ' animation' },
					{ cls: 'punc', text: '=' },
					{ cls: 'str', text: '"fadeUp"' },
					{ cls: 'tag', text: ' />' }
				]
			},

			{
				q: 'particle background',
				lines: [
					{ cls: 'kw', text: 'import ' },
					{ cls: 'comp', text: 'Ballpit' },
					{ cls: 'kw', text: ' from ' },
					{ cls: 'str', text: '"./Ballpit"' }
				],
				jsx: [
					{ cls: 'tag', text: '<' },
					{ cls: 'comp', text: 'Ballpit' },
					{ cls: 'attr', text: ' count' },
					{ cls: 'punc', text: '=' },
					{ cls: 'num', text: '{200}' },
					{ cls: 'tag', text: ' />' }
				]
			}
		];

		let idx = 0;
		let typed = '';
		let phase = 'prompt';
		let codeLines = 0;
		let timers = [];
		const conv = $.derived(() => AI_CONVOS[idx]);

		function clearTimers() {
			timers.forEach(clearTimeout);
			timers = [];
		}

		function schedule(fn, ms) {
			const id = setTimeout(fn, ms);

			timers.push(id);
		}

		function runConvo(i) {
			const c = AI_CONVOS[i];

			typed = '';
			phase = 'prompt';
			codeLines = 0;

			let delay = 300;

			for (let k = 0; k <= c.q.length; k++) {
				const slice = c.q.slice(0, k);

				schedule(
					() => {
						typed = slice;
					},
					delay
				);

				delay += 50;
			}

			schedule(
				() => {
					phase = 'thinking';
				},
				delay
			);

			delay += 900;

			schedule(
				() => {
					phase = 'code';
					codeLines = 1;
				},
				delay
			);

			delay += 280;

			schedule(
				() => {
					codeLines = 2;
				},
				delay
			);

			delay += 280;

			schedule(
				() => {
					codeLines = 3;
				},
				delay
			);

			delay += 2400;

			schedule(
				() => {
					idx = (idx + 1) % AI_CONVOS.length;
				},
				delay
			);
		}

		onMount(() => {
			runConvo(0);
		});

		onDestroy(clearTimers);
		$$renderer.push(`<div class="ln-feat-aichat"><!---->`);

		{
			$$renderer.push(`<div class="ln-feat-aichat-inner"><div class="ln-feat-aichat-head"><div class="ln-feat-aichat-dots"><span></span><span></span><span></span></div> <span class="ln-feat-aichat-title">Editor</span></div> <div class="ln-feat-aichat-prompt-row"><span class="ln-feat-aichat-chevron">$</span> <span class="ln-feat-aichat-prompt">${$.escape(typed)}</span> `);

			if (phase === 'prompt') {
				$$renderer.push(`<!--[0--><span class="ln-feat-aichat-cursor"></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (phase === 'thinking') {
				$$renderer.push(`<!--[0--><div class="ln-feat-aichat-thinking"><span></span><span></span><span></span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (phase === 'code') {
				$$renderer.push(`<!--[0--><div class="ln-feat-aichat-code-block">`);

				if (codeLines >= 1) {
					$$renderer.push(`<!--[0--><div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">1</span> <!--[-->`);

					const each_array = $.ensure_array_like(conv().lines);

					for (let j = 0, $$length = each_array.length; j < $$length; j++) {
						let t = each_array[j];

						$$renderer.push(`<span${$.attr_class(`ac-${$.stringify(t.cls)}`)}>${$.escape(t.text)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (codeLines >= 2) {
					$$renderer.push(`<!--[0--><div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">2</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (codeLines >= 3) {
					$$renderer.push(`<!--[0--><div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">3</span> <!--[-->`);

					const each_array_1 = $.ensure_array_like(conv().jsx);

					for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
						let t = each_array_1[j];

						$$renderer.push(`<span${$.attr_class(`ac-${$.stringify(t.cls)}`)}>${$.escape(t.text)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!----></div>`);
	});
}