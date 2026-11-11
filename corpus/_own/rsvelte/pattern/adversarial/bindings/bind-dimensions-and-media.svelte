<script>
  let clientWidth = $state(0);
  let clientHeight = $state(0);
  let offsetWidth = $state(0);
  let offsetHeight = $state(0);
  let contentRect = $state(null);
  let currentTime = $state(0);
  let paused = $state(true);
  let duration = $state(0);
  let volume = $state(1);
  let muted = $state(false);
  let playbackRate = $state(1);
  let seeking = $state(false);
  let ended = $state(false);
  let readyState = $state(0);
</script>

<div bind:clientWidth bind:clientHeight bind:offsetWidth bind:offsetHeight>
  a
</div>
<div bind:contentRect>b</div>

<video
  bind:currentTime
  bind:paused
  bind:duration
  bind:volume
  bind:muted
  bind:playbackRate
  bind:seeking
  bind:ended
  bind:readyState
>
  <track kind="captions" />
</video>

<b>{clientWidth}{clientHeight}{offsetWidth}{offsetHeight}</b>
<b>{currentTime}{paused}{duration}{volume}</b>
<b>{muted}{playbackRate}{seeking}{ended}{readyState}</b>
<b>{contentRect ? 1 : 0}</b>
