<script>
  let video = $state();
  let time = $state(0);
  let duration = $state();
  let volume = $state();
  let muted = $state();
  let paused = $state();
  let rate = $state();
  let buffered = $state();
  let seekable = $state();
  let played = $state();
  let seeking = $state();
  let ended = $state();
  let ready = $state();
  let width = $state();
  let height = $state();
  function inspect() { return `${video.currentTime}:${video.volume}:${video.muted}:${video.playbackRate}`; }
  let observed = $state('');
  function dispatch() { video.currentTime = 8; video.volume = 0.25; video.muted = false; video.playbackRate = 0.5; for (const event of ['timeupdate', 'volumechange', 'ratechange', 'durationchange', 'loadedmetadata', 'seeking', 'seeked', 'ended', 'resize']) video.dispatchEvent(new Event(event)); }
</script>
<video bind:this={video} bind:currentTime={time} bind:duration bind:volume bind:muted bind:paused bind:playbackRate={rate} bind:buffered bind:seekable bind:played bind:seeking bind:ended bind:readyState={ready} bind:videoWidth={width} bind:videoHeight={height}></video>
<button class="write" onclick={() => { time = 5; volume = 0.5; muted = true; rate = 2; }}>write</button>
<button class="inspect" onclick={() => observed = inspect()}>inspect</button>
<button class="event" onclick={dispatch}>event</button>
<p>{time}:{String(duration)}:{volume}:{muted}:{paused}:{rate}:{buffered?.length}:{seekable?.length}:{played?.length}:{seeking}:{ended}:{ready}:{width}:{height}:{observed}</p>
