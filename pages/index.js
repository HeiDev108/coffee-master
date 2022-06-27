import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import Banner from '../components/banner';
import Card from '../components/card';

import { fetchRestaurants } from '../lib/restaurants';
import useTrackLocation from '../hooks/use-track-location';
import { useEffect, useState, useContext } from 'react';
import { ACTION_TYPES, StoreContext } from '../store/store-context';

// server side code
export async function getStaticProps(context) {
  
  const latLong = "-37.812176203787374,144.96234777516514";
  const limit = 8;
  const query = "restaurants";

  const restaurants = await fetchRestaurants(latLong, limit, query);

  return {
    props: {
      restaurants,
    },
  };
}

export default function Home(props) {
  // custom hook for getting geolocation
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } = useTrackLocation();
  const [storesError, setStoresError] = useState(null);
  const { dispatch, state } = useContext(StoreContext);
  const limit = 30;

  const { stores, latLong } = state;

  useEffect(() => {
    async function fetchData() {
      if(latLong) {
        try {
          const response = await fetch(`/api/getRestaurantsByLocation?latLong=${latLong}&limit=${limit}`)
          const stores = await response.json();
          dispatch({
            type: ACTION_TYPES.SET_STORES,
            payload: {
              stores,
            }
          });
          setStoresError('');
        } catch (error) {
          setStoresError(error.message);
        }
      }
    }
    fetchData();
  }, [latLong, dispatch]);

  const handleOnBannerButtonClick = () => {
    handleTrackLocation();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Restaurant Master</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="allows you to discover nearby restaurants" />

      </Head>

      <main className={styles.main}>
        <Banner 
          buttonText={isFindingLocation ? "Locating..." : "View stores nearby"} 
          handleOnClick={handleOnBannerButtonClick}
        />
        { locationErrorMsg && <p>Something went wrong: {locationErrorMsg} </p> }
        { storesError && <p>Something went wrong: {storesError} </p> }
        <div className={styles.heroImage}>
          <Image 
            src="/static/hero-image.png" 
            width={800} 
            height={350} 
            alt="hero" 
          />
        </div>

        { stores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Stores near me</h2>
            <div className={styles.cardLayout}>
              {stores.map((restaurant) => {
                return (
                  <Card 
                    className={styles.card}
                    key={restaurant.id}
                    name={restaurant.name} 
                    imgUrl={restaurant.imgUrl || imgUrl}
                    href={`/restaurant/${restaurant.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        { props.restaurants.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Melbourne Stores</h2>
            <div className={styles.cardLayout}>
              {props.restaurants.map((restaurant) => {
                return (
                  <Card 
                    className={styles.card}
                    key={restaurant.id}
                    name={restaurant.name} 
                    imgUrl={restaurant.imgUrl || imgUrl}
                    href={`/restaurant/${restaurant.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
