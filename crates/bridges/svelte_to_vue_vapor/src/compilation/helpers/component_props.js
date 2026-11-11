// Vapor prop tables keep string keys, so attachments use a private transport field.
const $$component_props = (props) => {
  if (props == null) return {};
  const attachments = { ...props.__rsvelte_attachments };
  Object.getOwnPropertySymbols(props).forEach((key) => {
    if (key.description === '@attach') attachments[key] = props[key];
  });
  if (!Object.getOwnPropertySymbols(attachments).length) return props;
  return { ...props, __rsvelte_attachments: attachments };
};
