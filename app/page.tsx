'use client';
import { DayPicker, DayButton } from 'react-day-picker';
import { ja } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Counts = Record<string, number>;

function isValidDate(d: any): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}

function fmtDate(d?: Date | null) {
  const dd = isValidDate(d) ? d! : new Date();
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, '0');
  const day = String(dd.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtMonth(d?: Date | null) {
  const dd = isValidDate(d) ? d! : new Date();
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function HomePage() {
  const router = useRouter();
  const [month, setMonth] = useState<Date>(new Date());
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    const ym = fmtMonth(month);
    fetch(`/api/entries/counts?month=${ym}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve({ counts: {} })))
      .then((j) => setCounts(j.counts || {}))
      .catch(() => setCounts({}));
  }, [month]);

  const todayStr = useMemo(() => fmtDate(new Date()), []);

    const CustomDayButton = (props: any) => {
    const d: Date = isValidDate(props?.date) ? (props.date as Date) : new Date();
    const str = fmtDate(d);
    const n = counts[str] || 0;
    const isToday = str === todayStr;
    return (
      <DayButton {...props}>
        <div style={{ position: 'relative' }} title={n ? `${n}件のエントリ` : ''}>
          <div style={{ fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</div>
          {n > 0 && (
            <span className="badge" style={{ position: 'absolute', top: 0, right: 0 }}>{n}</span>
          )}
        </div>
      </DayButton>
    );
  };

  const jaMonday = { ...ja, options: { ...ja.options, weekStartsOn: 1 as const } };
  const monthTotal = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  return (
    <div className="card calendar-full" style={{ gridColumn: '1 / -1' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="heading-serif" style={{ fontSize: '1.6rem', margin: '.2rem 0' }}>カレンダー</h2>
        <button className="btn primary" onClick={() => router.push(`/day/${todayStr}`)}>今日へ</button>
      </div>
      <div className="stack-tight" style={{ alignItems: 'center' }}>
        <DayPicker
          mode="single"
          month={month}
          onMonthChange={(m:any) => setMonth(isValidDate(m) ? m : new Date())}
          components={{ DayButton: CustomDayButton as any }}
          numberOfMonths={1}
          pagedNavigation={false}
          locale={jaMonday as any}
          modifiers={{ hasCount: (day) => !!counts[fmtDate(day)] }}
          modifiersClassNames={{ hasCount: 'rdp-hascount' }}
          onDayClick={(d) => router.push(`/day/${fmtDate(d)}`)}
        />
        
      </div>
    </div>
  );
}
