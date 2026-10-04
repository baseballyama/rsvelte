import ctypes,json,subprocess,signal,statistics,hashlib,argparse
from pathlib import Path

def main():
 parser=argparse.ArgumentParser();parser.add_argument('manifest',type=Path);parser.add_argument('output',type=Path);parser.add_argument('--before',required=True);parser.add_argument('--after');parser.add_argument('--phases',default='total,parse,hir,resolve,analyze,identity,emit');parser.add_argument('--rounds',type=int,default=20);args=parser.parse_args()
 out=args.output;out.mkdir(parents=True,exist_ok=True);population=len(args.manifest.read_text().splitlines());assert population>0
 bridge=Path(__file__).resolve().parents[2] / 'process-counters.c'
 subprocess.run(['cc','-O2','-Wall','-Wextra','-Werror','-dynamiclib',str(bridge),'-lproc','-o',str(out/'counters.dylib')],check=True)
 lib=ctypes.CDLL(str(out/'counters.dylib'),use_errno=True);lib.read_process_counters.argtypes=[ctypes.c_int,ctypes.POINTER(ctypes.c_uint64)];lib.read_process_counters.restype=ctypes.c_int
 def counters(pid):
  values=(ctypes.c_uint64*2)();assert lib.read_process_counters(pid,values)==0;assert values[0]>0 and values[1]>0;return dict(cycles=values[0],instructions=values[1])
 def timeout(_signal,_frame):raise TimeoutError('worker gate timed out')
 signal.signal(signal.SIGALRM,timeout)
 commands={'before':args.before};
 if args.after:commands['after']=args.after
 rows=[]
 def run(arm,phase,rounds):
  index=len(rows);command=[commands[arm],str(args.manifest),phase,str(rounds)]
  with (out/f'{index:02d}-{arm}-{phase}.log').open('w') as log:
   proc=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=log,text=True);signal.alarm(180)
   try:
    assert proc.stdout.readline().strip()=='RSVELTE_CYCLE_GATE',command
    before=counters(proc.pid);proc.stdin.write('g');proc.stdin.flush()
    assert proc.stdout.readline().strip()=='RSVELTE_CYCLE_GATE',command
    after=counters(proc.pid);proc.stdin.write('g');proc.stdin.flush();raw=proc.stdout.read();proc.wait(timeout=180)
    assert proc.returncode==0,(command,proc.returncode)
   finally:
    signal.alarm(0)
    if proc.poll() is None:proc.kill();proc.wait()
  data=json.loads(raw);assert data['documents']==population and data['rounds']==rounds and data['phase']==phase
  row={'arm':arm,'trial':index,**data,'before':before,'after':after,**{key:after[key]-before[key] for key in before}}
  assert row['cycles']>0 and row['instructions']>0
  rows.append(row);(out/f'{index:02d}-{arm}-{phase}.json').write_text(json.dumps(row,indent=2)+'\n')
  print(arm,phase,rounds,row['cycles'],row['instructions'],flush=True)
 phases=args.phases.split(',')
 for phase in phases:
  for arm in commands:run(arm,phase,0)
  sequence=['before','after','after','before']*2 if args.after else ['before']*4
  for arm in sequence:run(arm,phase,args.rounds)
 summary={}
 for phase in phases:
  summary[phase]={}
  for arm in commands:
   control=next(row for row in rows if row['arm']==arm and row['phase']==phase and row['rounds']==0)
   data=[row for row in rows if row['arm']==arm and row['phase']==phase and row['rounds']>0]
   assert all(row['cycles']>control['cycles'] for row in data)
   assert len({row['checksum'] for row in data})==1
   summary[phase][arm]={key:{'median_per_input':statistics.median(row[key]/row['rounds']/population for row in data),'min_per_input':min(row[key]/row['rounds']/population for row in data),'max_per_input':max(row[key]/row['rounds']/population for row in data)} for key in ['cycles','instructions']}
 result={'method':'proc_pid_rusage RUSAGE_INFO_V4 between stdin gates; destruction included','warmup_rounds':20,'measured_rounds':args.rounds,'population':population,'manifest_sha256':hashlib.sha256(args.manifest.read_bytes()).hexdigest(),'binary_sha256':{arm:hashlib.sha256(Path(command).read_bytes()).hexdigest() for arm,command in commands.items()},'rows':rows,'summary':summary}
 (out/'results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(summary,indent=2),flush=True)
if __name__=='__main__':main()
