import { table, getMinifiedRecords, findRecordById } from "../../lib/airtable";

const createCoffeeStore = async (req, res) => {
  if ( req.method === "POST") {
    const {id, name, address, neighbourhood, rating, imgUrl } = req.body;

    try {
      if (id) {
        // find if record exists
        const records = await findRecordById(id);

        if (records.length > 0) {
          res.json(records);
        } else {
          // doesn't exist, so create record
          if (name) {
            const createRecords = await table.create([
              {
                fields: {
                  id,
                  name,
                  address,
                  neighbourhood,
                  rating,
                  imgUrl,
                }
              }
            ]);
            const records = getMinifiedRecords(createRecords);
            res.json({ message: "created record ", records});
          } else {
            res.status(400);
            res.json({message: "name field is missing"})
          }
        }
      } else {
        res.status(400);
        res.json({message: "id field is missing"})
      }
    } catch(err) {
      console.log("error creating or finding store: ", err);
      res.status(500);
      res.json({message: "error creating or finding store", err});
    };
  };
}

export default createCoffeeStore;