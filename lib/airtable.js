const Airtable = require('airtable');

const base = new Airtable({ 
  apiKey: process.env.NEXT_AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
}).base(process.env.AIRTABLE_BASE_KEY);

const table = base("Restaurants");

const findRecordById = async (id) => {
  const records = await table.select({
    filterByFormula: `id="${id}"`
  }).firstPage();

  return getMinifiedRecords(records); 
};

const getMinifiedRecord = (record) => {
  return {
    recordId: record.id,
    ...record.fields,
  }
};

const getMinifiedRecords = (records) => {
  return records.map(record => getMinifiedRecord(record));
};

export { table, getMinifiedRecords, findRecordById };