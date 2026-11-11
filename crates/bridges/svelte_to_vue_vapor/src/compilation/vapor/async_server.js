const $$server_async_context = () => {
  let restore;
  return {
    suspend(value) {
      const context = $$v_withAsyncContext(() => value);
      restore = context[1];
      return context[0];
    },
    resume(value) { restore(); return value; }
  };
};
