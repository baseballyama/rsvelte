<script>
	let density = $state(2);
	let base = $state('/img');
</script>

<img
	src="{base}.png"
	srcset="{base}.png 1x, {base}@{density}x.png {density}x"
	sizes="(max-width: 600px) 100vw, 50vw"
	alt="dyn"
/>
<img srcset="/a.png 480w, /b.png 800w" sizes="100vw" alt="static" />
<link rel="preload" as="image" imagesrcset="/c.png 1x" />
