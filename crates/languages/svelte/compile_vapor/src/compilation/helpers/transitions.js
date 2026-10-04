let $$transition_context = null;
const $$transition_controllers = new WeakMap();
const $$transition_visit = (block, callback) => {
  if (block instanceof Element) {
    callback(block);
    block.querySelectorAll('*').forEach(callback);
  } else if (Array.isArray(block)) {
    block.forEach((child) => $$transition_visit(child, callback));
  } else if (block && !(block instanceof Node)) {
    $$transition_visit(block.nodes ?? block.block, callback);
  }
};
const $$transition_pause = (root, paused) => {
  if (paused) root.effects.pause();
  else root.effects.resume();
  root.children.forEach((child) => $$transition_pause(child, paused));
};
const $$transition_branch = (render, key) => {
  const owner = $$transition_context;
  const roots = new Map();
  let disposed = false;
  $$onScopeDispose(() => {
    disposed = true;
    roots.forEach((root) => root.destroy());
    roots.clear();
  });
  const branch = (...args) => {
    const identity = key ? key() : args.length ? args : render;
    const previous = roots.get(identity);
    if (previous?.leaving) {
      previous.leaving = false;
      previous.version++;
      $$transition_pause(previous, false);
      previous.active.forEach((controller) => controller.enter());
      return previous;
    }
    const initializing = $$transition_context;
    const parent = initializing ?? owner;
    const root = Object.assign(new $$v_VaporFragment(null), {
      nodes: null,
      effects: $$effectScope(true),
      children: new Set(),
      active: [],
      intro: !initializing,
      leaving: false,
      version: 0,
      destroy() {
        root.version++;
        root.active.forEach((controller) => controller.stop());
        root.effects.stop();
        parent?.children.delete(root);
        roots.delete(identity);
      },
      remove(container) {
        if (disposed) {
          root.destroy();
          $$v_remove(root.nodes, container);
          return;
        }
        root.leaving = true;
        $$transition_pause(root, true);
        const version = ++root.version;
        const controllers = [];
        $$transition_visit(root.nodes, (element) => {
          ($$transition_controllers.get(element) ?? []).forEach((controller) => {
            if (controller.root === root || controller.global) controllers.push(controller);
          });
        });
        root.active = controllers;
        let remaining = controllers.length;
        const finish = () => {
          if (version !== root.version || !root.leaving) return;
          remaining--;
          if (remaining > 0) return;
          root.destroy();
          $$v_remove(root.nodes, container);
        };
        if (!remaining) finish();
        else controllers.forEach((controller) => controller.leave(finish));
      }
    });
    roots.set(identity, root);
    parent?.children.add(root);
    $$transition_context = root;
    try {
      root.nodes = root.effects.run(() => render(...args));
    } finally {
      $$transition_context = initializing;
    }
    return root;
  };
  Object.defineProperty(branch, 'length', { value: render.length });
  return branch;
};
const $$transition_keyed = (getKey, render) => {
  let key;
  return $$v_createKeyedFragment(() => key = getKey(), $$transition_branch(render, () => key));
};
const $$transition_frame_ms = 1000 / 60;
const $$transition_keyframe = (css) => {
  const style = document.createElement('div').style;
  style.cssText = css;
  const frame = {};
  Array.from(style).forEach((name) => {
    const key = name.startsWith('--') ? name
      : name === 'float' ? 'cssFloat'
      : name === 'offset' ? 'cssOffset'
      : name.split('-').map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
    frame[key] = style.getPropertyValue(name);
  });
  return frame;
};
const $$transition_motion = (element, config, counterpart, destination, start, finish) => {
  let active = true;
  let completing = true;
  let animation;
  let frame;
  let progress = () => 1 - destination;
  const motion = {
    position: () => progress(),
    deactivate() { completing = false; },
    stop() {
      active = false;
      cancelAnimationFrame(frame);
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        animation.effect = null;
      }
    }
  };
  counterpart?.deactivate();
  queueMicrotask(() => {
    if (!active) return;
    if (typeof config === 'function') config = config({ direction: destination ? 'in' : 'out' });
    const { delay = 0, duration = 0, easing = (value) => value, css, tick } = config ?? {};
    const initial = counterpart ? counterpart.position() : 1 - destination;
    if (!delay && !duration) {
      counterpart?.stop();
      progress = () => destination;
      start();
      tick?.(destination, 1 - destination);
      if (completing) finish();
      return;
    }
    const delayed = [];
    if (destination && !counterpart) {
      tick?.(0, 1);
      if (css) {
        const frame = $$transition_keyframe(css(0, 1));
        delayed.push(frame, frame);
      }
    }
    animation = element.animate(delayed, { duration: delay, fill: 'forwards' });
    animation.onfinish = () => {
      if (!active) return;
      animation.cancel();
      const from = counterpart ? counterpart.position() : initial;
      counterpart?.stop();
      const length = duration * Math.abs(destination - from);
      const frames = [];
      if (css && length) {
        const count = Math.ceil(length / $$transition_frame_ms);
        for (let index = 0; index <= count; index++) {
          const value = from + (destination - from) * easing(index / count);
          frames.push($$transition_keyframe(css(value, 1 - value)));
        }
      }
      animation = element.animate(frames, { duration: length, fill: 'forwards' });
      progress = () => length ? from + (destination - from) * easing(Math.min(1, Number(animation.currentTime) / length)) : destination;
      start();
      const update = () => {
        if (!active || animation.playState !== 'running') return;
        const value = progress();
        tick?.(value, 1 - value);
        frame = requestAnimationFrame(update);
      };
      if (tick) frame = requestAnimationFrame(update);
      animation.onfinish = () => {
        progress = () => destination;
        tick?.(destination, 1 - destination);
        if (completing) finish();
      };
    };
  });
  return motion;
};
const $$transition = (element, key, getFunction, getParameter, intro, outro, global) => {
  if (!$$lifecycle_once(element, key)) return;
  const root = $$transition_context;
  const direction = intro && outro ? 'both' : intro ? 'in' : 'out';
  const inert = element.inert;
  let options;
  let entering;
  let leaving;
  const configuration = () => options ??= $$untrack(() => getFunction()(element, getParameter(), { direction }));
  const event = (name) => $$untrack(() => element.dispatchEvent(new CustomEvent(name)));
  const controller = {
    root,
    global,
    enter() {
      element.inert = inert;
      if (!intro) {
        leaving?.stop();
        return;
      }
      if (!outro) entering?.stop();
      entering = $$transition_motion(element, configuration(), leaving, 1,
        () => event('introstart'), () => {
          event('introend');
          entering?.stop();
          entering = options = undefined;
        });
    },
    leave(done) {
      if (!outro) { done(); return; }
      element.inert = true;
      leaving = $$transition_motion(element, configuration(), intro ? entering : undefined, 0,
        () => event('outrostart'), () => { event('outroend'); done(); });
    },
    stop() { entering?.stop(); leaving?.stop(); }
  };
  const controllers = $$transition_controllers.get(element) ?? [];
  controllers.push(controller);
  $$transition_controllers.set(element, controllers);
  $$onScopeDispose(() => {
    controller.stop();
    $$transition_controllers.delete(element);
  });
  if (intro && (global || root?.intro)) $$v_queuePostFlushCb(() => controller.enter());
};
