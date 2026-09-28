import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { fade } from 'svelte/transition';
import { fromStore } from 'svelte/store';
import { useProgress } from '@threlte/extras';

var root = $.from_html(`<div class="wrapper svelte-pz6rrp"><p class="loading svelte-pz6rrp">Loading</p> <div class="bar-wrapper svelte-pz6rrp"><div class="bar svelte-pz6rrp"></div></div></div>`);
var root_1 = $.from_html(`<div class="main svelte-pz6rrp"><!></div> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const { progress } = useProgress();
	const p = fromStore(progress);
	const tweenedProgress = Tween.of(() => p.current, { duration: 150 });
	const progressWidth = $.derived(() => 100 * tweenedProgress.current);
	const progressLessThanOne = $.derived(() => tweenedProgress.current < 1);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var div_2 = $.sibling($.child(div_1), 2);
			var div_3 = $.only_child(div_2);

			$.reset(div_1);
			$.template_effect(() => $.set_style(div_3, `width: ${$.get(progressWidth) ?? ''}%`));
			$.transition(3, div_1, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(progressLessThanOne)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}