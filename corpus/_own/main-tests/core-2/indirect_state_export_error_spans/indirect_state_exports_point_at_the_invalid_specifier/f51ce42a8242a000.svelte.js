let object = $state({ ok: true });
let primitive = $state('nope');
object.ok = false;
primitive = 'yep';
export { object, primitive };