import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import EmblaCarousel from 'embla-carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { reelsService } from '$lib/core/services';
import { error } from '@sveltejs/kit';

var root = $.from_html(`<button class="absolute inset-0 flex items-center justify-center bg-black/50 text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></button>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h4v16H6zM14 4h4v16h-4z"></path></svg>`);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"></path></svg>`);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M23 9l-6 6"></path><path d="M17 9l6 6"></path></svg>`);
var root_4 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`);
var root_5 = $.from_html(`<div class="relative h-full w-full snap-y snap-mandatory snap-always"><div class="absolute inset-0 flex items-center justify-center"><video class="h-full w-full object-cover" loop="" playsinline=""><track kind="captions"/></video> <!> <div class="absolute bottom-20 right-4 flex flex-col gap-4"><button class="rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/30"><!></button> <button class="rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/30"><!></button></div> <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white"><h3 class="text-lg font-semibold"> </h3> <p class="text-sm opacity-90"> </p></div></div></div>`, 2);
var root_6 = $.from_html(`<!> <div class="fixed inset-0 bg-black"><h1 class="sr-only">Fashion Reels</h1> <div class="relative h-full w-full"><div class="h-full"></div></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let reels = $.state($.proxy([]));
	let emblaNode;
	let emblaApi;
	let videos = $.state($.proxy([]));
	let currentIndex = $.state(0);
	let isPlaying = $.state(true);
	let isMuted = $.state(true);

	// Function to handle video playback
	function handleVideoPlayback(index) {
		$.get(videos).forEach((video, i) => {
			if (i === index) {
				if ($.get(isPlaying)) {
					video.play().catch(() => {
						// Autoplay prevented, add a play button
						video.dataset.needsUserAction = 'true';
					});
				} else {
					video.pause();
				}
			} else {
				video.pause();
				video.currentTime = 0;
			}
		});
	}

	function togglePlay() {
		$.set(isPlaying, !$.get(isPlaying));
		handleVideoPlayback($.get(currentIndex));
	}

	function toggleMute() {
		$.set(isMuted, !$.get(isMuted));

		$.get(videos).forEach((video) => {
			video.muted = $.get(isMuted);
		});
	}

	const load = async () => {
		try {
			// For development, return sample data
			// In production, uncomment the following line:
			const reelsdata = await reelsService.list();

			$.set(reels, reelsdata.data, true);
		} catch(e) {
			console.error('Error loading reels:', e);

			throw error(400, e instanceof Error && e.message || 'Error loading reels');
		}
	};

	onMount(() => {
		// Initialize Embla Carousel
		emblaApi = EmblaCarousel(
			emblaNode,
			{
				axis: 'y',
				loop: true,
				dragFree: false, // Disable dragFree for better snapping
				containScroll: 'trimSnaps',
				skipSnaps: false, // Ensure it always snaps to slides
				duration: 20, // Faster snap animation
				startIndex: 0,
				align: 'center'
			},
			[WheelGesturesPlugin(), AutoScroll({ playOnInit: false })]
		);

		// Get all video elements
		$.set(videos, Array.from(emblaNode.querySelectorAll('video')), true);

		// Handle slide changes
		emblaApi.on('select', (api) => {
			$.set(currentIndex, api.selectedScrollSnap(), true);
			handleVideoPlayback($.get(currentIndex));
		});

		load();

		// Start with the first video
		handleVideoPlayback(0);

		return () => {
			if (emblaApi) emblaApi.destroy();
		};
	});

	// Handle manual play button click
	function handlePlayClick(video) {
		video.play();
		video.dataset.needsUserAction = 'false';
	}

	var fragment = root_6();
	var node = $.first_child(fragment);

	SeoHeader(node, { metaTitle: 'Reels | Shop Your Fashion' });

	var div = $.sibling(node, 2);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $.get(reels), $.index, ($$anchor, reel) => {
		var div_3 = root_5();
		var div_4 = $.child(div_3);
		var video_1 = $.child(div_4);
		var node_1 = $.sibling(video_1, 2);

		{
			var consequent = ($$anchor) => {
				var button = root();

				$.delegated('click', button, () => handlePlayClick($.get(videos)[$.get(currentIndex)]));
				$.append($$anchor, button);
			};

			$.if(node_1, ($$render) => {
				if ($.get(videos)[$.get(currentIndex)]?.dataset?.needsUserAction) $$render(consequent);
			});
		}

		var div_5 = $.sibling(node_1, 2);
		var button_1 = $.child(div_5);
		var node_2 = $.child(button_1);

		{
			var consequent_1 = ($$anchor) => {
				var svg = root_1();

				$.append($$anchor, svg);
			};

			var alternate = ($$anchor) => {
				var svg_1 = root_2();

				$.append($$anchor, svg_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(isPlaying)) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.reset(button_1);

		var button_2 = $.sibling(button_1, 2);
		var node_3 = $.child(button_2);

		{
			var consequent_2 = ($$anchor) => {
				var svg_2 = root_3();

				$.append($$anchor, svg_2);
			};

			var alternate_1 = ($$anchor) => {
				var svg_3 = root_4();

				$.append($$anchor, svg_3);
			};

			$.if(node_3, ($$render) => {
				if ($.get(isMuted)) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.reset(button_2);
		$.reset(div_5);

		var div_6 = $.sibling(div_5, 2);
		var h3 = $.child(div_6);
		var text = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_6);
		$.reset(div_4);
		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(video_1, 'src', $.get(reel).link);
			video_1.muted = $.get(isMuted);
			$.set_text(text, $.get(reel).name);
			$.set_text(text_1, $.get(reel).productId);
		});

		$.delegated('click', video_1, (e) => {
			const target = e.target;

			if (target instanceof HTMLVideoElement && target.dataset.needsUserAction) {
				handlePlayClick(target);
			}
		});

		$.delegated('click', button_1, togglePlay);
		$.delegated('click', button_2, toggleMute);
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => emblaNode = $$value, () => emblaNode);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);