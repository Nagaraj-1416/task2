import React, { useEffect, useRef, useState } from "react";

const GallerywithInfiniteScroll = () => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const targetRef = useRef(null);

  const fetchPosts = async (page, isFetchingFirstTime) => {
    try {
      setIsError(false);
      isFetchingFirstTime && setIsInitialFetch(true);

      const resPro = await fetch(
        `https://dummyjson.com/products?limit=${5}&skip=${(page - 1) * 5}`
      );

      const data = await resPro.json();

      if (data.products) {
        setData((prev) => {
          const newData = [...prev, ...data.products];

          if (newData.length < data.total) {
            setHasMore(true);
          } else setHasMore(false);

          return newData;
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setHasMore(false);
      setIsError(true);
    } finally {
      setIsInitialFetch(false);
    }
  };

  useEffect(() => {
    fetchPosts(pageRef.current, true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        pageRef.current = pageRef.current + 1;
        fetchPosts(pageRef.current);
      }
    });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [hasMore]);

  return (
    <div style={{ maxWidth: "1180px", padding: "20px", margin: "auto" }}>
      {isError ? (
        <div>Failed to fetch images from gallery</div>
      ) : isInitialFetch ? (
        <div>Loading Images...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            justifyContent: "center",
          }}>
          {data.map((el, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}>
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={el.images[0]}
                  alt={el.title}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={targetRef}>
          <div>Loading more images...</div>
        </div>
      )}
    </div>
  );
};

export default GallerywithInfiniteScroll;
