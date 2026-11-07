import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';

var root = $.from_html(`<span class="ln-feat-aichat-cursor"></span>`);
var root_1 = $.from_html(`<div class="ln-feat-aichat-thinking"><span></span><span></span><span></span></div>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">1</span> <!></div>`);
var root_4 = $.from_html(`<div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">2</span></div>`);
var root_5 = $.from_html(`<div class="ln-feat-aichat-code-line"><span class="ln-feat-aichat-ln">3</span> <!></div>`);
var root_6 = $.from_html(`<div class="ln-feat-aichat-code-block"><!> <!> <!></div>`);
var root_7 = $.from_html(`<div class="ln-feat-aichat-inner"><div class="ln-feat-aichat-head"><div class="ln-feat-aichat-dots"><span></span><span></span><span></span></div> <span class="ln-feat-aichat-title">Editor</span></div> <div class="ln-feat-aichat-prompt-row"><span class="ln-feat-aichat-chevron">$</span> <span class="ln-feat-aichat-prompt"> </span> <!></div> <!> <!></div>`);
var root_8 = $.from_html(`<div class="ln-feat-aichat"><!></div>`);

export default function AITerminal($$anchor, $$props) {
	$.push($$props, true);

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

	let idx = $.state(0);
	let typed = $.state('');
	let phase = $.state('prompt');
	let codeLines = $.state(0);
	let timers = [];
	const conv = $.derived(() => AI_CONVOS[$.get(idx)]);

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

		$.set(typed, '');
		$.set(phase, 'prompt');
		$.set(codeLines, 0);

		let delay = 300;

		for (let k = 0; k <= c.q.length; k++) {
			const slice = c.q.slice(0, k);

			schedule(
				() => {
					$.set(typed, slice, true);
				},
				delay
			);

			delay += 50;
		}

		schedule(
			() => {
				$.set(phase, 'thinking');
			},
			delay
		);

		delay += 900;

		schedule(
			() => {
				$.set(phase, 'code');
				$.set(codeLines, 1);
			},
			delay
		);

		delay += 280;

		schedule(
			() => {
				$.set(codeLines, 2);
			},
			delay
		);

		delay += 280;

		schedule(
			() => {
				$.set(codeLines, 3);
			},
			delay
		);

		delay += 2400;

		schedule(
			() => {
				$.set(idx, ($.get(idx) + 1) % AI_CONVOS.length);
			},
			delay
		);
	}

	onMount(() => {
		runConvo(0);
	});

	onDestroy(clearTimers);

	$.user_effect(() => {
		// Re-run sequence when idx changes (after initial mount).
		const i = $.get(idx);

		if (i === 0) return; // initial run handled by onMount

		clearTimers();
		runConvo(i);
	});

	var div = root_8();
	var node = $.child(div);

	$.key(node, () => $.get(idx), ($$anchor) => {
		var div_1 = root_7();
		var div_2 = $.sibling($.child(div_1), 2);
		var span = $.sibling($.child(div_2), 2);
		var text = $.only_child(span, true);
		var node_1 = $.sibling(span, 2);

		{
			var consequent = ($$anchor) => {
				var span_1 = root();

				$.append($$anchor, span_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(phase) === 'prompt') $$render(consequent);
			});
		}

		$.reset(div_2);

		var node_2 = $.sibling(div_2, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_3 = root_1();

				$.append($$anchor, div_3);
			};

			$.if(node_2, ($$render) => {
				if ($.get(phase) === 'thinking') $$render(consequent_1);
			});
		}

		var node_3 = $.sibling(node_2, 2);

		{
			var consequent_5 = ($$anchor) => {
				var div_4 = root_6();
				var node_4 = $.child(div_4);

				{
					var consequent_2 = ($$anchor) => {
						var div_5 = root_3();
						var node_5 = $.sibling($.child(div_5), 2);

						$.each(node_5, 17, () => $.get(conv).lines, $.index, ($$anchor, t) => {
							var span_2 = root_2();
							var text_1 = $.only_child(span_2, true);

							$.template_effect(() => {
								$.set_class(span_2, 1, `ac-${$.get(t).cls ?? ''}`);
								$.set_text(text_1, $.get(t).text);
							});

							$.append($$anchor, span_2);
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					$.if(node_4, ($$render) => {
						if ($.get(codeLines) >= 1) $$render(consequent_2);
					});
				}

				var node_6 = $.sibling(node_4, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_6 = root_4();

						$.append($$anchor, div_6);
					};

					$.if(node_6, ($$render) => {
						if ($.get(codeLines) >= 2) $$render(consequent_3);
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					var consequent_4 = ($$anchor) => {
						var div_7 = root_5();
						var node_8 = $.sibling($.child(div_7), 2);

						$.each(node_8, 17, () => $.get(conv).jsx, $.index, ($$anchor, t) => {
							var span_3 = root_2();
							var text_2 = $.only_child(span_3, true);

							$.template_effect(() => {
								$.set_class(span_3, 1, `ac-${$.get(t).cls ?? ''}`);
								$.set_text(text_2, $.get(t).text);
							});

							$.append($$anchor, span_3);
						});

						$.reset(div_7);
						$.append($$anchor, div_7);
					};

					$.if(node_7, ($$render) => {
						if ($.get(codeLines) >= 3) $$render(consequent_4);
					});
				}

				$.reset(div_4);
				$.append($$anchor, div_4);
			};

			$.if(node_3, ($$render) => {
				if ($.get(phase) === 'code') $$render(consequent_5);
			});
		}

		$.reset(div_1);
		$.template_effect(() => $.set_text(text, $.get(typed)));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}