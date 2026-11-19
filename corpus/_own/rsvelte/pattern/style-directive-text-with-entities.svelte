<script>
	let { rest, x } = $props();
</script>

<div
	style:--label="Tom &amp; Jerry"
	style:font-family='a "b" <c>'
	style:color="  red   &lt;  blue "
	style:--mixed="a &amp; {x} &lt; b"
></div>
<div {...rest} style:--label="Tom &amp; Jerry" style:font-family='a "b" <c>'></div>
<svelte:element this={'p'} style:--label="Tom &amp; Jerry"></svelte:element>
<div style:--imp|important="Tom &amp; Jerry"></div>
