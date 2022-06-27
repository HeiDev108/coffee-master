import { findRecordById } from "../../lib/airtable";

const getRestaurantById = async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const records = await findRecordById(id);

      if (records.length > 0) {
        res.status(200);
        res.json(records);
      } else {
        res.json({message: `id not found`});
      }
    } else {
      res.status(400);
      res.json({message: `id ${id} missing`});
    }
    
  } catch (err) {
    res.status(500);
    res.json({message: "Something went wrong", err});
  }
};

export default getRestaurantById;