if (x) { function a() {} }
function g() { "use strict"; if (x) { function b() {} } }
class C { m() { if (x) { function c() {} } } }
function h() { if (x) { function d() {} } }
const k = () => { "use strict"; if (x) { function e() {} } };
function l() { "use\x20strict"; if (x) { function f() {} } }
function n() { ("use strict"); if (x) { function i() {} } }
function o() { "a"; "use strict"; if (x) { function j() {} } }
