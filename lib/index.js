const Cloudflare = require('cloudflare')

async function getZoneId (api, name) {
  const zones = await api.zones.browse()

  for (const zone of zones.result) {
    if (zone.name === name) {
      return zone.id
    }
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getRecord (api, id, name) {
  const records = await api.dnsRecords.browse(id)

  console.log("Processing records: ")
  for (const record of records.result) {
    console.log(record);
    if (record.type === 'TXT' && record.name === name && record.content.startsWith('dnslink=')) {
      return record
    }
  }

  return null
}

async function update (apiOpts, { zone, link, record }) {
  const api = new Cloudflare(apiOpts)
  const id = await getZoneId(api, zone)
  const dnslink = `dnslink=${link}`
  const rec = await getRecord(api, id, record)

  if (rec) {
    await api.dnsRecords.del(id, rec.id)
  } 

  await api.dnsRecords.add(id, {
    type: 'TXT',
    name: record,
    content: dnslink
  })

  return dnslink
}

module.exports = update
