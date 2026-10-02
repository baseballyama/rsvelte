import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AudioListener } from 'three';
import { useThrelteAudio } from '../useThrelteAudio.js';
import { acquireAutoResume } from './autoResume.js';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'masterVolume',
	'autoResume',
	'ref',
	'children'
]);

export default function AudioListener_1($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const listener = new AudioListener();
	const audioContext = listener.context;
	const resumeContext = () => listener.context.resume();

	$.user_effect(() => {
		if ($$props.masterVolume !== undefined) {
			listener.setMasterVolume($$props.masterVolume);
		}
	});

	$.user_effect(() => {
		if (!$$props.autoResume) return;

		return acquireAutoResume(listener.context);
	});

	const { addAudioListener, removeAudioListener } = useThrelteAudio();

	$.user_pre_effect(() => {
		const currentId = $$props.id;

		return untrack(() => {
			addAudioListener(listener, currentId);

			return () => removeAudioListener(currentId);
		});
	});

	var $$exports = { audioContext, resumeContext };

	T($$anchor, $.spread_props(
		{
			get is() {
				return listener;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: listener }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	return $.pop($$exports);
}