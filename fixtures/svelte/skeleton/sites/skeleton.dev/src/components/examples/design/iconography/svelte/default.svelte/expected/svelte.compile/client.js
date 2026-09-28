import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnchorIcon from '@lucide/svelte/icons/anchor';
import BellIcon from '@lucide/svelte/icons/bell';
import CameraIcon from '@lucide/svelte/icons/camera';
import CloudIcon from '@lucide/svelte/icons/cloud';
import CoffeeIcon from '@lucide/svelte/icons/coffee';
import CompassIcon from '@lucide/svelte/icons/compass';
import CrownIcon from '@lucide/svelte/icons/crown';
import FeatherIcon from '@lucide/svelte/icons/feather';
import FlameIcon from '@lucide/svelte/icons/flame';
import GemIcon from '@lucide/svelte/icons/gem';
import GhostIcon from '@lucide/svelte/icons/ghost';
import GiftIcon from '@lucide/svelte/icons/gift';
import HeartIcon from '@lucide/svelte/icons/heart';
import KeyIcon from '@lucide/svelte/icons/key';
import LeafIcon from '@lucide/svelte/icons/leaf';
import MoonIcon from '@lucide/svelte/icons/moon';
import MusicIcon from '@lucide/svelte/icons/music';
import RocketIcon from '@lucide/svelte/icons/rocket';
import SkullIcon from '@lucide/svelte/icons/skull';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import StarIcon from '@lucide/svelte/icons/star';
import SunIcon from '@lucide/svelte/icons/sun';
import SwordsIcon from '@lucide/svelte/icons/swords';
import UserRoundIcon from '@lucide/svelte/icons/user-round';
import ZapIcon from '@lucide/svelte/icons/zap';

var root = $.from_html(`<div class="grid grid-cols-5 gap-4 place-items-center"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Default($$anchor) {
	var div = root();
	var node = $.child(div);

	HeartIcon(node, { class: 'size-12' });

	var node_1 = $.sibling(node, 2);

	UserRoundIcon(node_1, { class: 'size-12' });

	var node_2 = $.sibling(node_1, 2);

	RocketIcon(node_2, { class: 'size-12' });

	var node_3 = $.sibling(node_2, 2);

	CrownIcon(node_3, { class: 'size-12' });

	var node_4 = $.sibling(node_3, 2);

	CompassIcon(node_4, { class: 'size-12' });

	var node_5 = $.sibling(node_4, 2);

	SparklesIcon(node_5, { class: 'size-12' });

	var node_6 = $.sibling(node_5, 2);

	FlameIcon(node_6, { class: 'size-12' });

	var node_7 = $.sibling(node_6, 2);

	LeafIcon(node_7, { class: 'size-12' });

	var node_8 = $.sibling(node_7, 2);

	MusicIcon(node_8, { class: 'size-12' });

	var node_9 = $.sibling(node_8, 2);

	GemIcon(node_9, { class: 'size-12' });

	var node_10 = $.sibling(node_9, 2);

	CameraIcon(node_10, { class: 'size-12' });

	var node_11 = $.sibling(node_10, 2);

	MoonIcon(node_11, { class: 'size-12' });

	var node_12 = $.sibling(node_11, 2);

	SkullIcon(node_12, { class: 'size-12' });

	var node_13 = $.sibling(node_12, 2);

	SunIcon(node_13, { class: 'size-12' });

	var node_14 = $.sibling(node_13, 2);

	FeatherIcon(node_14, { class: 'size-12' });

	var node_15 = $.sibling(node_14, 2);

	AnchorIcon(node_15, { class: 'size-12' });

	var node_16 = $.sibling(node_15, 2);

	KeyIcon(node_16, { class: 'size-12' });

	var node_17 = $.sibling(node_16, 2);

	BellIcon(node_17, { class: 'size-12' });

	var node_18 = $.sibling(node_17, 2);

	StarIcon(node_18, { class: 'size-12' });

	var node_19 = $.sibling(node_18, 2);

	GiftIcon(node_19, { class: 'size-12' });

	var node_20 = $.sibling(node_19, 2);

	CloudIcon(node_20, { class: 'size-12' });

	var node_21 = $.sibling(node_20, 2);

	CoffeeIcon(node_21, { class: 'size-12' });

	var node_22 = $.sibling(node_21, 2);

	ZapIcon(node_22, { class: 'size-12' });

	var node_23 = $.sibling(node_22, 2);

	GhostIcon(node_23, { class: 'size-12' });

	var node_24 = $.sibling(node_23, 2);

	SwordsIcon(node_24, { class: 'size-12' });
	$.reset(div);
	$.append($$anchor, div);
}