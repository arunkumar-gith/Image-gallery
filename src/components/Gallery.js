import React, { useState, useEffect, useRef } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");
function PhotoList() {
  var [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const loader = useRef(null);
  const [savedQueries, setSavedQueries] = useState([]);

  const photosKey = "4a78f62a569c0f59bfa2247b9e22f3ad";
  const searchApiKey = "9d184f1e75b3c43b747c9e8a5e999379";

  const fetchPhotos = async () => {
    try {
      var resp = "";
      if (search) {
        setSavedQueries([...new Set([search, ...savedQueries])]);
        localStorage.setItem("savedQueries", JSON.stringify(savedQueries));

        resp = await axios.get(`https://www.flickr.com/services/rest/`, {
          params: {
            method: "flickr.photos.search",
            api_key: searchApiKey,
            text: search,
            safe_search: 3,
            format: "json",
            nojsoncallback: 1,
          },
        });
      } else {
        resp = await axios.get(`https://www.flickr.com/services/rest/`, {
          params: {
            method: "flickr.photos.getRecent",
            api_key: photosKey,

            safe_search: 3,
            format: "json",
            nojsoncallback: 1,
          },
        });
      }

      const photos = await resp.data.photos.photo;

      setPhotos(photos);
      setPage(page + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    fetchPhotos();
  };

  const onOpenModal = (photo) => {
    setModalPhoto(photo);
    setOpenModal(true);
  };

  const onCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    fetchPhotos();

    const storedQueries = JSON.parse(localStorage.getItem("savedQueries"));
    if (storedQueries) {
      setSavedQueries(storedQueries);
      console.log(storedQueries);
    }

    // Creating an intersection observer
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPhotos();
      }
    });

    // Start observing the loader element
    const loaderElement = loader.current;
    if (loaderElement) {
      observer.observe(loaderElement);
    }

    // Cleanup the observer
    return () => {
      if (loaderElement) {
        observer.unobserve(loaderElement);
      }
    };
  }, []);

  return (
    <>
      <div className="App">
        <header className="app-header">
          <h1 className="header-title">Search Photo</h1>
          <div className="search-bar-container">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <input
                type="text"
                placeholder="Search for photos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <div className="search-suggestions">
                  <ul>
                    {savedQueries.map((query, i) => (
                      <li key={i} onClick={() => setSearch(query)}>
                        {query}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </header>

        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="10px">
            {photos.map((photo, i) => (
              <img
                key={i}
                src={`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`}
                alt={`Photo by ${photo.author}`}
                style={{ width: "100%", display: "block", margin: "10px" }}
                onClick={() => onOpenModal(photo)}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>
        <div className="loader" ref={loader}>
          Loading...
        </div>

        {openModal && (
          <Modal
            isOpen={openModal}
            onRequestClose={() => setOpenModal(false)}
            style={{
              overlay: { backgroundColor: "rgba(128, 128, 128, 0.5)" },
              content: {
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",

                padding: 0,
              },
            }}
            center
          >
            <img
              src={`https://farm${modalPhoto.farm}.staticflickr.com/${modalPhoto.server}/${modalPhoto.id}_${modalPhoto.secret}.jpg`}
              alt={modalPhoto.title}
              onClick={onCloseModal}
              style={{ height: "80vh", width: "80vh" }}
            />
          </Modal>
        )}
      </div>
    </>
  );
}

export default PhotoList;
