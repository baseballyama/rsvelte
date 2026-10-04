const $$select = (element, value, setter) => {
  const mounting = element.$$mounted !== true;
  element.$$mounted = true;
  if (element.multiple) {
    if (mounting && value === undefined) setter($$option(element));
    else Array.from(element.options).forEach((option) => {
      option.selected = value != null && value.includes(option.value);
    });
    return;
  }
  const option = Array.from(element.options).find((option) => Object.is(option.value, value));
  if (option !== undefined) option.selected = true;
  else if (!mounting || value !== undefined) element.selectedIndex = -1;
  if (mounting && value === undefined) {
    const selected = element.querySelector(':checked');
    if (selected !== null) setter(selected.value);
  }
};
const $$selected = (value, option) => value != null && value.includes(option);
