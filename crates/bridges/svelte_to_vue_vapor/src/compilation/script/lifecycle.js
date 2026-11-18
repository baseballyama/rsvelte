const $$on_mount = (callback) => {
  let cleanup;
  const mount = () => { cleanup = $$untrack(callback); };
  const deferred = $$v_currentInstance?.__rsvelte_async_mount;
  if (deferred) deferred.push(mount);
  else $$onMounted(mount);
  $$onScopeDispose(() => { if (typeof cleanup === 'function') cleanup(); });
};
const $$on_mount_server = () => {};
