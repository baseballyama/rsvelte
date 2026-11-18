const $$create_attachment_key = () => Symbol('@attach');
const $$from_action = (action, parameter = () => undefined) => (element) => {
  const { update, destroy } = $$untrack(() => action(element, parameter())) ?? {};
  if (update) {
    let ran = false;
    $$watchEffect(() => $$tracked(() => {
      const value = parameter();
      if (ran) update(value);
      ran = true;
    }), { flush: 'pre' });
  }
  if (destroy) $$onScopeDispose(destroy);
};
