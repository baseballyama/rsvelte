<script>
  let src = $state("a.mp4");
</script>

<audio controls preload="none" {src}>
  <source src="a.ogg" type="audio/ogg" />
  <track kind="captions" srclang="en" label="en" default />
</audio>

<video controls muted playsinline poster="p.png" width="10" height="10">
  <source {src} type="video/mp4" />
  <track kind="subtitles" src="s.vtt" srclang="en" />
</video>

<iframe
  title="f"
  src="about:blank"
  loading="lazy"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
></iframe>
<object type="text/html" data="about:blank"><param name="a" value="1" /></object
>
<canvas width="10" height="10"></canvas>
<map name="m"><area shape="rect" coords="0,0,1,1" alt="a" href="/a" /></map>
<img
  src="a.png"
  alt="a"
  srcset="a.png 1x, b.png 2x"
  sizes="(min-width: 1px) 1px, 2px"
  loading="lazy"
  decoding="async"
/>
