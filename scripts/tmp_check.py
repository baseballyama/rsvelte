import re
def norm(js):
    js = re.sub(r'[ \t\n]+', ' ', js)
    js = re.sub(r'\b(var|const)\b', 'let', js)
    return js.strip()
test = 'const-tag-shadow-2'
D = '/workspace/fixtures/04c0368aa8d8/runtime-legacy'
actual = norm(open(D+'/'+test+'/_actual/client.js').read())
expected = norm(open(D+'/'+test+'/client.js').read())
if actual == expected:
    print('PASS (no diff after norm)')
else:
    a = actual.split(' ')
    e = expected.split(' ')
    for i,(x,y) in enumerate(zip(a,e)):
        if x != y:
            print('first diff at',i,':',a[i-3:i+3],'vs',e[i-3:i+3])
            break
