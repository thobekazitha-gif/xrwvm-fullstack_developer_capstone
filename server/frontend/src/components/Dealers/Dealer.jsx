import React, { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import Header from '../Header/Header';
import positive_icon from "./assets/positive.png";
import neutral_icon from "./assets/neutral.png";
import negative_icon from "./assets/negative.png";

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unauth, setUnauth] = useState(false);
  let params = useParams();
  let id = params.id;

  let dealer_url = `/djangoapp/dealer_details/${id}`;
  let reviews_url = `/djangoapp/reviews/dealer/${id}`;

  const get_dealer = async () => {
    const res = await fetch(dealer_url, { method: "GET" });
    const retobj = await res.json();
    if (retobj.status === 200) {
      setDealer(retobj.dealer);
    }
  };

  const get_reviews = async () => {
    const res = await fetch(reviews_url, { method: "GET" });
    const retobj = await res.json();
    if (retobj.status === 200) {
      if (retobj.reviews.length > 0) {
        setReviews(retobj.reviews);
      }
    }
  };

  const senti_icon = (sentiment) => {
    let icon = sentiment === "positive" ? positive_icon : sentiment === "negative" ? negative_icon : neutral_icon;
    return icon;
  };

  useLayoutEffect(() => {
    get_dealer();
    get_reviews();
    if (sessionStorage.getItem("username")) {
      setUnauth(false);
    } else {
      setUnauth(true);
    }
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>{dealer.full_name}{unauth ? "" : (
          <a href={`/postreview/${id}`}>
            <button className="btn btn-primary" style={{ marginLeft: "10px" }}>Post Review</button>
          </a>
        )}</h1>
        <h4 style={{ color: "grey" }}>{dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}</h4>
      </div>
      <div className="reviews_panel">
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map(review => (
            <div className='review_card' key={review.id}>
              <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment' />
              <div className='review'>{review.review}</div>
              <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dealer;