import * as $ from 'svelte/internal/server';

export default function Recorder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			codec = 'video/mp4;codecs="vp9,opus"',
			fps = 60,
			videoBitrate = 2500,
			audioBitrate = 320,
			systemAudio = true,
			useMicrophone = true,
			useTimer = true
		} = $$props;

		let recorder = 'ready';
		let videoStream;
		let audioStream;
		let mediaRecorder;
		let chunks = [];
		let timer;
		let seconds = 3;

		function kbpsToBits(kbps) {
			return kbps * 1000;
		}

		async function getMediaStream() {
			try {
				videoStream = await navigator.mediaDevices.getDisplayMedia({
					video: { frameRate: fps },
					audio: true,
					selfBrowserSurface: 'include',
					systemAudio: systemAudio ? 'include' : 'exclude'
				});

				videoStream.oninactive = stopRecording;

				if (useMicrophone) {
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

			if (useTimer) {
				await countdown();
			}

			recorder = 'recording';

			mediaRecorder = new MediaRecorder(videoStream, {
				mimeType: codec,
				videoBitsPerSecond: kbpsToBits(videoBitrate),
				audioBitsPerSecond: kbpsToBits(audioBitrate)
			});

			mediaRecorder.ondataavailable = (e) => {
				chunks.push(e.data);
				download();
			};

			mediaRecorder.start();
		}

		function stopRecording() {
			recorder = 'ready';
			mediaRecorder?.stop();
			clearInterval(timer);
			seconds = 3;
		}

		function countdown() {
			recorder = 'ready.countdown';

			let { promise, resolve } = Promise.withResolvers();

			timer = setInterval(
				() => {
					if (seconds === 0) {
						clearInterval(timer);
						resolve(seconds);

						return;
					}

					seconds--;
				},
				1000
			);

			return promise;
		}

		function download() {
			const blob = new Blob(chunks, { type: codec });
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
					recorder === 'ready' && startRecording();
					break;

				case 'S':
					recorder !== 'ready' && stopRecording();
					break;
			}
		}

		if (recorder.includes('ready')) {
			$$renderer.push(`<!--[0--><div class="recorder svelte-1aujns6"${$.attr('data-state', recorder)}><button class="record svelte-1aujns6"><div class="circle svelte-1aujns6">`);

			if (recorder === 'ready.countdown') {
				$$renderer.push(`<!--[0-->${$.escape(seconds)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></button> <div class="info svelte-1aujns6">`);

			if (recorder === 'ready') {
				$$renderer.push(`<!--[0--><p class="shortcut svelte-1aujns6">Shift + R</p> <p class="description svelte-1aujns6">To start recording</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (recorder === 'ready.countdown') {
				$$renderer.push(`<!--[0--><p class="shortcut svelte-1aujns6">Shift + S</p> <p class="description svelte-1aujns6">To stop recording</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}