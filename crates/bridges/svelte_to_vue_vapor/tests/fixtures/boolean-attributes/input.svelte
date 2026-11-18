<script>
  let index = $state(1);
  const values = [false, true, '', null, 0, 1, 'false'];
  let value = $derived(values[index]);
  let video = $state();
</script>
<button onclick={() => index = (index + 1) % values.length}>next</button>
<p hidden={value}>hidden</p>
<p hidden={index % 2 ? 'until-found' : false}>findable</p>
<details open={value}><summary>details</summary>body</details>
<input type="checkbox" checked={value} required={value} readonly={value} />
<input multiple={value} webkitdirectory={value} />
<div inert={value}>inert</div>
<video bind:this={video} muted={value} playsinline={value} disablepictureinpicture={value} disableremoteplayback={value}></video>
<video muted></video>
<output>{index}:{video?.muted ?? 'none'}</output>
