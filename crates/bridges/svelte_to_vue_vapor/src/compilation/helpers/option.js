const $$option = (element) => {
  if (element.multiple) return Array.from(element.querySelectorAll(':checked'), (option) => option.value);
  const option = element.querySelector(':checked') ?? element.querySelector('option:not([disabled])');
  return option && option.value;
};
