const $$media_ranges = (ranges) => Array.from({ length: ranges.length }, (_, index) => ({ start: ranges.start(index), end: ranges.end(index) }));
const $$media_binding = (element, name, event, getter, setter, readonly) => {
  if (!$$lifecycle_once(element, 'bind:' + name)) return;
  const ranges = name === 'buffered' || name === 'played' || name === 'seekable';
  let previous;
  let frame;
  let initial = true;
  const update = () => {
    const value = ranges ? $$media_ranges(element[name]) : element[name];
    const equal = ranges ? name === 'buffered' && previous && previous.length === value.length && previous.every((range, index) => range.start === value[index].start && range.end === value[index].end) : Object.is(previous, value);
    if (!equal) { previous = value; setter(value); }
  };
  const tick = () => {
    cancelAnimationFrame(frame);
    if (!element.paused) frame = requestAnimationFrame(tick);
    update();
  };
  const events = event.split(' ');
  const listener = name === 'currentTime' ? tick : update;
  events.forEach((event) => element.addEventListener(event, listener));
  $$onScopeDispose(() => {
    events.forEach((event) => element.removeEventListener(event, listener));
    if (frame !== undefined) cancelAnimationFrame(frame);
  });
  if (readonly || ((name === 'volume' || name === 'muted' || name === 'paused') && getter() == null)) update();
  if (name === 'currentTime') frame = requestAnimationFrame(tick);
  if (!readonly) $$watchPostEffect(() => {
    const value = getter();
    if (name === 'paused') {
      const paused = !!value;
      if (paused !== element.paused) {
        if (paused) element.pause();
        else element.play().catch((error) => { setter(true); throw error; });
      }
    } else if (name === 'muted') {
      if (element.muted !== !!value) element.muted = !!value;
    } else {
      const number = Number(value);
      if (!Number.isNaN(number) && element[name] !== number) {
        element[name] = number;
        if (name === 'currentTime') previous = number;
      }
      if (name === 'playbackRate' && initial) { initial = false; update(); }
    }
  });
};
