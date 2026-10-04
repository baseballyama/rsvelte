const $$number = (value) => value === '' ? null : +value;
const $$number_value = (element, value, setter) => {
  if (!element.$$number_mounted) {
    element.$$number_mounted = true;
    if (value == null && element.value !== '') {
      value = $$number(element.value);
      setter(value);
    }
  }
  if (value !== $$number(element.value)) element.value = value == null ? '' : value;
};
