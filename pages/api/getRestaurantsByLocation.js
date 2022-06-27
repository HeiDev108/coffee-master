import { fetchRestaurants } from "../../lib/restaurants";

const getRestaurantsByLocation = async (req, res) => {
  try {
    const { latLong, limit } = req.query;
    const response = await fetchRestaurants(latLong, limit);

    res.status(200);
    res.json(response);
  } catch (err) {
    console.error("there is an error", err);
    res.status(500);
    res.json({message: 'Something went wrong', err});
  }
  
}

export default getRestaurantsByLocation;