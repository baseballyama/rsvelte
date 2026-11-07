import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
import FeatureIcon from './FeatureIcon.svelte';

var root = $.from_html(`<div class="ln-feat-orbit"><div class="ln-feat-orbit-center"><img alt="" aria-hidden="true"/></div> <div class="ln-feat-orbit-ring ln-feat-orbit-ring--1"><div class="ln-feat-orbit-node ln-feat-orbit-node--top"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--right"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--left"><!></div></div> <div class="ln-feat-orbit-ring ln-feat-orbit-ring--2"><div class="ln-feat-orbit-node ln-feat-orbit-node--top"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--tr"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--right"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--br"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bottom"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bl"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--left"><!></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--tl"><!></div></div></div>`);

export default function CategorySelector($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var img = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	FeatureIcon(node, { name: 'type' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	FeatureIcon(node_1, { name: 'code' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	FeatureIcon(node_2, { name: 'layers' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.child(div_6);

	FeatureIcon(node_3, { name: 'grid' });
	$.reset(div_6);
	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var div_8 = $.child(div_7);
	var node_4 = $.child(div_8);

	FeatureIcon(node_4, { name: 'zap' });
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_5 = $.child(div_9);

	FeatureIcon(node_5, { name: 'star' });
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_6 = $.child(div_10);

	FeatureIcon(node_6, { name: 'circle' });
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_7 = $.child(div_11);

	FeatureIcon(node_7, { name: 'eye' });
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_8 = $.child(div_12);

	FeatureIcon(node_8, { name: 'box' });
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_9 = $.child(div_13);

	FeatureIcon(node_9, { name: 'heart' });
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_10 = $.child(div_14);

	FeatureIcon(node_10, { name: 'image' });
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var node_11 = $.child(div_15);

	FeatureIcon(node_11, { name: 'compass' });
	$.reset(div_15);
	$.reset(div_7);
	$.reset(div);
	$.template_effect(() => $.set_attribute(img, 'src', logo));
	$.append($$anchor, div);
}