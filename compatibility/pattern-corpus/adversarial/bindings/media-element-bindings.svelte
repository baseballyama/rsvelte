<script>
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);
  let ended = $state(false);
  let playbackRate = $state(1);
  let volume = $state(1);
  let muted = $state(false);
  let seeking = $state(false);
  let readyState = $state(0);
  let played = $state(null);
  let buffered = $state(null);
  let seekable = $state(null);
  let videoWidth = $state(0);
  let videoHeight = $state(0);
</script>

<video
  bind:currentTime
  bind:duration
  bind:paused
  bind:ended
  bind:playbackRate
  bind:volume
  bind:muted
  bind:seeking
  bind:readyState
  bind:played
  bind:buffered
  bind:seekable
  bind:videoWidth
  bind:videoHeight
>
  <track kind="captions" />
</video>

<audio bind:currentTime bind:duration bind:paused bind:volume bind:muted
></audio>

<b>{currentTime}{duration}{paused}{ended}{playbackRate}</b>
<b>{volume}{muted}{seeking}{readyState}</b>
<b>{played ? 1 : 0}{buffered ? 1 : 0}{seekable ? 1 : 0}</b>
<b>{videoWidth}{videoHeight}</b>
