import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Sequence, createSheetObjectAction } from '@threlte/theatre';
import Button from '$components/Button/Button.svelte';
import FadeOut from '../FadeOut.svelte';
import { springScrollPos } from '../scrollPos';
import TheatreTextBox from './TheatreTextBox.svelte';

var root = $.from_html(`<div class="text-faded mb-2 text-center text-xl svelte-1el4mnz">The Mission:</div>`);
var root_1 = $.from_html(`<h1 class="max-w-[450px] text-center text-4xl font-bold text-white/90 svelte-1el4mnz">Rapidly build interactive <span class="relative inline-block svelte-1el4mnz"><div class="bg-orange absolute bottom-0 left-0 -z-10 h-4 w-full origin-left will-change-transform svelte-1el4mnz"></div> 3D apps</span> for the web.</h1>`);
var root_2 = $.from_html(`<div class="flex flex-col-reverse items-center justify-center gap-6 md:flex-row md:gap-3 svelte-1el4mnz"><code class="rounded-xs bg-[#ffffff1a] px-7 py-4 text-sm text-[1em] md:text-base svelte-1el4mnz"><span class="text-orange mr-2 font-bold select-none svelte-1el4mnz"></span>npm i @threlte/core</code> <!></div>`);
var root_3 = $.from_html(`<div class="will-change-auto svelte-1el4mnz"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-1 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-2 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-3 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg></div>`);
var root_4 = $.from_html(`<div class="fixed top-0 left-0 mt-[18vh] flex w-screen flex-col items-center justify-center gap-12 px-8 sm:mt-[25vh] md:mt-[30vh] svelte-1el4mnz"><div class="svelte-1el4mnz"><!> <!></div> <!> <!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Intro($$anchor, $$props) {
	$.push($$props, true);

	const $springScrollPos = () => $.store_get(springScrollPos, '$springScrollPos', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const sheetObject = createSheetObjectAction();
	var fragment = root_5();
	var node_1 = $.first_child(fragment);

	Sequence(node_1, { autoplay: true });

	var node_2 = $.sibling(node_1, 2);

	FadeOut(node_2, {
		get progress() {
			return $springScrollPos();
		},
		from: 0.3,
		to: 0.6,
		children: ($$anchor, $$slotProps) => {
			var div = root_4();
			var div_1 = $.child(div);
			var node_3 = $.child(div_1);

			TheatreTextBox(node_3, {
				key: 'mission',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root();

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			TheatreTextBox(node_4, {
				key: 'statement',
				children: ($$anchor, $$slotProps) => {
					var h1 = root_1();
					var span = $.sibling($.child(h1));
					var div_3 = $.child(span);

					$.action(div_3, ($$node, $$action_arg) => sheetObject?.($$node, $$action_arg), () => ({
						key: 'underline',
						props: { scaleX: 0 },
						callback(node, props) {
							node.style.transform = `scaleX(${props.scaleX})`;
						}
					}));

					$.next();
					$.reset(span);
					$.next();
					$.reset(h1);
					$.append($$anchor, h1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var node_5 = $.sibling(div_1, 2);

			TheatreTextBox(node_5, {
				key: 'start-building',
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_2();
					var code = $.child(div_4);
					var span_1 = $.child(code);

					span_1.textContent = '>';
					$.next();
					$.reset(code);

					var node_6 = $.sibling(code, 2);

					{
						let $0 = $.derived(() => `${import.meta.env.BASE_URL}docs/learn/getting-started/introduction`);

						Button(node_6, {
							get href() {
								return $.get($0);
							},
							color: 'orange',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Start Building →');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			FadeOut(node_7, {
				get progress() {
					return $springScrollPos();
				},
				from: 0,
				to: 0.2,
				children: ($$anchor, $$slotProps) => {
					var div_5 = root_3();

					$.action(div_5, ($$node, $$action_arg) => sheetObject?.($$node, $$action_arg), () => ({
						key: 'scroll',
						callback(node, props) {
							node.style.transform = `translateY(${props.translateY}%)`;
							node.style.opacity = props.opacity;
						},
						props: { opacity: 0, translateY: 0 }
					}));

					$.append($$anchor, div_5);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.template_effect(() => $.set_style(div, `transform: translateY(${$springScrollPos() * -50}px)`));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}