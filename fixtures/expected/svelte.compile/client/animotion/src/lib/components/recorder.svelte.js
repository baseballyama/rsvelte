import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="shortcut svelte-1aujns6">Shift + R</p> <p class="description svelte-1aujns6">To start recording</p>`, 1);
var root_1 = $.from_html(`<p class="shortcut svelte-1aujns6">Shift + S</p> <p class="description svelte-1aujns6">To stop recording</p>`, 1);
var root_2 = $.from_html(`<div class="recorder svelte-1aujns6"><button class="record svelte-1aujns6"><div class="circle svelte-1aujns6"><!></div></button> <div class="info svelte-1aujns6"><!> <!></div></div>`);

export default function Recorder($$anchor, $$props) {
	$.push($$props, true);

	let codec = $.prop($$props, 'codec', 3, 'video/mp4;codecs="vp9,opus"'),
		fps = $.prop($$props, 'fps', 3, 60),
		videoBitrate = $.prop($$props, 'videoBitrate', 3, 2500),
		audioBitrate = $.prop($$props, 'audioBitrate', 3, 320),
		systemAudio = $.prop($$props, 'systemAudio', 3, true),
		useMicrophone = $.prop($$props, 'useMicrophone', 3, true),
		useTimer = $.prop($$props, 'useTimer', 3, true);

	let recorder = $.state('ready');
	let videoStream;
	let audioStream;
	let mediaRecorder;
	let chunks = [];
	let timer;
	let seconds = $.state(3);

	function kbpsToBits(kbps) {
		return kbps * 1000;
	}

	async function getMediaStream() {
		try {
			videoStream = await navigator.mediaDevices.getDisplayMedia({
				video: { frameRate: fps() },
				audio: true,
				selfBrowserSurface: 'include',
				systemAudio: systemAudio() ? 'include' : 'exclude'
			});

			videoStream.oninactive = stopRecording;

			if (useMicrophone()) {
				audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

				const [microphone] = audioStream.getAudioTracks();

				videoStream.addTrack(microphone);
			}

			audioStream.oninactive = stopRecording;
		} catch(e) {
			console.error(e);
		}
	}

	async function startRecording() {
		await getMediaStream();

		if (useTimer()) {
			await countdown();
		}

		$.set(recorder, 'recording');

		mediaRecorder = new MediaRecorder(videoStream, {
			mimeType: codec(),
			videoBitsPerSecond: kbpsToBits(videoBitrate()),
			audioBitsPerSecond: kbpsToBits(audioBitrate())
		});

		mediaRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
			download();
		};

		mediaRecorder.start();
	}

	function stopRecording() {
		$.set(recorder, 'ready');
		mediaRecorder?.stop();
		clearInterval(timer);
		$.set(seconds, 3);
	}

	function countdown() {
		$.set(recorder, 'ready.countdown');

		let { promise, resolve } = Promise.withResolvers();

		timer = setInterval(
			() => {
				if ($.get(seconds) === 0) {
					clearInterval(timer);
					resolve($.get(seconds));

					return;
				}

				$.update(seconds, -1);
			},
			1000
		);

		return promise;
	}

	function download() {
		const blob = new Blob(chunks, { type: codec() });
		const a = document.createElement('a');

		a.href = URL.createObjectURL(blob);
		a.download = 'video.mp4';
		a.click();
		URL.revokeObjectURL(a.href);
		chunks = [];
	}

	function handleKeydown(event) {
		switch (event.key) {
			case 'R':
				$.get(recorder) === 'ready' && startRecording();
				break;

			case 'S':
				$.get(recorder) !== 'ready' && stopRecording();
				break;
		}
	}

	var fragment = $.comment();

	$.event('keydown', $.window, handleKeydown);

	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var div = root_2();
			var button = $.child(div);
			var div_1 = $.child(button);
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(seconds)));
					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if ($.get(recorder) === 'ready.countdown') $$render(consequent);
				});
			}

			$.reset(div_1);
			$.reset(button);

			var div_2 = $.sibling(button, 2);
			var node_2 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(recorder) === 'ready') $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = root_1();

					$.next(2);
					$.append($$anchor, fragment_3);
				};

				$.if(node_3, ($$render) => {
					if ($.get(recorder) === 'ready.countdown') $$render(consequent_2);
				});
			}

			$.reset(div_2);
			$.reset(div);
			$.template_effect(() => $.set_attribute(div, 'data-state', $.get(recorder)));
			$.delegated('click', button, startRecording);
			$.append($$anchor, div);
		};

		var d = $.derived(() => $.get(recorder).includes('ready'));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);