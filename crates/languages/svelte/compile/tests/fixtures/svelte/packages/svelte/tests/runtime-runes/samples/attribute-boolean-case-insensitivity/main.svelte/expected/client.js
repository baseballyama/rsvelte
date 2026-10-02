import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<script></script> <form></form> <input/> <select></select> <button></button> <img/> <video></video> <audio></audio> <track/> <iframe></iframe> <details></details> <ol></ol> <div></div> <span></span>`, 3));

export default function Main($$anchor) {
	let runesMode = 'using a rune so that we trigger runes mode';
	const attributeValues = [true, 'test', false];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => attributeValues, $.index, ($$anchor, val) => {
		var fragment_1 = root();
		var script = $.first_child(fragment_1);
		var form = $.sibling(script, 2);
		var input = $.sibling(form, 2);
		var select = $.sibling(input, 2);
		var button = $.sibling(select, 2);
		var img = $.sibling(button, 2);
		var video = $.sibling(img, 2);
		var audio = $.sibling(video, 2);
		var track = $.sibling(audio, 2);
		var iframe = $.sibling(track, 2);
		var details = $.sibling(iframe, 2);
		var ol = $.sibling(details, 2);
		var div = $.sibling(ol, 2);

		$.autofocus(div, $.get(val));

		var span = $.sibling(div, 2);

		$.template_effect(() => {
			script.noModule = $.get(val);
			script.async = $.get(val);
			script.defer = $.get(val);
			form.noValidate = $.get(val);
			input.readOnly = $.get(val);
			input.required = $.get(val);
			$.set_checked(input, $.get(val));
			input.webkitdirectory = $.get(val);
			select.multiple = $.get(val);
			select.disabled = $.get(val);
			button.formNoValidate = $.get(val);
			img.isMap = $.get(val);
			video.autoplay = $.get(val);
			video.controls = $.get(val);
			video.loop = $.get(val);
			video.muted = $.get(val);
			video.playsInline = $.get(val);
			video.disablePictureInPicture = $.get(val);
			video.disableRemotePlayback = $.get(val);
			audio.disableRemotePlayback = $.get(val);
			track.default = $.get(val);
			iframe.allowFullscreen = $.get(val);
			details.open = $.get(val);
			ol.reversed = $.get(val);
			span.inert = $.get(val);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}