"""Import a private ICS/ZIP snapshot locally; never change Google events."""
import argparse,json,re,zipfile,os,tempfile
from pathlib import Path
from datetime import datetime,date,timedelta,timezone
from zoneinfo import ZoneInfo
MAX=10_000_000

def parse_documents(docs):
    items=[];warnings=[];seen=set()
    def stamp(value,params):
        if params.get('VALUE')=='DATE' or len(value)==8:
            return datetime.strptime(value,'%Y%m%d').date().isoformat(),True
        instant=datetime.strptime(value.rstrip('Z'),'%Y%m%dT%H%M%S')
        instant=instant.replace(tzinfo=timezone.utc if value.endswith('Z') else ZoneInfo(params.get('TZID','America/Sao_Paulo')))
        return instant.isoformat(),False
    for n,text in enumerate(docs):
        row=None
        for line in re.sub(r'\r?\n[ \t]','',text).splitlines():
            if line=='BEGIN:VEVENT':row={};continue
            if line=='END:VEVENT' and row is not None:
                try:
                    if 'RRULE' in row or 'RECURRENCE-ID' in row:
                        warnings.append('Eventos recorrentes não expandidos nesta importação.');row=None;continue
                    if row.get('STATUS',('',{}))[0]=='CANCELLED':row=None;continue
                    start,all_day=stamp(*row['DTSTART']);end=None
                    if 'DTEND' in row:end,_=stamp(*row['DTEND'])
                    elif all_day:end=(date.fromisoformat(start)+timedelta(days=1)).isoformat()
                    uid=row.get('UID',(str(len(items)),{}))[0];key=(n,uid)
                    if key not in seen:
                        summary=row.get('SUMMARY',('Sem título',{}))[0]
                        summary=re.sub(r'\\([nN,;\\])',lambda m:'\n' if m[1].lower()=='n' else m[1],summary)
                        items.append({'id':str(n)+':'+uid,'title':summary[:4000],'start':start,'end':end,'all_day':all_day});seen.add(key)
                except (ValueError,KeyError) as error:warnings.append('Evento ignorado: data ou fuso não reconhecido.')
                row=None;continue
            if row is not None and ':' in line:
                left,value=line.split(':',1);fields=left.split(';');params=dict(x.split('=',1) for x in fields[1:] if '=' in x);row[fields[0]]=(value,params)
    return {'version':1,'imported_at':datetime.now(timezone.utc).isoformat(),'events':sorted(items,key=lambda x:x['start']),'warnings':list(dict.fromkeys(warnings)),'live_sync':False}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('source');args=parser.parse_args();source=Path(args.source)
    if source.stat().st_size>MAX:raise ValueError('Arquivo excede 10 MB')
    if zipfile.is_zipfile(source):
        with zipfile.ZipFile(source) as archive:
            entries=[x for x in archive.infolist() if x.filename.lower().endswith('.ics')]
            if sum(x.file_size for x in entries)>MAX:raise ValueError('Agenda expandida excede 10 MB')
            docs=[archive.read(x).decode('utf-8-sig') for x in entries]
    else:docs=[source.read_text(encoding='utf-8-sig')]
    if not docs:raise ValueError('Nenhuma agenda ICS encontrada')
    result=parse_documents(docs);directory=Path(__file__).resolve().parents[2]/'runtime/calendar';directory.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(dir=directory,suffix='.tmp')
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as handle:json.dump(result,handle,ensure_ascii=False)
        os.replace(name,directory/'snapshot.json')
    finally:
        if Path(name).exists():Path(name).unlink()
    print(json.dumps({'imported':len(result['events']),'warnings':len(result['warnings']),'live_sync':False}))
if __name__=='__main__':main()
