import type { PimClass, PimRecord, View, LayoutItem, Field } from '@/types'

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return val
  }
}

function renderMultiple(value: unknown, refClass: PimClass | undefined): string {
  if (!Array.isArray(value) || value.length === 0) return '<span style="color:#9CA3AF">—</span>'
  if (!refClass) return '<span style="color:#9CA3AF">—</span>'
  const rows = value as Record<string, unknown>[]
  const cols = refClass.fields
  const headerCells = cols.map((f: Field) =>
    `<th style="text-align:left;padding:6px 12px 6px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;border-bottom:1px solid #D4ECF9;white-space:nowrap">${esc(f.name)}</th>`,
  ).join('')
  const bodyRows = rows.map((block) => {
    const cells = cols.map((f: Field) =>
      `<td style="padding:7px 12px 7px 0;font-size:13px;color:#374151;border-bottom:1px solid #EEF7FD;vertical-align:top">${esc(String(block[String(f.id)] ?? '—'))}</td>`,
    ).join('')
    return `<tr>${cells}</tr>`
  }).join('')
  return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
}

function renderValue(type: string, value: unknown, allClasses?: PimClass[], referencedClassId?: number): string {
  if (value === null || value === undefined || value === '') {
    return '<span style="color:#9CA3AF">—</span>'
  }

  if (type === 'multiple') {
    const refClass = allClasses?.find((c) => c.id === referencedClassId)
    return renderMultiple(value, refClass)
  }

  switch (type) {
    case 'boolean':
      return Boolean(value)
        ? '<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:#dcfce7;color:#15803d;border-radius:9999px;font-size:12px;font-weight:600"><span style="width:6px;height:6px;border-radius:50%;background:#16a34a;flex-shrink:0"></span>Yes</span>'
        : '<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:#fee2e2;color:#dc2626;border-radius:9999px;font-size:12px;font-weight:600"><span style="width:6px;height:6px;border-radius:50%;background:#dc2626;flex-shrink:0"></span>No</span>'

    case 'image':
      return `<img src="${esc(String(value))}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`

    case 'url': {
      const url = String(value)
      let domain = url
      try { domain = new URL(url).hostname } catch { /* */ }
      return `<a href="${esc(url)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:7px;padding:5px 12px;background:#EEF7FD;border:1px solid #D4ECF9;border-radius:8px;color:#0076AE;font-size:13px;font-weight:500;text-decoration:none">`
        + `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`
        + `${esc(domain)}</a>`
    }

    case 'email': {
      const email = String(value)
      return `<a href="mailto:${esc(email)}" style="display:inline-flex;align-items:center;gap:7px;padding:5px 12px;background:#EEF7FD;border:1px solid #D4ECF9;border-radius:8px;color:#0076AE;font-size:13px;font-weight:500;text-decoration:none">`
        + `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
        + `${esc(email)}</a>`
    }

    case 'color': {
      const hex = String(value)
      return `<div style="display:flex;align-items:center;gap:10px">`
        + `<span style="width:26px;height:26px;border-radius:6px;background:${esc(hex)};border:1px solid rgba(0,0,0,0.12);flex-shrink:0"></span>`
        + `<code style="font-family:ui-monospace,monospace;font-size:13px;color:#374151">${esc(hex)}</code>`
        + `</div>`
    }

    case 'date':
    case 'datetime':
      return `<span style="color:#374151">${esc(fmtDate(String(value)))}</span>`

    case 'number':
      return `<span style="color:#111827;font-variant-numeric:tabular-nums">${esc(String(value))}</span>`

    case 'select':
      return `<span style="display:inline-block;padding:3px 12px;background:#EEF7FD;color:#0076AE;border-radius:9999px;font-size:13px;font-weight:500">${esc(String(value))}</span>`

    case 'multiselect':
      if (!Array.isArray(value) || value.length === 0) return '<span style="color:#9CA3AF">—</span>'
      return (value as string[]).map((v) =>
        `<span style="display:inline-block;padding:3px 12px;background:#EEF7FD;color:#0076AE;border-radius:9999px;font-size:13px;font-weight:500;margin:0 4px 4px 0">${esc(v)}</span>`,
      ).join('')

    case 'textarea':
      return `<p style="white-space:pre-wrap;line-height:1.65;color:#374151;font-size:14px;margin:0">${esc(String(value))}</p>`

    default:
      return `<span style="color:#111827">${esc(String(value))}</span>`
  }
}

function renderWidget(item: LayoutItem, field: { name: string; type: string; referencedClassId?: number }, value: unknown, allClasses?: PimClass[]): string {
  const opts = item.displayOptions ?? {}
  const showLabel = opts.showLabel !== false && opts.labelPosition !== 'hidden'
  const labelPos = opts.labelPosition ?? 'top'
  const fontSize = ({ sm: '13px', md: '15px', lg: '18px', xl: '22px' })[opts.fontSize ?? 'md'] ?? '15px'

  const variantStyle = ({
    default:   'background:white;border:1px solid #D4ECF9',
    card:      'background:white;border:1px solid #D4ECF9;box-shadow:0 4px 14px rgba(0,0,0,0.07)',
    highlight: 'background:#EEF7FD;border:1px solid #A9D9F3',
    minimal:   'background:transparent;border:none',
  })[opts.variant ?? 'default'] ?? 'background:white;border:1px solid #D4ECF9'

  const labelHtml = showLabel
    ? `<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin-bottom:5px;line-height:1">${esc(field.name)}</div>`
    : ''

  // Image: no padding, fills the widget
  if (field.type === 'image') {
    return `<div style="${variantStyle};border-radius:12px;overflow:hidden;height:100%;display:flex;flex-direction:column">`
      + (showLabel ? `<div style="padding:10px 14px 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF">${esc(field.name)}</div>` : '')
      + `<div style="flex:1;min-height:0;overflow:hidden">${renderValue(field.type, value, allClasses, field.referencedClassId)}</div>`
      + `</div>`
  }

  // Label left (inline)
  if (labelPos === 'left' && showLabel) {
    return `<div style="${variantStyle};border-radius:12px;padding:10px 14px;height:100%;display:flex;align-items:center;gap:12px;overflow:hidden;font-size:${fontSize}">`
      + `<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;white-space:nowrap;flex-shrink:0">${esc(field.name)}</div>`
      + `<div style="flex:1;overflow:hidden">${renderValue(field.type, value, allClasses, field.referencedClassId)}</div>`
      + `</div>`
  }

  return `<div style="${variantStyle};border-radius:12px;padding:12px 14px;height:100%;overflow:hidden;font-size:${fontSize}">`
    + labelHtml
    + `<div>${renderValue(field.type, value, allClasses, field.referencedClassId)}</div>`
    + `</div>`
}

export function generateRecordHtml(record: PimRecord, pimClass: PimClass, view: View, allClasses?: PimClass[]): string {
  const columns = view.columns ?? 12
  const rowHeight = view.rowHeight ?? 60
  const gap = 10

  const visibleItems = view.layout.filter((item) =>
    pimClass.fields.find((f) => f.id === item.fieldId),
  )
  const totalRows = visibleItems.length
    ? Math.max(...visibleItems.map((i) => i.y + i.h))
    : 1

  const title = String(record.values[String(pimClass.fields[0]?.id)] ?? `Record #${record.id}`)
  const exportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const widgetsHtml = visibleItems.map((item) => {
    const field = pimClass.fields.find((f) => f.id === item.fieldId)!
    const value = record.values[String(item.fieldId)]
    return `      <div style="grid-column:${item.x + 1}/span ${item.w};grid-row:${item.y + 1}/span ${item.h}">`
      + renderWidget(item, field, value, allClasses)
      + `</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${esc(title)} — ${esc(pimClass.name)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Inter,system-ui,-apple-system,sans-serif;background:#F2F7FB;color:#111827;-webkit-font-smoothing:antialiased}
    @media print{body{background:white}header{position:static}}
  </style>
</head>
<body>

  <header style="background:#111827;position:sticky;top:0;z-index:10;box-shadow:0 1px 3px rgba(0,0,0,0.3)">
    <div style="max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:16px">
      <div style="min-width:0;flex:1">
        <div style="font-size:12px;color:#7EC5EC;font-weight:500;margin-bottom:3px">${esc(pimClass.name)}</div>
        <div style="font-size:17px;font-weight:700;color:white;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(title)}</div>
      </div>
      <div style="flex-shrink:0;text-align:right">
        <div style="font-size:11px;color:#4B5563;font-weight:500">${esc(view.name)}</div>
        <div style="font-size:11px;color:#6B7280;margin-top:2px">Exported ${esc(exportDate)}</div>
      </div>
    </div>
  </header>

  <div style="height:2px;background:#0095DA"></div>

  <main style="max-width:1200px;margin:0 auto;padding:28px 24px">
    <div style="display:grid;grid-template-columns:repeat(${columns},1fr);grid-template-rows:repeat(${totalRows},${rowHeight}px);gap:${gap}px">
${widgetsHtml}
    </div>
  </main>

</body>
</html>`
}

export function downloadRecordHtml(record: PimRecord, pimClass: PimClass, view: View, allClasses?: PimClass[]): void {
  const html = generateRecordHtml(record, pimClass, view, allClasses)
  const title = String(record.values[String(pimClass.fields[0]?.id)] ?? `record-${record.id}`)
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const filename = `${pimClass.name.toLowerCase()}-${slug}-${new Date().toISOString().slice(0, 10)}.html`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
