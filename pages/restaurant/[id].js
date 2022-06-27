/* eslint-disable react-hooks/rules-of-hooks */
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import useSWR from "swr";

import { StoreContext } from "../../store/store-context";
import { fetchRestaurants } from "../../lib/restaurants";
import { isEmpty } from "../../utils";
import cls from "classnames";
import styles from "../../styles/restaurant.module.css";

// server side code, on getStaticPaths fallback will fetch data for non SSG (to make CSR page)
export async function getStaticProps({params}) {

  const restaurants = await fetchRestaurants();
  const findRestaurantById = restaurants.find((restaurant) => {
    return restaurant.id.toString() === params.id;
  });

  return {
    props: {
      store: findRestaurantById ? findRestaurantById : {},
    },
  };
}

// server side code, gets data for SSG
export async function getStaticPaths({params}) {
  const restaurants = await fetchRestaurants();

  const paths = restaurants.map(restaurant => {
    return {
      params: {
        id: restaurant.id.toString(),
      }
    }
  });
  return {
    paths,
    fallback: true,
  }
}

const Restaurant = (initialProps) => {
  // router is only available on client
  const router = useRouter();
  const id = router.query.id;
  const [store, setStore] = useState(initialProps.store || {});

  const {
    state: { stores },
  } = useContext(StoreContext);

  const handleCreateStore = async (storeToCreate) => {
    if (id) {
      try {
        const { id, name, address, neighbourhood, imgUrl } = storeToCreate;
        const response = await fetch('/api/createRestaurant', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id, 
            name, 
            address: address || "",
            neighbourhood: neighbourhood || "", 
            rating: 0, 
            imgUrl,
          }),
        });
        const dbStore = await response.json();
      } catch (err) {
        console.error('error creating store in airtable', err)
      }
    }
  }

  useEffect(() => { 
    // any time the ID changes, get the store details. 
    // If store details aren't found, create them in db so data is persistent for everyone
    if (isEmpty(initialProps.store)) {
      if (stores.length > 0) { 
        const storeFromContext = stores.find((restaurant) => {
          return restaurant.id.toString() === id;
        });

        if (storeFromContext) {
          setStore(storeFromContext);
          handleCreateStore(storeFromContext);
        }
      }
    } else {
      // statically generated page will have props. Still create page if doesn't exist in db for persistant upvotes.
      handleCreateStore(initialProps.store);
    }
  }, [id, initialProps, initialProps.store, stores]);

  const { address, neighbourhood, name, imgUrl } = store;
  const [ratingCount, setRatingCount] = useState(0);

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR(`/api/getRestaurantById?id=${id}`, fetcher, { initialData: ratingCount});

  useEffect(() => {
    if (data && data.length > 0) {
      setStore(data[0]);
      setRatingCount(data[0].rating)
    }
  }, [data])
  
  const handleUpvoteButton = async () => {
    try {
      const response = await fetch('/api/upvoteRestaurantStoreById', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id, 
        }),
      });
      const upvoteResponse = await response.json();

      if (upvoteResponse && upvoteResponse.length > 0) {
        const count = ratingCount + 1;
        setRatingCount(count);
      }
    } catch (err) {
      console.error('error upvoting store in airtable', err)
    }
  };

  if (!store || !store.id && !store.name) {
    return (
      <div className={styles.layout}>
        <div className={styles.loader}>Loading...</div>
      </div>
    )
  }
  if (error) {
    return <div>Something went wrong retrieving store page</div>;
  }
  
  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
        <meta name="description" content={`${name} store`}></meta>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a> &#8592; Back to Home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image 
            className={styles.storeImg} 
            src={imgUrl || "https://images.unsplash.com/photo-1513267048331-5611cad62e41?ixid=MnwyOTg3NTF8MHwxfHNlYXJjaHw3fHxjb2ZmZWUlMjBzaG9wfGVufDB8MHx8fDE2NDQzODYzNDc&ixlib=Drb-1.2.1"} 
            width={600} 
            height={360} 
            alt={name}
          />
        </div>
        <div className={cls('glass', styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/places.svg" width="24" height="24" alt="map icon"/>
            <p className={styles.text}>{address}</p>
          </div>
          { neighbourhood && (
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/nearMe.svg" width="24" height="24" alt="map icon"/>
            <p className={styles.text}>{neighbourhood}</p>
          </div> 
          )}
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/star.svg" width="24" height="24" alt="rating icon"/>
            <p className={styles.text}>{ratingCount}</p>
          </div>
          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>Upvote</button>
        </div>
      </div>
    </div>
  );
}

export default Restaurant;