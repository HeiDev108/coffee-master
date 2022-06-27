// initialise unsplash
import { createApi } from "unsplash-js";

const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

const getListOfStorePhotos = async () => {
  const unsplashResults = await unsplashApi.search.getPhotos({
    query: 'restaurant',
    page: 1,
    perPage: 40,
    orientation: "landscape",
  });
  return unsplashResults.response.results.map(result => result.urls['small']);
}

const getPhotobyID = async (id) => {
  const foursquarePhotos = await getFoursquarePlacePhoto(id);
  if (foursquarePhotos.length > 0) {
    return `${foursquarePhotos[0].prefix}800x600${foursquarePhotos[0].suffix}`;
  }
  return null;
}

const getFoursquarePlacePhoto = async (id) => {

  const options = {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
    }
  };
  
  const response = await fetch(`https://api.foursquare.com/v3/places/${id}/photos?limit=10&sort=NEWEST`, options)
  
  return response.json();
}

export const fetchRestaurants = async (latLong = "-37.812176203787374,144.96234777516514", limit=8) => {
  const photos = await getListOfStorePhotos();
  const response = await fetch(
    `https://api.foursquare.com/v3/places/nearby?ll=${latLong}&query="restaurant"&limit=${limit}`,
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
      },
    }
  );
  const data = await response.json();
  
  // get photos for all stores from foursquare API. If photo doesn't exist, use unsplash as backup for generic photo.
    const storesData = await Promise.all(data.results.map(async (result, idx) => {
      const foursquarePhoto = await getPhotobyID(result.fsq_id);

      return {
        id: result.fsq_id,
        address: result.location.address || "",
        name: result.name,
        neighbourhood: result.location.neighbourhood || result.location.cross_street || "",
        imgUrl: foursquarePhoto || photos[idx],
      }
    }));
    return storesData;
}