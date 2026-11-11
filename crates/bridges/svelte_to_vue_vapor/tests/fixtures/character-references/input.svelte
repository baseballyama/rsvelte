<script>
  let count = $state(0);
</script>
<svelte:head><title>&fjlig; &copy; &#10; title</title></svelte:head>
<textarea>&fjlig;|&notit;|&amp=|<b>x</b></textarea>
<button onclick={() => count++}>change</button>
<p title="&notit;|&amp_|&amp=|&copy!|&#10;|&lbrace;|&fjlig;">&notit;|&amp_|&amp=|&copy!|&#10;|&lbrace;|&fjlig;|&unknown;</p>
<p title="{count}:&notit;|&amp_|&amp=|&copy!|&#10;|&lbrace;|&fjlig;">{count}:&notit;|&amp_|&amp=|&copy!|&#10;|&lbrace;|&fjlig;</p>
<p title="&#65suffix|&#x80|&#xD800;|&#x30000;|&#xE0100;|&#999999999999999999999;">&#65suffix|&#x80|&#xD800;|&#x30000;|&#xE0100;|&#999999999999999999999;</p>
<div><style>.raw::after { content: '&copy; &amp;'; }</style><span class="raw">&#0;|&#x0;|&#x;|&#;</span></div>
