import { table, findRecordById, getMinifiedRecords } from "../../lib/airtable";

const upvoteRestaurantById = async (req, res) => {
  if (req.method === "PUT") {

    try { 
      const { id } = req.body;
      if (id) {
        const records = await findRecordById(id);

        if (records.length > 0) {
          const record = records[0];
          const calculateUpvote = parseInt(record.rating) + parseInt(1);

          const updateRecord = await table.update([
            {
              id: record.recordId,
              fields: {
                rating: calculateUpvote,
              },
            },
          ]);

          if (updateRecord) {
            const minifiedRecords = getMinifiedRecords(updateRecord);
            res.json(minifiedRecords);
          }
        } else {
          res.json({message: "invalid ID", id});
        }
      } else {
        res.json({message: "id is missing"});
      }
    } catch (error) {
      res.status(500);
      res.json({message: "Error upvoting store", error})
    }
  } else {
    res.status(400);
    res.json({message: "invalid request method"})
  }
}

export default upvoteRestaurantById;